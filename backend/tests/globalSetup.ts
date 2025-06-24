/**
 * Global Test Setup
 * Runs once before all tests
 */

import { PrismaClient } from '@prisma/client';

export default async function globalSetup() {
  console.log('🧪 Setting up test environment...');
  
  // Initialize test database
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/masada_test',
      },
    },
  });

  try {
    // Run migrations on test database
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    console.log('✅ Test database initialized');
  } catch (error) {
    console.error('❌ Failed to initialize test database:', error);
  } finally {
    await prisma.$disconnect();
  }
}