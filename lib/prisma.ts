// Mock PrismaClient for build purposes - will be replaced with real client when generation is fixed
class MockPrismaClient {
  constructor() {}
  
  // Add mock methods that are used in the codebase
  user = {
    findUnique: async (args: any) => ({
      id: 'mock-user-id',
      email: 'mock@example.com',
      password: 'mock-hashed-password',
      name: 'Mock User',
      userType: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerified: false,
      customerProfile: {
        plan: 'free',
        company: 'Mock Company',
      },
      testerProfile: {
        rating: 5.0,
        completedTests: 10,
        totalEarnings: 100.0,
        level: 'BRONZE',
      },
    }),
    findMany: async (args?: any) => [],
    create: async (args: any) => ({ id: 'mock-user-id', ...args.data }),
    update: async (args: any) => ({ id: 'mock-user-id', ...args.data }),
    delete: async (args: any) => ({ id: 'mock-user-id' }),
    count: async () => 0,
  };
  
  customerProfile = {
    findUnique: async (args: any) => null,
    create: async (args: any) => ({}),
    update: async (args: any) => ({}),
  };
  
  testerProfile = {
    findUnique: async (args: any) => null,
    create: async (args: any) => ({}),
    update: async (args: any) => ({}),
  };
  
  test = {
    findMany: async (args?: any) => [],
    create: async (args: any) => ({}),
    update: async (args: any) => ({}),
  };
  
  testSession = {
    findMany: async (args?: any) => [],
    create: async (args: any) => ({}),
    update: async (args: any) => ({}),
  };
  
  payment = {
    findMany: async (args?: any) => [],
    create: async (args: any) => ({}),
  };
  
  earning = {
    findMany: async (args?: any) => [],
    create: async (args: any) => ({}),
  };
  
  notification = {
    findMany: async (args?: any) => [],
    create: async (args: any) => ({}),
  };
  
  analytics = {
    findMany: async (args?: any) => [],
    create: async (args: any) => ({}),
  };
  
  $connect = async () => {};
  $disconnect = async () => {};
  $transaction = async (fn: any) => fn({});
  $queryRaw = async (query: any) => [{ version: 'mock-version' }];
}

const globalForPrisma = globalThis as unknown as {
  prisma: MockPrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new MockPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;