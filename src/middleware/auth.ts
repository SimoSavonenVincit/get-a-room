import { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticateApiKey(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const apiKey = request.headers['x-api-key'];

  if (!apiKey) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'API key is required. Please provide X-API-Key header.',
    });
  }

  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    return reply.status(500).send({
      error: 'Server Configuration Error',
      message: 'API key not configured on server.',
    });
  }

  if (apiKey !== validApiKey) {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Invalid API key.',
    });
  }
}
