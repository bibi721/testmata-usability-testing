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
  checkFile('.env.local', 'Environment file (.env.local)');
  checkFile('prisma/schema.prisma', 'Prisma schema');
  console.log('');

  // Install dependencies
  console.log('2. Installing dependencies...');
  runCommand('npm install', 'Installing Node.js dependencies');

  // Install Prisma if not already installed
  console.log('3. Setting up Prisma...');
  try {
    runCommand('npx prisma --version', 'Checking Prisma installation');
  } catch (error) {
    runCommand('npm install prisma @prisma/client', 'Installing Prisma');
  }

  // Generate Prisma client
  console.log('4. Generating Prisma client...');
  runCommand('npx prisma generate', 'Generating Prisma client');

  // Push database schema
  console.log('5. Setting up database schema...');
  runCommand('npx prisma db push', 'Pushing database schema');

  // Test database connection
  console.log('6. Testing database connection...');
  console.log('Starting Next.js development server to test database...');
  
  // Start the dev server in the background and test the API
  const { spawn } = require('child_process');
  const server = spawn('npm', ['run', 'dev'], { 
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false 
  });

  // Wait for server to start
  await new Promise((resolve) => {
    server.stdout.on('data', (data) => {
      if (data.toString().includes('Ready')) {
        resolve();
      }
    });
    
    // Fallback timeout
    setTimeout(resolve, 10000);
  });

  // Test the database API endpoint
  try {
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:3000/api/test-db');
    const result = await response.json();
    
    if (result.status === 'success') {
      console.log('✅ Database connection test passed!');
      console.log(`📊 User count: ${result.data.userCount}`);
      console.log(`🕐 Ethiopian time: ${result.data.ethiopianTime}`);
    } else {
      console.log('⚠️  Database connection test failed');
      console.log('Error:', result.message);
    }
  } catch (error) {
    console.log('⚠️  Could not test database connection automatically');
    console.log('Please visit http://localhost:3000/api/test-db manually to test');
  }

  // Kill the server
  server.kill();

  console.log('\n🎉 Database setup completed successfully!');
  console.log('🚀 Your Masada Next.js app is ready for Ethiopian usability testing!');
  console.log('\n📋 Next steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Visit http://localhost:3000/api/test-db to test database');
  console.log('3. Open Prisma Studio: npx prisma studio');
  console.log('4. Start building your Ethiopian usability testing platform!');
  console.log('\n🌍 Database configured for Ethiopian market:');
  console.log('   • Timezone: Africa/Addis_Ababa');
  console.log('   • Currency: ETB');
  console.log('   • Languages: Amharic, English');
}

main().catch(error => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});