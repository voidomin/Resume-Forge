import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function healthRoutes(server: FastifyInstance) {
  server.get(
    "/health",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Check database connectivity
        await prisma.$queryRaw`SELECT 1`;

        const uptime = process.uptime();

        return reply.send({
          status: "ok",
          timestamp: new Date().toISOString(),
          uptime: Math.floor(uptime),
          environment: process.env.NODE_ENV || "development",
          database: "connected",
          version: "1.0.0",
        });
      } catch (error) {
        return reply.status(503).send({
          status: "degraded",
          timestamp: new Date().toISOString(),
          database: "disconnected",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );
}
