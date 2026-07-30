import Fastify, { FastifyInstance } from "fastify";
import jwtPlugin from "@fastify/jwt";
import authRoutes from "../../src/routes/auth.routes";
import { prisma } from "../setup";

/**
 * Regression test: /register used to return the full Prisma User object,
 * including the bcrypt password hash, in the response body.
 */
jest.setTimeout(30000);

describe("POST /register response shape", () => {
  let server: FastifyInstance;
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const email = `register-shape-${suffix}@example.com`;
  let userId: string;

  beforeAll(async () => {
    server = Fastify();
    await server.register(jwtPlugin, {
      secret: process.env.JWT_SECRET as string,
    });
    await server.register(authRoutes, { prefix: "/api/auth" });
    await server.ready();
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.deleteMany({ where: { id: userId } });
    }
    await server.close();
  });

  it("never returns the password hash or other sensitive fields", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email, password: "TestPassword123!" },
    });
    expect(res.statusCode).toBe(201);

    const body = JSON.parse(res.body);
    userId = body.user.id;

    expect(body.user).not.toHaveProperty("password");
    expect(body.user).not.toHaveProperty("resetToken");
    expect(body.user).not.toHaveProperty("resetTokenExpiry");
    expect(body.user).not.toHaveProperty("googleId");
    expect(Object.keys(body.user).sort()).toEqual(["createdAt", "email", "id"]);
  });
});
