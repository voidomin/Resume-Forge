"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Mock environment
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key-minimum-32-characters-long";
process.env.GEMINI_API_KEY = "test-key";
// Prisma client for testing
exports.prisma = new client_1.PrismaClient();
// Cleanup after tests
afterAll(async () => {
    await exports.prisma.$disconnect();
});
// Reset database between tests (optional - use if database is separate for testing)
beforeEach(async () => {
    // You can add database cleanup here if using a test database
});
