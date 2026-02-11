import { FastifyRequest, FastifyReply } from "fastify";
import { randomBytes } from "crypto";

/**
 * Generate a simple unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${randomBytes(4).toString("hex")}`;
}

/**
 * Add request ID tracking to all requests
 * Each request gets a unique ID that can be used for debugging and logging
 */
export async function requestIdMiddleware(request: FastifyRequest, reply: FastifyReply) {
  // Generate or retrieve request ID
  const requestId = (request.headers["x-request-id"] as string) || generateRequestId();
  
  // Store in request object for use in route handlers
  (request as any).id = requestId;
  
  // Add to response headers
  reply.header("x-request-id", requestId);
  
  // Add to logs
  request.log = request.log.child({ requestId });
}
