#!/usr/bin/env node

/**
 * Database Setup Script for Masada
 * Automates the database setup process
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🇪🇹 Setting up Masada database for Ethiopian usability testing...\n');

function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function checkFile(filePath, description) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${description} not found at: ${filePath}`);
    console.error('Please create this file first.');
    process.exit(1);
  }
  console.log(`✅ ${description} found`);
}

async function main() {
  // Check if we're in the backend directory
  if (!fs.existsSync('package.json')) {
    console.error('❌ Please run this script from the backend directory');
    process.exit(1);
  }

  // Check for required files
  console.log('1. Checking required files...');
  checkFile('.env', 'Environment file (.env)');
  checkFile('prisma/schema.prisma', 'Prisma schema');
  console.log('');

  // Install dependencies
  console.log('2. Installing dependencies...');
  runCommand('npm install', 'Installing Node.js dependencies');

  // Generate Prisma client
  console.log('3. Generating Prisma client...');
  runCommand('npx prisma generate', 'Generating Prisma client');

  // Push database schema
  console.log('4. Setting up database schema...');
  runCommand('npx prisma db push', 'Pushing database schema');

  // Test database connection
  console.log('5. Testing database connection...');
  runCommand('node test-db.js', 'Testing database connection');

  // Optional: Seed database
  console.log('6. Seeding database (optional)...');
  try {
    runCommand('npm run db:seed', 'Seeding database with sample data');
  } catch (error) {
    console.log('⚠️  Database seeding skipped (seed script not found or failed)');
    console.log('You can run "npm run db:seed" later to add sample data\n');
  }

  console.log('🎉 Database setup completed successfully!');
  console.log('🚀 Your Masada database is ready for Ethiopian usability testing!');
  console.log('\n📋 Next steps:');
  console.log('1. Start the backend server: npm run dev');
  console.log('2. Open Prisma Studio: npx prisma studio');
  console.log('3. Start building your Ethiopian usability testing platform!');
}

main().catch(error => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});