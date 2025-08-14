import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Temporarily disabled due to Prisma client issues
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
          where: { email: credentials.email.toLowerCase() },
          include: {
            customerProfile: true,
            testerProfile: true,
          }
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
          status: user.status,
          emailVerified: user.emailVerified,
          ...(user.userType === 'CUSTOMER' && user.customerProfile ? {
            plan: user.customerProfile.plan,
            company: user.customerProfile.company,
          } : {}),
          ...(user.userType === 'TESTER' && user.testerProfile ? {
            rating: user.testerProfile.rating,
            completedTests: user.testerProfile.completedTests,
            earnings: user.testerProfile.totalEarnings,
            level: user.testerProfile.level,
          } : {})
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userType = user.userType;
        token.status = user.status;
        token.emailVerified = Boolean(user.emailVerified);
        
        if (user.userType === 'CUSTOMER') {
          token.plan = user.plan;
          token.company = user.company;
        } else if (user.userType === 'TESTER') {
          token.rating = user.rating;
          token.completedTests = user.completedTests;
          token.earnings = user.earnings;
          token.level = user.level;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.userType = token.userType as string;
        session.user.status = token.status as string;
        session.user.emailVerified = token.emailVerified as boolean;
        
        if (token.userType === 'CUSTOMER') {
          session.user.plan = token.plan as string;
          session.user.company = token.company as string;
        } else if (token.userType === 'TESTER') {
          session.user.rating = token.rating as number;
          session.user.completedTests = token.completedTests as number;
          session.user.earnings = token.earnings as number;
          session.user.level = token.level as string;
        }
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};