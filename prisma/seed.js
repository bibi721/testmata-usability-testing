/**
 * Database Seeding Script
 * Populate database with sample data for development
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Main seeding function
 */
async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@masada.et' },
      update: {},
      create: {
        email: 'admin@masada.et',
        password: hashedPassword,
        name: 'Masada Admin',
        userType: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Create customer users
    const customers = await Promise.all([
      prisma.user.upsert({
        where: { email: 'dawit@techstartup.et' },
        update: {},
        create: {
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
      prisma.user.upsert({
        where: { email: 'meron@ecommerce.et' },
        update: {},
        create: {
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
    ]);

    // Create tester users
    const ethiopianNames = [
      { name: 'Almaz Tadesse', city: 'Addis Ababa', region: 'Addis Ababa' },
      { name: 'Bereket Wolde', city: 'Dire Dawa', region: 'Dire Dawa' },
      { name: 'Chaltu Bekele', city: 'Mekelle', region: 'Tigray' },
    ];

    const testers = await Promise.all(
      ethiopianNames.map(async (person) => {
        const email = `${person.name.toLowerCase().replace(' ', '.')}@gmail.com`;
        
        return prisma.user.upsert({
          where: { email },
          update: {},
          create: {
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
                rating: Math.random() * 2 + 3, // 3-5 rating
                completedTests: Math.floor(Math.random() * 20),
                totalEarnings: Math.floor(Math.random() * 500),
                level: ['NEW_TESTER', 'BRONZE', 'SILVER', 'GOLD'][Math.floor(Math.random() * 4)],
                isVerified: true,
                verifiedAt: new Date(),
              },
            },
          },
        });
      })
    );

    // Create test templates
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
    ];

    // Create tests
    for (let i = 0; i < testTemplates.length; i++) {
      const template = testTemplates[i];
      const customer = customers[i % customers.length];
      
      await prisma.test.create({
        data: {
          ...template,
          createdById: customer.id,
          status: i === 0 ? 'PUBLISHED' : 'DRAFT',
          publishedAt: i === 0 ? new Date() : null,
        },
      });
    }

    console.log(`✅ Created ${1 + customers.length + testers.length} users`);
    console.log(`✅ Created ${testTemplates.length} tests`);
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Execute seeding
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });