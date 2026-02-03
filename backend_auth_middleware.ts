import { FastifyRequest, FastifyReply } from 'fastify';

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    userId: string;
    email: string;
  };
}

export async function authenticateToken(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({
        error: 'No authorization header provided',
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return reply.status(401).send({
        error: 'No token provided',
      });
    }

    // Verify token
    const decoded = await request.server.jwt.verify(token);

    // Attach user info to request
    request.user = decoded as { userId: string; email: string };
  } catch (error) {
    return reply.status(401).send({
      error: 'Invalid or expired token',
    });
  }
}
