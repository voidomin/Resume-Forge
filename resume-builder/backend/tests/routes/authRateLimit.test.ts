import Fastify, { FastifyInstance } from "fastify";
import jwtPlugin from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import authRoutes from "../../src/routes/auth.routes";

/**
 * Regression test: /login, /register, and /forgot-password previously had
 * no rate limit beyond the app-wide 120 req/min default, leaving them
 * exposed to credential-stuffing/brute-force. Each now has a stricter
 * per-route limit.
 */
jest.setTimeout(30000);

describe("Auth endpoint rate limiting", () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = Fastify();
    await server.register(jwtPlugin, {
      secret: process.env.JWT_SECRET as string,
    });
    // Mirrors the app's global registration - route-level `config.rateLimit`
    // (set on /login in auth.routes.ts) overrides this default per-route.
    await server.register(rateLimit, {
      global: true,
      max: 120,
      timeWindow: "1 minute",
    });
    await server.register(authRoutes, { prefix: "/api/auth" });
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  it("rejects login attempts beyond the per-route limit (10 per 15 minutes)", async () => {
    const attemptLogin = () =>
      server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: "nonexistent-ratelimit-test@example.com",
          password: "wrong",
        },
      });

    const statusCodes: number[] = [];
    for (let i = 0; i < 11; i++) {
      const res = await attemptLogin();
      statusCodes.push(res.statusCode);
    }

    // First 10 requests reach the handler (fail auth normally, 401).
    expect(statusCodes.slice(0, 10).every((code) => code === 401)).toBe(true);
    // The 11th is blocked by the rate limiter before the handler runs.
    expect(statusCodes[10]).toBe(429);
  });
});
