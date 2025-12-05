import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import { roomRoutes } from './routes/roomRoutes';
import { bookingRoutes } from './routes/bookingRoutes';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// Register Swagger documentation
async function registerSwagger() {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Get-A-Room API',
        description: 'A simple meeting room booking API built with Fastify and TypeScript',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'X-API-Key',
            in: 'header',
            description: 'API key for authentication',
          },
        },
      },
      tags: [
        { name: 'rooms', description: 'Room management endpoints' },
        { name: 'bookings', description: 'Booking management endpoints' },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });
}

// Register routes
async function registerRoutes() {
  await fastify.register(roomRoutes);
  await fastify.register(bookingRoutes);

  // Health check endpoint (no auth required)
  fastify.get('/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });
}

// Start server
async function start() {
  try {
    // Register Swagger first
    await registerSwagger();
    
    // Register routes
    await registerRoutes();

    // Start listening
    await fastify.listen({ port: PORT, host: HOST });

    console.log('\n🚀 Server is running!');
    console.log(`📝 API Documentation: http://localhost:${PORT}/docs`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
    console.log(`🔑 API Key: ${process.env.API_KEY || 'NOT SET - Check your .env file!'}\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
const closeGracefully = async (signal: string) => {
  console.log(`\n⚠️  Received signal ${signal}, closing server gracefully...`);
  await fastify.close();
  process.exit(0);
};

process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));

// Start the server
start();
