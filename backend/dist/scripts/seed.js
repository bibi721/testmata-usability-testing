"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = require("../utils/logger");
const environment_1 = require("../config/environment");
const prisma = new client_1.PrismaClient();
async function main() {
    logger_1.logger.info('🌱 Starting database seeding...');
    try {
        if (environment_1.config.nodeEnv === 'development') {
            await clearDatabase();
        }
        await seedUsers();
        await seedTests();
        await seedTestSessions();
        await seedPayments();
        await seedAnalytics();
        await seedSystemConfig();
        logger_1.logger.info('✅ Database seeding completed successfully!');
    }
    catch (error) {
        logger_1.logger.error('❌ Database seeding failed:', error);
        throw error;
    }
}
async function clearDatabase() {
    logger_1.logger.info('🧹 Clearing existing data...');
    const tablenames = await prisma.$queryRaw `
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;
    for (const { tablename } of tablenames) {
        if (tablename !== '_prisma_migrations') {
            try {
                await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
            }
            catch (error) {
                logger_1.logger.warn(`Failed to truncate ${tablename}:`, error);
            }
        }
    }
    logger_1.logger.info('✅ Database cleared');
}
async function seedUsers() {
    logger_1.logger.info('👥 Seeding users...');
    const hashedPassword = await bcryptjs_1.default.hash('password123', environment_1.config.security.bcryptRounds);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@masada.et',
            password: hashedPassword,
            name: 'Masada Admin',
            userType: 'ADMIN',
            status: 'ACTIVE',
            emailVerified: true,
            emailVerifiedAt: new Date(),
        },
    });
    const customers = await Promise.all([
        prisma.user.create({
            data: {
                email: 'dawit@techstartup.et',
                password: hashedPassword,
                name: 'Dawit Hailu',
                userType: 'CUSTOMER',
                status: 'ACTIVE',
                emailVerified: true,
                emailVerifiedAt: new Date(),
                customerProfile: {
                    create: {
                        company: 'Ethiopian FinTech Solutions',
                        website: 'https://fintech.et',
                        industry: 'Financial Technology',
                        companySize: '11-50',
                        plan: 'professional',
                        testsCreated: 0,
                        totalSpent: 0,
                    },
                },
            },
        }),
        prisma.user.create({
            data: {
                email: 'meron@ecommerce.et',
                password: hashedPassword,
                name: 'Meron Teshome',
                userType: 'CUSTOMER',
                status: 'ACTIVE',
                emailVerified: true,
                emailVerifiedAt: new Date(),
                customerProfile: {
                    create: {
                        company: 'Addis E-Commerce',
                        website: 'https://addisecommerce.et',
                        industry: 'E-commerce',
                        companySize: '1-10',
                        plan: 'starter',
                        testsCreated: 0,
                        totalSpent: 0,
                    },
                },
            },
        }),
        prisma.user.create({
            data: {
                email: 'samuel@edtech.et',
                password: hashedPassword,
                name: 'Samuel Bekele',
                userType: 'CUSTOMER',
                status: 'ACTIVE',
                emailVerified: true,
                emailVerifiedAt: new Date(),
                customerProfile: {
                    create: {
                        company: 'EdTech Ethiopia',
                        website: 'https://edtech.et',
                        industry: 'Education Technology',
                        companySize: '11-50',
                        plan: 'professional',
                        testsCreated: 0,
                        totalSpent: 0,
                    },
                },
            },
        }),
    ]);
    const ethiopianNames = [
        { name: 'Almaz Tadesse', city: 'Addis Ababa', region: 'Addis Ababa' },
        { name: 'Bereket Wolde', city: 'Dire Dawa', region: 'Dire Dawa' },
        { name: 'Chaltu Bekele', city: 'Mekelle', region: 'Tigray' },
        { name: 'Daniel Girma', city: 'Bahir Dar', region: 'Amhara' },
        { name: 'Eden Mulugeta', city: 'Hawassa', region: 'SNNPR' },
        { name: 'Fikadu Tesfaye', city: 'Addis Ababa', region: 'Addis Ababa' },
        { name: 'Genet Alemu', city: 'Gondar', region: 'Amhara' },
        { name: 'Henok Desta', city: 'Jimma', region: 'Oromia' },
        { name: 'Iman Ahmed', city: 'Harar', region: 'Harari' },
        { name: 'Kalkidan Mekonnen', city: 'Addis Ababa', region: 'Addis Ababa' },
    ];
    const testers = await Promise.all(ethiopianNames.map(async (person, index) => {
        const email = `${person.name.toLowerCase().replace(' ', '.')}@gmail.com`;
        return prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: person.name,
                userType: 'TESTER',
                status: 'ACTIVE',
                emailVerified: true,
                emailVerifiedAt: new Date(),
                testerProfile: {
                    create: {
                        phone: `+251${Math.floor(Math.random() * 900000000) + 100000000}`,
                        city: person.city,
                        region: person.region,
                        age: ['18-24', '25-34', '35-44', '45-54'][Math.floor(Math.random() * 4)],
                        education: ['High School', 'Diploma', 'Bachelor\'s Degree', 'Master\'s Degree'][Math.floor(Math.random() * 4)],
                        occupation: ['Student', 'Teacher', 'Engineer', 'Business Owner', 'Government Employee'][Math.floor(Math.random() * 5)],
                        experience: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
                        languages: Math.random() > 0.5 ? ['Amharic', 'English'] : ['Amharic'],
                        devices: [
                            'Smartphone (Android)',
                            Math.random() > 0.7 ? 'Smartphone (iPhone)' : null,
                            Math.random() > 0.6 ? 'Laptop' : null,
                            Math.random() > 0.8 ? 'Desktop Computer' : null,
                        ].filter(Boolean),
                        internetSpeed: ['Slow', 'Medium', 'Fast'][Math.floor(Math.random() * 3)],
                        availability: ['1-5', '6-10', '11-20'][Math.floor(Math.random() * 3)],
                        motivation: 'I want to help improve Ethiopian digital products and earn extra income.',
                        rating: Math.random() * 2 + 3,
                        completedTests: Math.floor(Math.random() * 20),
                        totalEarnings: Math.floor(Math.random() * 500),
                        level: ['NEW_TESTER', 'BRONZE', 'SILVER', 'GOLD'][Math.floor(Math.random() * 4)],
                        isVerified: true,
                        verifiedAt: new Date(),
                    },
                },
            },
        });
    }));
    logger_1.logger.info(`✅ Created ${1 + customers.length + testers.length} users`);
    return { admin, customers, testers };
}
async function seedTests() {
    logger_1.logger.info('🎯 Seeding tests...');
    const customers = await prisma.user.findMany({
        where: { userType: 'CUSTOMER' },
        include: { customerProfile: true },
    });
    const testTemplates = [
        {
            title: 'Mobile Banking App Usability Test',
            description: 'Test the usability of our new mobile banking application with Ethiopian users',
            instructions: 'Please test the login, account balance check, and money transfer features',
            testType: 'USABILITY',
            platform: 'MOBILE_APP',
            targetUrl: 'https://banking-app.et',
            maxTesters: 10,
            paymentPerTester: 25,
            estimatedDuration: 30,
            requirements: ['Mobile device', 'Banking experience', 'Amharic fluency'],
            tasks: {
                tasks: [
                    { id: 1, title: 'Login to the app', description: 'Use the provided credentials to log in' },
                    { id: 2, title: 'Check account balance', description: 'Navigate to account balance section' },
                    { id: 3, title: 'Transfer money', description: 'Transfer 100 ETB to another account' },
                    { id: 4, title: 'Find customer support', description: 'Locate customer support contact information' },
                ],
            },
            demographics: {
                ageRange: ['25-34', '35-44'],
                education: ['Bachelor\'s Degree', 'Master\'s Degree'],
                regions: ['Addis Ababa', 'Dire Dawa'],
            },
        },
        {
            title: 'E-commerce Website Navigation Test',
            description: 'Evaluate the navigation and checkout process of our e-commerce platform',
            instructions: 'Browse products, add items to cart, and complete the checkout process',
            testType: 'USABILITY',
            platform: 'WEB',
            targetUrl: 'https://shop.et',
            maxTesters: 15,
            paymentPerTester: 20,
            estimatedDuration: 25,
            requirements: ['Desktop/Laptop', 'Online shopping experience'],
            tasks: {
                tasks: [
                    { id: 1, title: 'Browse products', description: 'Look for electronics category' },
                    { id: 2, title: 'Add to cart', description: 'Add 2 different products to cart' },
                    { id: 3, title: 'Checkout process', description: 'Complete the checkout without payment' },
                    { id: 4, title: 'Find shipping info', description: 'Locate shipping and delivery information' },
                ],
            },
            demographics: {
                ageRange: ['18-24', '25-34', '35-44'],
                education: ['High School', 'Diploma', 'Bachelor\'s Degree'],
                regions: ['Addis Ababa', 'Bahir Dar', 'Hawassa'],
            },
        },
        {
            title: 'Educational Platform User Experience',
            description: 'Test the user experience of our online learning platform',
            instructions: 'Explore courses, enroll in a course, and complete a lesson',
            testType: 'USABILITY',
            platform: 'WEB',
            targetUrl: 'https://learn.et',
            maxTesters: 12,
            paymentPerTester: 18,
            estimatedDuration: 35,
            requirements: ['Computer access', 'Education interest', 'English proficiency'],
            tasks: {
                tasks: [
                    { id: 1, title: 'Browse courses', description: 'Find technology-related courses' },
                    { id: 2, title: 'Course enrollment', description: 'Enroll in a free course' },
                    { id: 3, title: 'Complete lesson', description: 'Complete the first lesson' },
                    { id: 4, title: 'Find progress', description: 'Locate your learning progress' },
                ],
            },
            demographics: {
                ageRange: ['18-24', '25-34'],
                education: ['High School', 'Diploma', 'Bachelor\'s Degree'],
                regions: ['Addis Ababa', 'Mekelle', 'Gondar'],
            },
        },
    ];
    const tests = [];
    for (let i = 0; i < testTemplates.length; i++) {
        const template = testTemplates[i];
        const customer = customers[i % customers.length];
        const test = await prisma.test.create({
            data: {
                ...template,
                createdById: customer.id,
                status: i === 0 ? 'PUBLISHED' : i === 1 ? 'RUNNING' : 'COMPLETED',
                publishedAt: i === 0 ? new Date() : i === 1 ? new Date(Date.now() - 86400000) : new Date(Date.now() - 172800000),
                completedAt: i === 2 ? new Date(Date.now() - 86400000) : null,
                currentTesters: i === 1 ? 8 : 0,
            },
        });
        tests.push(test);
    }
    logger_1.logger.info(`✅ Created ${tests.length} tests`);
    return tests;
}
async function seedTestSessions() {
    logger_1.logger.info('🔄 Seeding test sessions...');
    const tests = await prisma.test.findMany();
    const testers = await prisma.user.findMany({
        where: { userType: 'TESTER' },
        include: { testerProfile: true },
    });
    let totalSessions = 0;
    for (const test of tests) {
        if (test.status === 'COMPLETED' || test.status === 'RUNNING') {
            const testSession = await prisma.testSession.create({
                data: {
                    testId: test.id,
                    customerId: test.createdById,
                    status: test.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
                    startedAt: new Date(Date.now() - Math.random() * 172800000),
                    completedAt: test.status === 'COMPLETED' ? new Date(Date.now() - Math.random() * 86400000) : null,
                },
            });
            const sessionCount = test.status === 'COMPLETED' ? test.maxTesters : Math.floor(test.maxTesters * 0.8);
            const selectedTesters = testers.slice(0, sessionCount);
            for (const tester of selectedTesters) {
                const startTime = new Date(Date.now() - Math.random() * 172800000);
                const duration = Math.floor(Math.random() * 1800) + 600;
                const isCompleted = test.status === 'COMPLETED' || Math.random() > 0.2;
                const testerSession = await prisma.testerSession.create({
                    data: {
                        testSessionId: testSession.id,
                        testId: test.id,
                        testerId: tester.id,
                        status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
                        startedAt: startTime,
                        completedAt: isCompleted ? new Date(startTime.getTime() + duration * 1000) : null,
                        duration: isCompleted ? duration : null,
                        rating: isCompleted ? Math.floor(Math.random() * 2) + 4 : null,
                        feedback: isCompleted ? generateRandomFeedback() : null,
                        screenRecording: isCompleted ? `https://recordings.masada.et/${test.id}/${tester.id}.mp4` : null,
                        taskResults: isCompleted ? generateTaskResults(test.tasks) : null,
                        deviceInfo: {
                            userAgent: 'Mozilla/5.0 (Mobile; Ethiopian User)',
                            deviceType: Math.random() > 0.7 ? 'desktop' : 'mobile',
                            screenResolution: Math.random() > 0.5 ? '1920x1080' : '375x667',
                        },
                    },
                });
                if (isCompleted) {
                    await prisma.earning.create({
                        data: {
                            testerId: tester.id,
                            testerSessionId: testerSession.id,
                            amount: test.paymentPerTester,
                            description: `Payment for completing test: ${test.title}`,
                            status: 'COMPLETED',
                            paidAt: new Date(),
                        },
                    });
                }
                totalSessions++;
            }
        }
    }
    logger_1.logger.info(`✅ Created ${totalSessions} tester sessions`);
}
async function seedPayments() {
    logger_1.logger.info('💳 Seeding payments...');
    const customers = await prisma.user.findMany({
        where: { userType: 'CUSTOMER' },
    });
    const paymentMethods = ['CHAPA', 'TELEBIRR', 'CBE_BIRR', 'CREDIT_CARD'];
    let totalPayments = 0;
    for (const customer of customers) {
        const paymentCount = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < paymentCount; i++) {
            const amount = Math.floor(Math.random() * 500) + 100;
            const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
            const isCompleted = Math.random() > 0.1;
            await prisma.payment.create({
                data: {
                    customerId: customer.id,
                    amount,
                    currency: 'ETB',
                    method,
                    status: isCompleted ? 'COMPLETED' : 'FAILED',
                    description: `Payment for usability testing services`,
                    transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    paidAt: isCompleted ? new Date(Date.now() - Math.random() * 2592000000) : null,
                    metadata: {
                        provider: method.toLowerCase(),
                        currency: 'ETB',
                    },
                },
            });
            totalPayments++;
        }
    }
    logger_1.logger.info(`✅ Created ${totalPayments} payments`);
}
async function seedAnalytics() {
    logger_1.logger.info('📊 Seeding analytics...');
    const tests = await prisma.test.findMany();
    const users = await prisma.user.findMany();
    const events = ['test_started', 'test_completed', 'device_info', 'location_info', 'task_completed'];
    let totalEvents = 0;
    for (const test of tests) {
        const eventCount = Math.floor(Math.random() * 50) + 20;
        for (let i = 0; i < eventCount; i++) {
            const event = events[Math.floor(Math.random() * events.length)];
            const user = users[Math.floor(Math.random() * users.length)];
            await prisma.analytics.create({
                data: {
                    testId: test.id,
                    userId: user.id,
                    event,
                    data: generateEventData(event),
                    timestamp: new Date(Date.now() - Math.random() * 2592000000),
                    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
                    userAgent: 'Mozilla/5.0 (Ethiopian User)',
                },
            });
            totalEvents++;
        }
    }
    logger_1.logger.info(`✅ Created ${totalEvents} analytics events`);
}
async function seedSystemConfig() {
    logger_1.logger.info('⚙️ Seeding system configuration...');
    const configs = [
        {
            key: 'platform_name',
            value: 'Masada',
            description: 'Platform name',
        },
        {
            key: 'default_currency',
            value: 'ETB',
            description: 'Default currency for payments',
        },
        {
            key: 'supported_languages',
            value: 'en,am',
            description: 'Supported languages (comma-separated)',
        },
        {
            key: 'max_file_size',
            value: '10485760',
            description: 'Maximum file upload size in bytes',
        },
        {
            key: 'test_session_timeout',
            value: '3600',
            description: 'Test session timeout in seconds',
        },
        {
            key: 'minimum_payout',
            value: '50',
            description: 'Minimum payout amount for testers',
        },
    ];
    for (const config of configs) {
        await prisma.systemConfig.create({
            data: config,
        });
    }
    logger_1.logger.info(`✅ Created ${configs.length} system configurations`);
}
function generateRandomFeedback() {
    const feedbacks = [
        'The app is easy to use and intuitive. I like the clean design.',
        'Navigation is smooth but the payment process could be clearer.',
        'Great user experience overall. The Amharic translation is helpful.',
        'Some buttons are too small on mobile. Otherwise, good functionality.',
        'Loading times are acceptable. The interface is user-friendly.',
        'I had trouble finding the help section. Everything else worked well.',
        'The app works well but needs better error messages.',
        'Excellent design and functionality. Very impressed with the quality.',
    ];
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
}
function generateTaskResults(tasks) {
    if (!tasks || !tasks.tasks)
        return {};
    const results = {};
    tasks.tasks.forEach((task) => {
        results[task.id] = {
            completed: Math.random() > 0.2,
            timeSpent: Math.floor(Math.random() * 300) + 30,
            difficulty: Math.floor(Math.random() * 5) + 1,
        };
    });
    return results;
}
function generateEventData(event) {
    switch (event) {
        case 'device_info':
            return {
                deviceType: Math.random() > 0.7 ? 'desktop' : 'mobile',
                browser: Math.random() > 0.5 ? 'Chrome' : 'Firefox',
                os: Math.random() > 0.6 ? 'Android' : 'Windows',
            };
        case 'location_info':
            const cities = ['Addis Ababa', 'Dire Dawa', 'Mekelle', 'Bahir Dar', 'Hawassa'];
            return {
                city: cities[Math.floor(Math.random() * cities.length)],
                country: 'Ethiopia',
            };
        case 'task_completed':
            return {
                taskId: Math.floor(Math.random() * 4) + 1,
                timeSpent: Math.floor(Math.random() * 300) + 30,
                success: Math.random() > 0.2,
            };
        default:
            return {
                timestamp: new Date().toISOString(),
                success: Math.random() > 0.1,
            };
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map