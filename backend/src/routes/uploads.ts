/**
 * File Upload Routes
 * Handle file uploads for test assets and recordings
 */

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { config } from '@/config/environment';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { AuthenticatedRequest } from '@/middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Ensure upload directory exists
const uploadDir = config.upload.uploadPath;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.params.type || 'general';
    const typeDir = path.join(uploadDir, uploadType);
    
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
    
    cb(null, typeDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, `File type ${file.mimetype} is not allowed`));
    }
  },
});

/**
 * POST /api/v1/uploads/:type
 * Upload files by type (test-assets, recordings, avatars)
 */
router.post('/:type',
  upload.array('files', 10), // Allow up to 10 files
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { type } = req.params;
    const userId = req.user?.id;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new ApiError(400, 'No files uploaded');
    }

    const allowedTypes = ['test-assets', 'recordings', 'avatars', 'general'];
    if (!allowedTypes.includes(type)) {
      throw new ApiError(400, 'Invalid upload type');
    }

    const uploadedFiles = [];

    for (const file of files) {
      const fileUrl = `/uploads/${type}/${file.filename}`;
      
      // Save file info to database if user is authenticated
      if (userId && type === 'test-assets') {
        const testAsset = await prisma.testAsset.create({
          data: {
            testId: req.body.testId, // Should be provided in request
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
      } else {
        uploadedFiles.push({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          url: fileUrl,
        });
      }
    }

    logger.info('Files uploaded successfully', {
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
  })
);

/**
 * GET /api/v1/uploads/:type/:filename
 * Serve uploaded files
 */
router.get('/:type/:filename',
  asyncHandler(async (req, res) => {
    const { type, filename } = req.params;
    const filePath = path.join(uploadDir, type, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new ApiError(404, 'File not found');
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const mimeType = getMimeType(filename);

    // Set appropriate headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  })
);

/**
 * DELETE /api/v1/uploads/:type/:filename
 * Delete uploaded file
 */
router.delete('/:type/:filename',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { type, filename } = req.params;
    const userId = req.user?.id;
    const filePath = path.join(uploadDir, type, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new ApiError(404, 'File not found');
    }

    // For test assets, check ownership
    if (type === 'test-assets' && userId) {
      const testAsset = await prisma.testAsset.findFirst({
        where: { fileName: filename },
        include: {
          test: {
            select: { createdById: true },
          },
        },
      });

      if (testAsset && testAsset.test.createdById !== userId) {
        throw new ApiError(403, 'You can only delete your own files');
      }

      // Delete from database
      if (testAsset) {
        await prisma.testAsset.delete({
          where: { id: testAsset.id },
        });
      }
    }

    // Delete physical file
    fs.unlinkSync(filePath);

    logger.info('File deleted successfully', {
      userId,
      type,
      filename,
    });

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  })
);

/**
 * GET /api/v1/uploads/test-assets/:testId
 * Get all assets for a specific test
 */
router.get('/test-assets/:testId',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { testId } = req.params;
    const userId = req.user?.id;

    // Verify test ownership or tester access
    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: { createdById: true, status: true },
    });

    if (!test) {
      throw new ApiError(404, 'Test not found');
    }

    const userType = req.user?.userType;
    if (userType === 'CUSTOMER' && test.createdById !== userId) {
      throw new ApiError(403, 'You can only view assets for your own tests');
    }

    if (userType === 'TESTER' && test.status !== 'PUBLISHED') {
      throw new ApiError(403, 'Test is not available');
    }

    const assets = await prisma.testAsset.findMany({
      where: { testId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { assets },
    });
  })
);

/**
 * Helper function to determine MIME type from filename
 */
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
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

export default router;