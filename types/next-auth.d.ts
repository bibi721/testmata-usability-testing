import NextAuth from "next-auth";
declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    userType: string;
    status: string;
    emailVerified: boolean;
    // Customer specific
    plan?: string;
    company?: string;
    // Tester specific
    rating?: number;
    completedTests?: number;
    earnings?: number;
    level?: string;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userType: string;
    status: string;
    emailVerified: boolean;
    // Customer specific
    plan?: string;
    company?: string;
    // Tester specific
    rating?: number;
    completedTests?: number;
    earnings?: number;
    level?: string;
  }
}