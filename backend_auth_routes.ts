import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerUser, loginUser, getCurrentUser } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

interface RegisterBody {
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

async function authRoutes(server: FastifyInstance) {
  // Register new user
  server.post<{ Body: RegisterBody }>(
    '/register',
    async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
      return registerUser(request, reply);
    }
  );

  // Login user
  server.post<{ Body: LoginBody }>(
    '/login',
    async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
      return loginUser(request, reply);
    }
  );

  // Get current user (protected route)
  server.get(
    '/me',
    {
      preHandler: authenticateToken,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return getCurrentUser(request, reply);
    }
  );

  // Logout (client-side token removal, server just confirms)
  server.post(
    '/logout',
    {
      preHandler: authenticateToken,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({ message: 'Logged out successfully' });
    }
  );
}

export default authRoutes;
