import { FastifyInstance } from 'fastify';
import { bookingService } from '../services/bookingService';
import { authenticateApiKey } from '../middleware/auth';
import { CreateBookingRequest } from '../types';

export async function bookingRoutes(fastify: FastifyInstance) {
  // POST /bookings - Create a new booking
  fastify.post(
    '/bookings',
    {
      onRequest: authenticateApiKey,
      schema: {
        description: 'Create a new room booking',
        tags: ['bookings'],
        security: [{ apiKey: [] }],
        body: {
          type: 'object',
          required: ['roomId', 'title', 'startTime', 'endTime', 'organizerEmail'],
          properties: {
            roomId: { type: 'string', description: 'ID of the room to book' },
            title: { type: 'string', description: 'Title/purpose of the meeting' },
            startTime: { type: 'string', format: 'date-time', description: 'Start time in ISO 8601 format' },
            endTime: { type: 'string', format: 'date-time', description: 'End time in ISO 8601 format' },
            organizerEmail: { type: 'string', format: 'email', description: 'Email of the organizer' },
          },
        },
        response: {
          201: {
            description: 'Booking created successfully',
            type: 'object',
            properties: {
              message: { type: 'string' },
              booking: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  roomId: { type: 'string' },
                  title: { type: 'string' },
                  startTime: { type: 'string', format: 'date-time' },
                  endTime: { type: 'string', format: 'date-time' },
                  organizerEmail: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
          400: {
            description: 'Bad request - validation error',
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
      const bookingRequest = request.body as CreateBookingRequest;

      const result = bookingService.createBooking(bookingRequest);

      if (!result.success) {
        return reply.status(400).send({
          error: 'Booking Error',
          message: result.error,
        });
      }

      return reply.status(201).send({
        message: 'Booking created successfully',
        booking: result.booking,
      });
    }
  );

  // DELETE /bookings/:bookingId - Cancel a booking
  fastify.delete(
    '/bookings/:bookingId',
    {
      onRequest: authenticateApiKey,
      schema: {
        description: 'Cancel an existing booking',
        tags: ['bookings'],
        security: [{ apiKey: [] }],
        params: {
          type: 'object',
          properties: {
            bookingId: { type: 'string' },
          },
          required: ['bookingId'],
        },
        response: {
          200: {
            description: 'Booking cancelled successfully',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          404: {
            description: 'Booking not found',
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
      const { bookingId } = request.params as { bookingId: string };

      const result = bookingService.cancelBooking(bookingId);

      if (!result.success) {
        return reply.status(404).send({
          error: 'Not Found',
          message: result.error,
        });
      }

      return reply.send({
        message: 'Booking cancelled successfully',
      });
    }
  );
}
