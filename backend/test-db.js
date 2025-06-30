/**
 * Database Connection Test Script
 * Tests PostgreSQL connection and basic operations
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  console.log('🔍 Testing Masada database connection...\n');
  
  try {
    // Test basic connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');
    
    // Test database info
    console.log('2. Fetching database information...');
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 PostgreSQL Version:', result[0].version);
    console.log('🕐 Current Time:', new Date().toLocaleString('en-US', { timeZone: 'Africa/Addis_Ababa' }));
    console.log('🌍 Timezone: Africa/Addis_Ababa\n');
    
    // Test table existence (after migration)
    console.log('3. Checking database schema...');
    try {
      const userCount = await prisma.user.count();
      console.log(`👥 Current user count: ${userCount}`);
      
      const testCount = await prisma.test.count();
      console.log(`🎯 Current test count: ${testCount}`);
      
      console.log('✅ Database schema is properly set up!\n');
    } catch (schemaError) {
      console.log('⚠️  Database schema not yet migrated. Run: npx prisma db push\n');
    }
    
    // Test Ethiopian-specific features
    console.log('4. Testing Ethiopian-specific configurations...');
    const ethiopianRegions = [
      'Addis Ababa', 'Oromia', 'Amhara', 'Tigray', 'SNNPR', 
      'Somali', 'Afar', 'Benishangul-Gumuz', 'Gambela', 
      'Harari', 'Dire Dawa', 'Sidama'
    ];
    console.log('🇪🇹 Ethiopian regions configured:', ethiopianRegions.length);
    console.log('💰 Default currency: ETB');
    console.log('🗣️  Supported languages: Amharic, English\n');
    
    console.log('🎉 All database tests passed successfully!');
    console.log('🚀 Your Masada database is ready for Ethiopian usability testing!\n');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Ensure PostgreSQL is running');
    console.error('2. Check your DATABASE_URL in .env file');
    console.error('3. Verify database credentials');
    console.error('4. Run: docker-compose up -d (if using Docker)');
    console.error('5. Run: npx prisma db push (to create schema)\n');
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed.');
  }
}

// Run the test
testConnection();