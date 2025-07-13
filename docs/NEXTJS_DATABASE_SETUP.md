# PostgreSQL Database Setup for Next.js Masada Project

This guide provides database setup options that work perfectly with Next.js applications.

## Table of Contents
1. [Recommended Database Providers](#recommended-database-providers)
2. [Local Development Setup](#local-development-setup)
3. [Production Database Options](#production-database-options)
4. [Next.js Integration](#nextjs-integration)
5. [Environment Configuration](#environment-configuration)
6. [Database Migration](#database-migration)

## Recommended Database Providers for Next.js

### 🥇 **Option 1: Vercel Postgres (Recommended)**
- **Perfect for Next.js** - Made by the same team
- **Serverless** - Scales automatically
- **Free tier** - Great for development
- **Easy deployment** - Integrates with Vercel hosting

### 🥈 **Option 2: Railway**
- **Simple setup** - One-click PostgreSQL
- **Great for startups** - Affordable pricing
- **Good performance** - Fast for Ethiopian users
- **Easy scaling** - Grows with your app

### 🥉 **Option 3: Neon**
- **Serverless PostgreSQL** - Pay per use
- **Branching** - Database branches like Git
- **Fast cold starts** - Good for development
- **Cost-effective** - Only pay for what you use

### 🏆 **Option 4: PlanetScale (MySQL)**
- **Serverless MySQL** - Alternative to PostgreSQL
- **Branching workflow** - Database version control
- **Great performance** - Global edge network
- **Free tier** - Generous limits

## Local Development Setup

### Option 1: Docker (Recommended for Local Development)

1. **Create docker-compose.yml**:
```yaml
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
    restart: unless-stopped

volumes:
  postgres_data:
```

2. **Start the database**:
```bash
docker-compose up -d
```

### Option 2: Local PostgreSQL Installation

#### macOS (using Homebrew):
```bash
brew install postgresql@15
brew services start postgresql@15
createdb masada_db
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb masada_db
```

## Production Database Options

### 🚀 **Vercel Postgres Setup**

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Create database**:
```bash
vercel postgres create masada-db
```

4. **Connect to your project**:
```bash
vercel link
vercel env pull .env.local
```

### 🚂 **Railway Setup**

1. **Sign up at [railway.app](https://railway.app)**
2. **Create new project** → **Add PostgreSQL**
3. **Copy connection string** from Variables tab
4. **Add to your environment variables**

### ⚡ **Neon Setup**

1. **Sign up at [neon.tech](https://neon.tech)**
2. **Create new project**
3. **Copy connection string**
4. **Add to environment variables**

### 🌍 **PlanetScale Setup (MySQL Alternative)**

1. **Sign up at [planetscale.com](https://planetscale.com)**
2. **Create database**
3. **Create branch** (main)
4. **Get connection details**

## Next.js Integration

### Database Client Options

#### Option 1: Prisma (Recommended)
```bash
npm install prisma @prisma/client
npx prisma init
```

#### Option 2: Drizzle ORM
```bash
npm install drizzle-orm @planetscale/database
npm install -D drizzle-kit
```

#### Option 3: Raw SQL with pg
```bash
npm install pg @types/pg
```

### API Routes Setup

Create API routes in your Next.js app:

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await prisma.user.create({
      data: body,
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
```

## Environment Configuration

### Development (.env.local)
```env
# Database
DATABASE_URL="postgresql://masada_user:masada_password@localhost:5432/masada_db"

# Next.js
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Ethiopian Configuration
DEFAULT_TIMEZONE="Africa/Addis_Ababa"
DEFAULT_CURRENCY="ETB"
SUPPORTED_LANGUAGES="en,am"
```

### Production (.env.production)
```env
# Database (from your provider)
DATABASE_URL="your-production-database-url"

# Next.js
NEXTAUTH_SECRET="your-production-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"

# Ethiopian Configuration
DEFAULT_TIMEZONE="Africa/Addis_Ababa"
DEFAULT_CURRENCY="ETB"
SUPPORTED_LANGUAGES="en,am"
```

## Database Schema Setup

### 1. Create Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  userType  UserType
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

enum UserType {
  CUSTOMER
  TESTER
  ADMIN
}
```

### 2. Generate and Push Schema

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or create migration
npx prisma migrate dev --name init
```

## Authentication Setup (NextAuth.js)

### 1. Install NextAuth.js

```bash
npm install next-auth
```

### 2. Configure NextAuth

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
  },
});

export { handler as GET, handler as POST };
```

## Deployment Guide

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Railway Deployment

1. **Connect GitHub repository**
2. **Add environment variables**
3. **Deploy automatically** on push

### Manual Deployment

1. **Build the application**:
```bash
npm run build
```

2. **Set environment variables** on your hosting platform
3. **Run database migrations**:
```bash
npx prisma migrate deploy
```

## Testing Database Connection

Create a test API route:

```typescript
// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
```

Test by visiting: `http://localhost:3000/api/test-db`

## Ethiopian-Specific Optimizations

### 1. Timezone Handling

```typescript
// lib/utils/time.ts
export const getEthiopianTime = () => {
  return new Date().toLocaleString('en-US', {
    timeZone: 'Africa/Addis_Ababa'
  });
};
```

### 2. Currency Formatting

```typescript
// lib/utils/currency.ts
export const formatETB = (amount: number) => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
  }).format(amount);
};
```

### 3. Language Support

```typescript
// lib/utils/language.ts
export const supportedLanguages = ['en', 'am'] as const;
export type Language = typeof supportedLanguages[number];

export const getLanguageLabel = (lang: Language) => {
  const labels = {
    en: 'English',
    am: 'አማርኛ'
  };
  return labels[lang];
};
```

## Performance Optimization

### 1. Connection Pooling

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 2. Database Indexes

Add indexes for frequently queried fields:

```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  
  @@index([email])
  @@index([userType])
}
```

## Troubleshooting

### Common Issues

1. **Connection refused**: Check if database is running
2. **Authentication failed**: Verify credentials
3. **SSL issues**: Add `?sslmode=require` to connection string
4. **Migration errors**: Reset with `npx prisma migrate reset`

### Debug Mode

Enable Prisma logging:

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

## Next Steps

1. **Choose your database provider** (Vercel Postgres recommended)
2. **Set up local development** with Docker
3. **Configure environment variables**
4. **Run database migrations**
5. **Test the connection**
6. **Deploy to production**

---

**Perfect for Next.js + Ethiopian Usability Testing Platform 🇪🇹**