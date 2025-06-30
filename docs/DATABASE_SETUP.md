# PostgreSQL Database Setup Guide for Masada

This guide will help you set up a PostgreSQL database for your Ethiopian usability testing platform.

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Production Database Options](#production-database-options)
3. [Environment Configuration](#environment-configuration)
4. [Database Migration](#database-migration)
5. [Troubleshooting](#troubleshooting)

## Local Development Setup

### Option 1: Using Docker (Recommended)

1. **Install Docker** if you haven't already:
   - Download from [docker.com](https://www.docker.com/products/docker-desktop)

2. **Create a Docker Compose file** for PostgreSQL:

```yaml
# docker-compose.yml (in your backend directory)
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: masada_postgres
    environment:
      POSTGRES_DB: masada_db
      POSTGRES_USER: masada_user
      POSTGRES_PASSWORD: masada_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:
```

3. **Start the database**:
```bash
cd backend
docker-compose up -d
```

### Option 2: Local PostgreSQL Installation

#### On macOS:
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create database and user
createdb masada_db
createuser -s masada_user
```

#### On Ubuntu/Debian:
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres createdb masada_db
sudo -u postgres createuser -s masada_user
sudo -u postgres psql -c "ALTER USER masada_user PASSWORD 'masada_password';"
```

#### On Windows:
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Use pgAdmin or command line to create database and user

## Production Database Options

### Option 1: Supabase (Recommended for Ethiopian startups)

1. **Sign up at [supabase.com](https://supabase.com)**
2. **Create a new project**:
   - Project name: `masada-production`
   - Database password: Generate a strong password
   - Region: Choose closest to Ethiopia (Europe West or Asia)

3. **Get connection details**:
   - Go to Settings → Database
   - Copy the connection string

### Option 2: Railway

1. **Sign up at [railway.app](https://railway.app)**
2. **Create new project** → **Add PostgreSQL**
3. **Get connection details** from the Variables tab

### Option 3: Neon

1. **Sign up at [neon.tech](https://neon.tech)**
2. **Create database**
3. **Copy connection string**

### Option 4: AWS RDS

1. **Create RDS PostgreSQL instance**
2. **Configure security groups**
3. **Get endpoint and credentials**

## Environment Configuration

### Backend Environment Variables

Create or update your `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_URL="postgresql://masada_user:masada_password@localhost:5432/masada_db"

# For production (example with Supabase)
# DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_REFRESH_EXPIRES_IN="30d"

# Server Configuration
NODE_ENV="development"
PORT=5000
API_VERSION="v1"

# CORS Configuration
FRONTEND_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# File Upload Configuration
MAX_FILE_SIZE="10485760"
UPLOAD_PATH="./uploads"

# Email Configuration (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@masada.et"

# Ethiopian Payment Integration
CHAPA_SECRET_KEY="your-chapa-secret-key"
TELEBIRR_API_KEY="your-telebirr-api-key"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="info"
LOG_FILE="logs/masada.log"

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET="your-session-secret-change-in-production"

# Ethiopian Specific Configuration
DEFAULT_TIMEZONE="Africa/Addis_Ababa"
DEFAULT_CURRENCY="ETB"
DEFAULT_LANGUAGE="en"
SUPPORTED_LANGUAGES="en,am"
```

### Frontend Environment Variables

Create `.env.local` in your frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"

# For production
# NEXT_PUBLIC_API_URL="https://your-backend-domain.com/api/v1"
```

## Database Migration

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Run Database Migrations

```bash
# Push schema to database (for development)
npx prisma db push

# Or create and run migrations (for production)
npx prisma migrate dev --name init
```

### 4. Seed the Database (Optional)

```bash
npm run db:seed
```

### 5. View Database (Optional)

```bash
npx prisma studio
```

## Database Connection Testing

Create a simple test script to verify your connection:

```javascript
// backend/test-db.js
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Current user count: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

Run the test:
```bash
cd backend
node test-db.js
```

## Production Deployment Steps

### 1. Environment Variables

Set these in your production environment:

```bash
# Essential production variables
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
JWT_REFRESH_SECRET="your-production-refresh-secret"
NODE_ENV="production"
FRONTEND_URL="https://your-domain.com"
```

### 2. Database Migration

```bash
# Run migrations in production
npx prisma migrate deploy
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

## Troubleshooting

### Common Issues

#### 1. Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running and accessible on the specified port.

#### 2. Authentication Failed
```
Error: password authentication failed for user
```
**Solution**: Check username and password in your DATABASE_URL.

#### 3. Database Does Not Exist
```
Error: database "masada_db" does not exist
```
**Solution**: Create the database first:
```bash
createdb masada_db
```

#### 4. SSL Connection Issues (Production)
```
Error: no pg_hba.conf entry for host
```
**Solution**: Add `?sslmode=require` to your DATABASE_URL:
```
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### Prisma Specific Issues

#### 1. Schema Out of Sync
```bash
npx prisma db push --force-reset
```

#### 2. Migration Issues
```bash
npx prisma migrate reset
npx prisma migrate dev
```

#### 3. Generate Client Issues
```bash
rm -rf node_modules/.prisma
npx prisma generate
```

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` files to version control
- Use different credentials for development and production
- Rotate secrets regularly

### 2. Database Security
- Use strong passwords
- Enable SSL in production
- Restrict database access by IP
- Regular backups

### 3. Connection Pooling
For production, consider connection pooling:

```javascript
// In your Prisma configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

## Monitoring and Maintenance

### 1. Database Monitoring
- Monitor connection counts
- Track query performance
- Set up alerts for downtime

### 2. Backup Strategy
- Automated daily backups
- Test restore procedures
- Store backups in multiple locations

### 3. Performance Optimization
- Add database indexes for frequently queried fields
- Monitor slow queries
- Optimize Prisma queries

## Next Steps

1. **Choose your database option** (local Docker or cloud provider)
2. **Set up environment variables**
3. **Run database migrations**
4. **Test the connection**
5. **Deploy to production**

## Support

If you encounter issues:
1. Check the [Prisma documentation](https://www.prisma.io/docs)
2. Review PostgreSQL logs
3. Test connection with a simple script
4. Verify environment variables

---

**Made for Masada - Ethiopian Usability Testing Platform 🇪🇹**