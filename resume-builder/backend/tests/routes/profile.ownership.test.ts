import Fastify, { FastifyInstance } from "fastify";
import jwtPlugin from "@fastify/jwt";
import authRoutes from "../../src/routes/auth.routes";
import profileRoutes from "../../src/routes/profile.routes";
import { prisma } from "../setup";

/**
 * Regression tests for the IDOR fix: profile sub-resource update/delete
 * routes must verify the record belongs to the authenticated user's own
 * profile, not just that the record exists.
 *
 * Builds a minimal Fastify instance (just JWT + the two route modules
 * under test) rather than the full production app, since plugins like
 * oauth2/swagger/rate-limit aren't relevant to this check and only add
 * risk/noise to a route-level test.
 */
describe("Profile sub-resource ownership", () => {
  let server: FastifyInstance;
  const password = "TestPassword123!";
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const userAEmail = `owner-test-a-${suffix}@example.com`;
  const userBEmail = `owner-test-b-${suffix}@example.com`;

  let tokenA: string;
  let tokenB: string;
  let userAId: string;
  let userBId: string;
  let experienceId: string;
  let skillId: string;

  async function register(email: string) {
    const res = await server.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email, password },
    });
    const body = JSON.parse(res.body);
    return { token: body.token as string, userId: body.user.id as string };
  }

  beforeAll(async () => {
    server = Fastify();
    await server.register(jwtPlugin, {
      secret: process.env.JWT_SECRET as string,
    });
    await server.register(authRoutes, { prefix: "/api/auth" });
    await server.register(profileRoutes, { prefix: "/api/profile" });
    await server.ready();

    const a = await register(userAEmail);
    tokenA = a.token;
    userAId = a.userId;

    const b = await register(userBEmail);
    tokenB = b.token;
    userBId = b.userId;

    await server.inject({
      method: "POST",
      url: "/api/profile",
      headers: { authorization: `Bearer ${tokenA}` },
      payload: { firstName: "Owner", lastName: "A", email: userAEmail },
    });

    const createExp = await server.inject({
      method: "POST",
      url: "/api/profile/experiences",
      headers: { authorization: `Bearer ${tokenA}` },
      payload: {
        company: "Acme",
        role: "Engineer",
        startDate: "2020-01",
        current: true,
        bullets: ["Did things"],
      },
    });
    experienceId = JSON.parse(createExp.body).experience.id;

    const createSkill = await server.inject({
      method: "POST",
      url: "/api/profile/skills",
      headers: { authorization: `Bearer ${tokenA}` },
      payload: { name: "TypeScript", category: "technical" },
    });
    skillId = JSON.parse(createSkill.body).skill.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [userAId, userBId] } } });
    await server.close();
  });

  it("rejects another user's attempt to update someone else's experience", async () => {
    const res = await server.inject({
      method: "PUT",
      url: `/api/profile/experiences/${experienceId}`,
      headers: { authorization: `Bearer ${tokenB}` },
      payload: {
        company: "Hacked Corp",
        role: "Attacker",
        startDate: "2020-01",
        current: true,
        bullets: [],
      },
    });

    expect(res.statusCode).toBe(404);

    const stillOwned = await prisma.experience.findUnique({
      where: { id: experienceId },
    });
    expect(stillOwned?.company).toBe("Acme");
  });

  it("rejects another user's attempt to delete someone else's experience", async () => {
    const res = await server.inject({
      method: "DELETE",
      url: `/api/profile/experiences/${experienceId}`,
      headers: { authorization: `Bearer ${tokenB}` },
    });

    expect(res.statusCode).toBe(404);

    const stillExists = await prisma.experience.findUnique({
      where: { id: experienceId },
    });
    expect(stillExists).not.toBeNull();
  });

  it("rejects another user's attempt to delete someone else's skill", async () => {
    const res = await server.inject({
      method: "DELETE",
      url: `/api/profile/skills/${skillId}`,
      headers: { authorization: `Bearer ${tokenB}` },
    });

    expect(res.statusCode).toBe(404);

    const stillExists = await prisma.skill.findUnique({
      where: { id: skillId },
    });
    expect(stillExists).not.toBeNull();
  });

  it("allows the owner to update their own experience", async () => {
    const res = await server.inject({
      method: "PUT",
      url: `/api/profile/experiences/${experienceId}`,
      headers: { authorization: `Bearer ${tokenA}` },
      payload: {
        company: "Acme Updated",
        role: "Engineer",
        startDate: "2020-01",
        current: true,
        bullets: ["Did more things"],
      },
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).experience.company).toBe("Acme Updated");
  });

  it("allows the owner to delete their own skill and experience", async () => {
    const skillRes = await server.inject({
      method: "DELETE",
      url: `/api/profile/skills/${skillId}`,
      headers: { authorization: `Bearer ${tokenA}` },
    });
    expect(skillRes.statusCode).toBe(200);

    const expRes = await server.inject({
      method: "DELETE",
      url: `/api/profile/experiences/${experienceId}`,
      headers: { authorization: `Bearer ${tokenA}` },
    });
    expect(expRes.statusCode).toBe(200);
  });
});
