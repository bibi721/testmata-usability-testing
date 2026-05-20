import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const taskSchema = z.object({
  id: z.string(),
  instruction: z.string().min(1, 'Task instruction is required'),
});

const demographicsSchema = z.object({
  regions: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  devices: z.array(z.string()).default([]),
  ageRanges: z.array(z.string()).default([]),
  educationLevels: z.array(z.string()).default([]),
  occupations: z.array(z.string()).default([]),
});

const createTestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  description: z.string().min(1, 'Description is required').max(1000),
  targetUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  testType: z.enum(['USABILITY', 'FEEDBACK', 'SURVEY', 'INTERVIEW']),
  platform: z.enum(['WEB', 'MOBILE_APP', 'DESKTOP']),
  tasks: z.array(taskSchema).min(1, 'Add at least one task'),
  demographics: demographicsSchema,
  requirements: z.array(z.string()).default([]),
  maxTesters: z.coerce.number().int().min(1, 'Max testers must be at least 1'),
  estimatedDuration: z.coerce.number().int().min(1, 'Duration must be at least 1 minute'),
  paymentPerTester: z.coerce.number().positive('Payment per tester must be greater than 0'),
});

const serializeTest = (test: any) => ({
  id: test.id,
  title: test.title,
  description: test.description,
  instructions: test.instructions,
  testType: test.testType,
  platform: test.platform,
  targetUrl: test.targetUrl,
  status: test.status,
  maxTesters: test.maxTesters,
  currentTesters: test.currentTesters,
  paymentPerTester: Number(test.paymentPerTester),
  estimatedDuration: test.estimatedDuration,
  requirements: test.requirements,
  tasks: test.tasks,
  demographics: test.demographics,
  publishedAt: test.publishedAt,
  completedAt: test.completedAt,
  createdAt: test.createdAt,
  updatedAt: test.updatedAt,
});

async function requireCustomerSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    };
  }

  if (session.user.userType !== 'CUSTOMER') {
    return {
      error: NextResponse.json({ error: 'Only customer accounts can manage tests' }, { status: 403 }),
      session: null,
    };
  }

  return { error: null, session };
}

export async function GET() {
  try {
    const { error, session } = await requireCustomerSession();
    if (error) return error;

    const tests = await prisma.test.findMany({
      where: {
        createdById: session!.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      tests: tests.map(serializeTest),
    });
  } catch (error) {
    console.error('Failed to list tests:', error);
    return NextResponse.json(
      { error: 'Failed to list tests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireCustomerSession();
    if (error) return error;

    const body = await request.json();
    const validatedData = createTestSchema.parse(body);

    const requirementSet = new Set([
      ...validatedData.requirements,
      ...validatedData.demographics.languages.map((language) => `Language: ${language}`),
      ...validatedData.demographics.devices.map((device) => `Device: ${device}`),
      ...validatedData.demographics.regions.map((region) => `Region: ${region}`),
    ].filter(Boolean));

    const test = await prisma.test.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        instructions: validatedData.tasks.map((task, index) => `${index + 1}. ${task.instruction}`).join('\n'),
        testType: validatedData.testType,
        platform: validatedData.platform,
        targetUrl: validatedData.targetUrl || null,
        status: 'DRAFT',
        maxTesters: validatedData.maxTesters,
        paymentPerTester: validatedData.paymentPerTester,
        estimatedDuration: validatedData.estimatedDuration,
        requirements: Array.from(requirementSet),
        tasks: {
          items: validatedData.tasks,
        },
        demographics: validatedData.demographics,
        createdById: session!.user.id,
      },
    });

    return NextResponse.json(
      {
        message: 'Draft test created successfully',
        test: serializeTest(test),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    console.error('Failed to create test:', error);
    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    );
  }
}
