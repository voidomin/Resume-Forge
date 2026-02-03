import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticateToken } from '../middleware/auth.middleware';

// Resume Routes
async function resumeRoutes(server: FastifyInstance) {
  // Generate resume
  server.post(
    '/generate',
    {
      preHandler: authenticateToken,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({ message: 'Generate resume - TODO' });
    }
  );

  // Get all resumes
  server.get(
    '/',
    {
      preHandler: authenticateToken,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({ message: 'Get all resumes - TODO' });
    }
  );

  // Get specific resume
  server.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: authenticateToken,
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      return reply.send({ message: `Get resume ${request.params.id} - TODO` });
    }
  );

  // Update resume
  server.put<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: authenticateToken,
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      return reply.send({ message: `Update resume ${request.params.id} - TODO` });
    }
  );

  // Delete resume
  server.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: authenticateToken,
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      return reply.send({ message: `Delete resume ${request.params.id} - TODO` });
    }
  );

  // Export resume (PDF/DOCX)
  server.post<{ Params: { id: string }; Querystring: { format: 'pdf' | 'docx' } }>(
    '/:id/export',
    {
      preHandler: authenticateToken,
    },
    async (
      request: FastifyRequest<{ Params: { id: string }; Querystring: { format: 'pdf' | 'docx' } }>,
      reply: FastifyReply
    ) => {
      return reply.send({
        message: `Export resume ${request.params.id} as ${request.query.format} - TODO`,
      });
    }
  );
}

export default resumeRoutes;
