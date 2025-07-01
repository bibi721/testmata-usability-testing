import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Create a transaction client type derived from the prisma instance
type TransactionClient = Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

// Validation schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  userType: z.enum(['CUSTOMER', 'TESTER']).default('CUSTOMER'),
  // Optional fields for tester
  phone: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  age: z.string().optional(),
  education: z.string().optional(),
  occupation: z.string().optional(),
  experience: z.string().optional(),
  languages: z.array(z.string()).optional(),
  devices: z.array(z.string()).optional(),
  internetSpeed: z.string().optional(),
  availability: z.string().optional(),
  motivation: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user in transaction
    const result = await prisma.$transaction(async (tx: TransactionClient) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: validatedData.email.toLowerCase(),
          password: hashedPassword,
          name: validatedData.name,
          userType: validatedData.userType,
          status: 'ACTIVE', // For demo, we're setting as active immediately
          emailVerified: true, // For demo, we're setting as verified
          emailVerifiedAt: new Date(),
        },
      });

      // Create profile based on user type
      if (validatedData.userType === 'CUSTOMER') {
        await tx.customerProfile.create({
          data: {
            userId: user.id,
            company: `${validatedData.name}'s Company`,
          },
        });
      } else if (validatedData.userType === 'TESTER') {
        await tx.testerProfile.create({
          data: {
            userId: user.id,
            phone: validatedData.phone,
            city: validatedData.city,
            region: validatedData.region,
            age: validatedData.age,
            education: validatedData.education,
            occupation: validatedData.occupation,
            experience: validatedData.experience,
            languages: validatedData.languages || [],
            devices: validatedData.devices || [],
            internetSpeed: validatedData.internetSpeed,
            availability: validatedData.availability,
            motivation: validatedData.motivation,
          },
        });
      }

      return user;
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        user: {
          id: result.id,
          email: result.email,
          name: result.name,
          userType: result.userType,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}