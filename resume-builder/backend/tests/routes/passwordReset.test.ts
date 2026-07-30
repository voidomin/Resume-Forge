import Fastify, { FastifyInstance } from "fastify";
import jwtPlugin from "@fastify/jwt";
import authRoutes from "../../src/routes/auth.routes";
import { sendResetEmail } from "../../src/services/emailService";
import { prisma } from "../setup";

jest.mock("../../src/services/emailService", () => ({
  sendResetEmail: jest.fn(),
}));

const mockedSendResetEmail = sendResetEmail as jest.Mock;

/**
 * Regression tests for the plaintext-reset-token fix: the DB must only
 * ever store a hash of the reset token, never the raw value that gets
 * emailed to the user.
 */
jest.setTimeout(30000);

describe("Password reset token hashing", () => {
  let server: FastifyInstance;
  const password = "TestPassword123!";
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const email = `reset-test-${suffix}@example.com`;
  let userId: string;

  beforeAll(async () => {
    server = Fastify();
    await server.register(jwtPlugin, {
      secret: process.env.JWT_SECRET as string,
    });
    await server.register(authRoutes, { prefix: "/api/auth" });
    await server.ready();

    const res = await server.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email, password },
    });
    userId = JSON.parse(res.body).user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } });
    await server.close();
  });

  it("never stores the raw reset token in the database", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/auth/forgot-password",
      payload: { email },
    });
    expect(res.statusCode).toBe(200);

    expect(mockedSendResetEmail).toHaveBeenCalledTimes(1);
    const rawToken = mockedSendResetEmail.mock.calls[0][1] as string;
    expect(rawToken).toEqual(expect.any(String));

    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user?.resetToken).not.toBe(rawToken);
    // sha256 hex digest length - confirms it's stored as a hash, not the token
    expect(user?.resetToken).toHaveLength(64);
  });

  it("rejects the stored hash itself as a reset token", async () => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const res = await server.inject({
      method: "POST",
      url: "/api/auth/reset-password",
      payload: { token: user?.resetToken, password: "NewPassword123!" },
    });

    expect(res.statusCode).toBe(400);
  });

  it("accepts the raw emailed token and resets the password", async () => {
    const rawToken = mockedSendResetEmail.mock.calls[0][1] as string;

    const resetRes = await server.inject({
      method: "POST",
      url: "/api/auth/reset-password",
      payload: { token: rawToken, password: "NewPassword123!" },
    });
    expect(resetRes.statusCode).toBe(200);

    const loginRes = await server.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email, password: "NewPassword123!" },
    });
    expect(loginRes.statusCode).toBe(200);
  });
});
