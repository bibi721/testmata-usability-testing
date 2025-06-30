#!/usr/bin/env node

/**
 * Database Setup Script for Next.js Masada Project
 * Automates the database setup process for Next.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🇪🇹 Setting up Masada database for Next.js...\n');

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
  // Check if we're in the project root
  if (!fs.existsSync('package.json')) {
    console.error('❌ Please run this script from the project root directory');
    process.exit(1);
  }

  // Check for required files
  console.log('1. Checking required files...');
  
  // Check if .env.local exists, if not copy from example
  if (!fs.existsSync('.env.local')) {
    if (fs.existsSync('.env.local.example')) {
      console.log('⚠️ .env.local not found, creating from example...');
      fs.copyFileSync('.env.local.example', '.env.local');
      console.log('✅ Created .env.local from example');
    } else {
      console.error('❌ .env.local and .env.local.example not found');
      console.error('Please create .env.local with your database configuration');
      process.exit(1);
    }
  } else {
    console.log('✅ Environment file (.env.local) found');
  }
  
  checkFile('prisma/schema.prisma', 'Prisma schema');
  console.log('');

  // Check if Docker is installed
  console.log('2. Checking Docker installation...');
  try {
    execSync('docker --version', { stdio: 'pipe' });
    console.log('✅ Docker is installed');
    
    // Check if Docker is running
    execSync('docker info', { stdio: 'pipe' });
    console.log('✅ Docker is running');
    
    // Ask if user wants to start PostgreSQL with Docker
    console.log('\nDo you want to start PostgreSQL with Docker? (y/n)');
    const startDocker = process.stdin.read(1)?.toString().toLowerCase() === 'y';
    
    if (startDocker) {
      console.log('3. Starting PostgreSQL with Docker...');
      runCommand('docker-compose up -d', 'Starting PostgreSQL container');
    }
  } catch (error) {
    console.log('⚠️ Docker not available or not running');
    console.log('Please ensure your PostgreSQL database is running manually');
  }
  console.log('');

  // Install dependencies
  console.log('3. Installing dependencies...');
  runCommand('npm install', 'Installing Node.js dependencies');

  // Generate Prisma client
  console.log('4. Generating Prisma client...');
  runCommand('npx prisma generate', 'Generating Prisma client');

  // Push database schema
  console.log('5. Setting up database schema...');
  runCommand('npx prisma db push', 'Pushing database schema');

  // Seed the database
  console.log('6. Seeding database with sample data...');
  try {
    runCommand('node prisma/seed.js', 'Seeding database');
  } catch (error) {
    console.log('⚠️ Database seeding failed. You can try again later with: node prisma/seed.js');
  }

  console.log('\n🎉 Database setup completed successfully!');
  console.log('🚀 Your Masada Next.js app is ready for Ethiopian usability testing!');
  console.log('\n📋 Next steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Visit http://localhost:3000/api/test-db to test database');
  console.log('3. Open Prisma Studio: npx prisma studio');
  console.log('4. Start building your Ethiopian usability testing platform!');
}

main().catch(error => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});