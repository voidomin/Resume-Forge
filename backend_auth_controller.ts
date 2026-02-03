import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface RegisterBody {
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    userId: string;
    email: string;
  };
}

// Register new user
export async function registerUser(
  request: FastifyRequest<{ Body: RegisterBody }>,
  reply: FastifyReply
) {
  try {
    const { email, password } = request.body;

    // Validation
    if (!email || !password) {
      return reply.status(400).send({
        error: 'Email and password are required',
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return reply.status(400).send({
        error: 'Invalid email format',
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return reply.status(400).send({
        error: 'Password must be at least 8 characters long',
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return reply.status(409).send({
        error: 'User with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = request.server.jwt.sign(
      { userId: user.id, email: user.email },
      { expiresIn: '7d' }
    );

    return reply.status(201).send({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      error: 'Failed to register user',
    });
  }
}

// Login user
export async function loginUser(
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply
) {
  try {
    const { email, password } = request.body;

    // Validation
    if (!email || !password) {
      return reply.status(400).send({
        error: 'Email and password are required',
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply.status(401).send({
        error: 'Invalid email or password',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return reply.status(401).send({
        error: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = request.server.jwt.sign(
      { userId: user.id, email: user.email },
      { expiresIn: '7d' }
    );

    return reply.send({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      error: 'Failed to login',
    });
  }
}

// Get current user
export async function getCurrentUser(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    if (!request.user) {
      return reply.status(401).send({
        error: 'Unauthorized',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: request.user.userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            personalInfo: true,
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({
        error: 'User not found',
      });
    }

    return reply.send({ user });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      error: 'Failed to get user',
    });
  }
}
