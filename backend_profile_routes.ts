import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticateToken } from '../middleware/auth.middleware';

// Profile Routes
async function profileRoutes(server: FastifyInstance) {
  // Get user profile
  server.get(
    '/',
    {
      preHandler: authenticateToken,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({ message: 'Get profile - TODO' });
    }
  );

  // Create/Update profile
  server.post(
    '/',
    {
      preHandler: authenticateToken,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({ message: 'Create/Update profile - TODO' });
    }
  );

  // Add experience
  server.post(
    '/experiences',
    {
      preHandler: authenticateToken,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({ message: 'Add experience - TODO' });
    }
  );

  // Add education
  server.post(
    '/education',
    {
      preHandler: authenticateToken,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({ message: 'Add education - TODO' });
    }
  );

  // Add skills
  server.post(
    '/skills',
    {
      preHandler: authenticateToken,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({ message: 'Add skills - TODO' });
    }
  );
}

export default profileRoutes;
