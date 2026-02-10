import { PrismaClient } from "@prisma/client";

// Mock environment
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key-minimum-32-characters-long";
process.env.GEMINI_API_KEY = "test-key";

// Prisma client for testing
export const prisma = new PrismaClient();

// Cleanup after tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Reset database between tests (optional - use if database is separate for testing)
beforeEach(async () => {
  // You can add database cleanup here if using a test database
});
