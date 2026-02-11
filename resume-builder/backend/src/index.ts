import Fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { config } from "dotenv";

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

// Validate before starting
validateEnvironment();

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
  },
});

// Register plugins
async function registerPlugins() {
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

  // CORS
  await server.register(cors, {
    origin: process.env.FRONTEND_URL!,
    credentials: true,
  });

  // JWT
  await server.register(jwt, {
    secret: process.env.JWT_SECRET!,
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
}

// Register routes
async function registerRoutes() {
  server.register(authRoutes, { prefix: "/api/auth" });
  server.register(profileRoutes, { prefix: "/api/profile" });
  server.register(resumeRoutes, { prefix: "/api/resumes" });
}

// Health check
server.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Root route
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

// Error handler
server.setErrorHandler((error: any, request, reply) => {
  server.log.error(error);
  reply.status(error.statusCode || 500).send({
    error: error.message || "Internal Server Error",
    statusCode: error.statusCode || 500,
  });
});

// Register API documentation
async function registerDocumentation() {
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

// Start server
const start = async () => {
  try {
    await registerPlugins();
    await registerRoutes();
    await registerDocumentation();

    const port = parseInt(process.env.PORT || "3000", 10);
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
    server.log.error(err);
    process.exit(1);
  }
};

start();
