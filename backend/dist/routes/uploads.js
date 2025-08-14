"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = require("@prisma/client");
const environment_1 = require("../config/environment");
const errorHandler_1 = require("../middleware/errorHandler");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const uploadDir = environment_1.config.upload.uploadPath;
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, _file, cb) => {
        const uploadType = req.params['type'] || 'general';
        const typeDir = path_1.default.join(uploadDir, uploadType);
        if (!fs_1.default.existsSync(typeDir)) {
            fs_1.default.mkdirSync(typeDir, { recursive: true });
        }
        cb(null, typeDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: environment_1.config.upload.maxFileSize,
    },
    fileFilter: (_req, file, cb) => {
        if (environment_1.config.upload.allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new errors_1.ApiError(400, `File type ${file.mimetype} is not allowed`));
        }
    },
});
router.post('/:type', upload.array('files', 10), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { type } = req.params;
    const userId = req.user?.id;
    const files = req.files;
    if (!files || files.length === 0) {
        throw new errors_1.ApiError(400, 'No files uploaded');
    }
    const allowedTypes = ['test-assets', 'recordings', 'avatars', 'general'];
    if (!allowedTypes.includes(type)) {
        throw new errors_1.ApiError(400, 'Invalid upload type');
    }
    const uploadedFiles = [];
    for (const file of files) {
        const fileUrl = `/uploads/${type}/${file.filename}`;
        if (userId && type === 'test-assets') {
            const testAsset = await prisma.testAsset.create({
                data: {
                    testId: req.body.testId,
                    fileName: file.filename,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    url: fileUrl,
                },
            });
            uploadedFiles.push({
                id: testAsset.id,
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
                url: fileUrl,
            });
        }
        else {
            uploadedFiles.push({
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
                url: fileUrl,
            });
        }
    }
    logger_1.logger.info('Files uploaded successfully', {
        userId,
        type,
        fileCount: files.length,
        files: uploadedFiles.map(f => ({ name: f.originalName, size: f.size })),
    });
    res.status(201).json({
        success: true,
        message: 'Files uploaded successfully',
        data: { files: uploadedFiles },
    });
}));
router.get('/:type/:filename', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { type, filename } = req.params;
    const filePath = path_1.default.join(uploadDir, type, filename);
    if (!fs_1.default.existsSync(filePath)) {
        throw new errors_1.ApiError(404, 'File not found');
    }
    const stats = fs_1.default.statSync(filePath);
    const mimeType = getMimeType(filename);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    const fileStream = fs_1.default.createReadStream(filePath);
    fileStream.pipe(res);
}));
router.delete('/:type/:filename', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { type, filename } = req.params;
    const userId = req.user?.id;
    const filePath = path_1.default.join(uploadDir, type, filename);
    if (!fs_1.default.existsSync(filePath)) {
        throw new errors_1.ApiError(404, 'File not found');
    }
    if (type === 'test-assets' && userId) {
        const testAsset = await prisma.testAsset.findFirst({
            where: { fileName: filename },
            include: {
                test: true,
            },
        });
        if (testAsset && testAsset.test.createdById !== userId) {
            throw new errors_1.ApiError(403, 'You can only delete your own files');
        }
        if (testAsset) {
            await prisma.testAsset.delete({
                where: { id: testAsset.id },
            });
        }
    }
    fs_1.default.unlinkSync(filePath);
    logger_1.logger.info('File deleted successfully', {
        userId,
        type,
        filename,
    });
    res.json({
        success: true,
        message: 'File deleted successfully',
    });
}));
router.get('/test-assets/:testId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { testId } = req.params;
    const userId = req.user?.id;
    const test = await prisma.test.findUnique({
        where: { id: testId },
        select: { createdById: true, status: true },
    });
    if (!test) {
        throw new errors_1.ApiError(404, 'Test not found');
    }
    const userType = req.user?.userType;
    if (userType === 'CUSTOMER' && test.createdById !== userId) {
        throw new errors_1.ApiError(403, 'You can only view assets for your own tests');
    }
    if (userType === 'TESTER' && test.status !== 'PUBLISHED') {
        throw new errors_1.ApiError(403, 'Test is not available');
    }
    const assets = await prisma.testAsset.findMany({
        where: { testId: testId },
        orderBy: { createdAt: 'desc' },
    });
    res.json({
        success: true,
        data: { assets },
    });
}));
function getMimeType(filename) {
    const ext = path_1.default.extname(filename).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
    };
    return mimeTypes[ext] || 'application/octet-stream';
}
exports.default = router;
//# sourceMappingURL=uploads.js.map