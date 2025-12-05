import { FastifyInstance } from 'fastify';
import { roomService } from '../services/roomService';
import { authenticateApiKey } from '../middleware/auth';
import { dataStore } from '../models/dataStore';

export async function roomRoutes(fastify: FastifyInstance) {
  // GET /rooms - List all rooms with their current status
  fastify.get(
    '/rooms',
    {
      onRequest: authenticateApiKey,
      schema: {
        description: 'Get all meeting rooms with their current status',
        tags: ['rooms'],
        security: [{ apiKey: [] }],
        response: {
          200: {
            description: 'Successful response',
            type: 'object',
            properties: {
              rooms: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    capacity: { type: 'number' },
                    amenities: { type: 'array', items: { type: 'string' } },
                    currentStatus: { type: 'string', enum: ['available', 'occupied'] },
                    currentBooking: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        startTime: { type: 'string', format: 'date-time' },
                        endTime: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const rooms = roomService.getAllRoomsWithStatus();
      return reply.send({ rooms });
    }
  );

  // GET /rooms/:roomId/bookings - Get all bookings for a specific room
  fastify.get(
    '/rooms/:roomId/bookings',
    {
      onRequest: authenticateApiKey,
      schema: {
        description: 'Get all bookings for a specific room',
        tags: ['rooms', 'bookings'],
        security: [{ apiKey: [] }],
        params: {
          type: 'object',
          properties: {
            roomId: { type: 'string' },
          },
          required: ['roomId'],
        },
        response: {
          200: {
            description: 'Successful response',
            type: 'object',
            properties: {
              roomId: { type: 'string' },
              roomName: { type: 'string' },
              bookings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    startTime: { type: 'string', format: 'date-time' },
                    endTime: { type: 'string', format: 'date-time' },
                    organizerEmail: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Room not found',
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { roomId } = request.params as { roomId: string };

      const room = roomService.getRoomById(roomId);
      if (!room) {
        return reply.status(404).send({
          error: 'Not Found',
          message: `Room with ID '${roomId}' not found`,
        });
      }

      const bookings = dataStore.getBookingsByRoomId(roomId);
      
      return reply.send({
        roomId: room.id,
        roomName: room.name,
        bookings,
      });
    }
  );
}
