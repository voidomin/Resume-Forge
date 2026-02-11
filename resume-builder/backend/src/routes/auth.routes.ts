import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

interface RegisterBody {
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

// Password strength validation
function validatePasswordStrength(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one lowercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one number",
    };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one special character (!@#$%^&*)",
    };
  }
  return { isValid: true };
}

async function authRoutes(server: FastifyInstance) {
  // Register new user
  server.post<{ Body: RegisterBody }>(
    "/register",
    async (
      request: FastifyRequest<{ Body: RegisterBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const { email, password } = request.body;

        // Validation
        if (!email || !password) {
          return reply
            .status(400)
            .send({ error: "Email and password are required" });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return reply.status(400).send({ error: "Invalid email format" });
        }

        // Password strength validation
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
          return reply.status(400).send({ error: passwordValidation.error });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
          return reply
            .status(409)
            .send({ error: "User with this email already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
          data: { email, password: hashedPassword },
          select: { id: true, email: true, createdAt: true },
        });

        // Generate JWT token
        const token = server.jwt.sign(
          { userId: user.id, email: user.email },
          { expiresIn: "7d" },
        );

        return reply
          .status(201)
          .send({ message: "User registered successfully", user, token });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to register user" });
      }
    },
  );

  // Login user
  server.post<{ Body: LoginBody }>(
    "/login",
    async (
      request: FastifyRequest<{ Body: LoginBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const { email, password } = request.body;

        if (!email || !password) {
          return reply
            .status(400)
            .send({ error: "Email and password are required" });
        }

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return reply.status(401).send({ error: "Invalid email or password" });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return reply.status(401).send({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const token = server.jwt.sign(
          { userId: user.id, email: user.email },
          { expiresIn: "7d" },
        );

        return reply.send({
          message: "Login successful",
          user: { id: user.id, email: user.email },
          token,
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to login" });
      }
    },
  );

  // Get current user
  server.get(
    "/me",
    { preHandler: authenticateToken },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { userId } = (request as any).user;

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            createdAt: true,
            profile: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        });

        if (!user) {
          return reply.status(404).send({ error: "User not found" });
        }

        return reply.send({ user });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to get user" });
      }
    },
  );

  // Logout
  server.post(
    "/logout",
    { preHandler: authenticateToken },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({ message: "Logged out successfully" });
    },
  );
}

// Auth middleware
async function authenticateToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply
        .status(401)
        .send({ error: "No authorization header provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return reply.status(401).send({ error: "No token provided" });
    }

    const decoded = await request.server.jwt.verify(token);
    (request as any).user = decoded;
  } catch (error) {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
}

export { authenticateToken };
export default authRoutes;
