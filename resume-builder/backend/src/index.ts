import Fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import oauth2 from "@fastify/oauth2";
import { config } from "dotenv";

// Import middleware
import { requestIdMiddleware } from "./middleware/requestId";

// Load environment variables
config();

// Validate required environment variables
function validateEnvironment() {
  const required = [
    "DATABASE_URL",
    "GEMINI_API_KEY",
    "JWT_SECRET",
    "FRONTEND_URL",
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(", ")}`,
    );
    process.exit(1);
  }

  // Validate JWT_SECRET strength (not a default value)
  if (
    process.env.JWT_SECRET === "your-secret-key" ||
    (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32)
  ) {
    console.error(
      "❌ JWT_SECRET is too weak. Must be at least 32 characters and not the default value.",
    );
    process.exit(1);
  }
}

// Import routes
import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";
import resumeRoutes from "./routes/resume.routes";

// Register plugins
async function registerPlugins(server: ReturnType<typeof Fastify>) {
  // Request ID tracking middleware
  server.addHook("onRequest", requestIdMiddleware);

  // Security headers
  await server.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    xContentTypeOptions: true,
    xFrameOptions: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  });

  await server.register(cors, {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  // JWT
  await server.register(jwt, {
    secret: process.env.JWT_SECRET,
  });

  // Multipart for file uploads
  await server.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });

  const rateLimitMax = Number.parseInt(process.env.RATE_LIMIT_MAX || "120", 10);
  const rateLimitWindow = process.env.RATE_LIMIT_WINDOW || "1 minute";

  await server.register(rateLimit, {
    global: true,
    max: Number.isFinite(rateLimitMax) ? rateLimitMax : 120,
    timeWindow: rateLimitWindow,
    skipOnError: true,
  });

  // Google OAuth
  await server.register(oauth2, {
    name: "googleOAuth2",
    scope: ["profile", "email"],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID || "",
        secret: process.env.GOOGLE_CLIENT_SECRET || "",
      },
      auth: oauth2.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: "/api/auth/google",
    callbackUri:
      process.env.GOOGLE_CALLBACK_URL ||
      `${process.env.API_URL || "http://localhost:3000"}/api/auth/google/callback`,
  });
}

// Register routes
async function registerRoutes(server: ReturnType<typeof Fastify>) {
  server.register(authRoutes, { prefix: "/api/auth" });
  server.register(profileRoutes, { prefix: "/api/profile" });
  server.register(resumeRoutes, { prefix: "/api/resumes" });
}

// Register API documentation
async function registerDocumentation(server: ReturnType<typeof Fastify>) {
  await server.register(swagger, {
    swagger: {
      info: {
        title: "Resume Builder API",
        description:
          "ATS-optimized resume builder API with AI-powered resume tailoring",
        version: "1.0.0",
        contact: {
          name: "Resume Builder",
          url: "https://github.com/voidomin/Resume-Forge",
        },
      },
      host: "localhost:3000",
      schemes: ["http", "https"],
      consumes: ["application/json"],
      produces: ["application/json"],
      securityDefinitions: {
        bearerAuth: {
          type: "apiKey",
          name: "authorization",
          in: "header",
          description: "JWT Bearer token",
        },
      },
    },
  });

  await server.register(swaggerUI, {
    routePrefix: "/documentation",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    staticCSP: true,
  });
}

// Builds a fully configured Fastify instance without binding a port -
// used both by the real server (below) and by route-level tests via .inject().
export async function buildServer() {
  validateEnvironment();

  const server = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
    },
  });

  await registerPlugins(server);
  await registerRoutes(server);
  await registerDocumentation(server);

  server.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  server.get("/", async () => {
    return {
      message: "Resume Builder API",
      version: "1.0.0",
      endpoints: {
        health: "/health",
        auth: "/api/auth",
        profile: "/api/profile",
        resumes: "/api/resumes",
      },
    };
  });

  server.setErrorHandler((error: any, request, reply) => {
    server.log.error(error);
    reply.status(error.statusCode || 500).send({
      error: error.message || "Internal Server Error",
      statusCode: error.statusCode || 500,
    });
  });

  return server;
}

// Start server
const start = async () => {
  try {
    const server = await buildServer();

    const port = Number.parseInt(process.env.PORT || "3000", 10);
    await server.listen({ port, host: "0.0.0.0" });

    server.log.info(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 Resume Builder API Server                          ║
║                                                          ║
║   Server:  http://localhost:${port}                       ║
║   Health:  http://localhost:${port}/health                ║
║   API Docs: http://localhost:${port}/documentation        ║
║                                                          ║
║   Gemini AI: ${process.env.GEMINI_API_KEY ? "✓ Configured" : "✗ Missing"}                         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Only auto-start when this file is the actual entrypoint (`ts-node src/index.ts`,
// or `node dist/.../index.js`) - not when imported by tests for buildServer().
if (require.main === module) {
  start();
}
