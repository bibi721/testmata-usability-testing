import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Get basic stats
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.$queryRaw`SELECT version()` as Promise<Array<{ version: string }>>,
    ]);

    const [userCount, versionResult] = stats;
    const version = versionResult[0]?.version || 'Unknown';

    return NextResponse.json({
      status: 'success',
      message: '🇪🇹 Masada database connection successful!',
      data: {
        userCount,
        postgresVersion: version,
        ethiopianTime: new Date().toLocaleString('en-US', {
          timeZone: 'Africa/Addis_Ababa'
        }),
        timezone: 'Africa/Addis_Ababa',
        currency: 'ETB',
        supportedLanguages: ['en', 'am'],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: [
        'Check if DATABASE_URL is set correctly',
        'Ensure PostgreSQL is running',
        'Verify database credentials',
        'Run: npx prisma db push',
      ],
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}