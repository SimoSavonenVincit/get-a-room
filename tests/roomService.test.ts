import { describe, it, expect, beforeEach } from 'vitest';
import { roomService } from '../src/services/roomService';
import { dataStore } from '../src/models/dataStore';

describe('RoomService', () => {
  // Clean up bookings before each test
  beforeEach(() => {
    const allBookings = dataStore.getAllBookings();
    allBookings.forEach(booking => dataStore.deleteBooking(booking.id));
  });

  describe('getAllRoomsWithStatus', () => {
    it('should return all rooms with available status when no bookings', () => {
      const rooms = roomService.getAllRoomsWithStatus();

      expect(rooms.length).toBeGreaterThan(0);
      rooms.forEach(room => {
        expect(room.currentStatus).toBe('available');
        expect(room.currentBooking).toBeUndefined();
      });
    });

    it('should show occupied status for currently booked rooms', () => {
      // Create a booking that's happening right now
      const now = new Date();
      const startTime = new Date(now.getTime() - 1000 * 60 * 30); // Started 30 min ago
      const endTime = new Date(now.getTime() + 1000 * 60 * 30); // Ends in 30 min

      dataStore.createBooking({
        roomId: 'room-001',
        title: 'Current Meeting',
        startTime,
        endTime,
        organizerEmail: 'test@example.com',
      });

      const rooms = roomService.getAllRoomsWithStatus();
      const bookedRoom = rooms.find(r => r.id === 'room-001');

      expect(bookedRoom).toBeDefined();
      expect(bookedRoom!.currentStatus).toBe('occupied');
      expect(bookedRoom!.currentBooking).toBeDefined();
      expect(bookedRoom!.currentBooking!.title).toBe('Current Meeting');
    });

    it('should return all hardcoded rooms', () => {
      const rooms = roomService.getAllRoomsWithStatus();
      
      expect(rooms.length).toBe(4);
      
      const roomNames = rooms.map(r => r.name);
      expect(roomNames).toContain('Conference Room A');
      expect(roomNames).toContain('Meeting Room B');
      expect(roomNames).toContain('Small Room C');
      expect(roomNames).toContain('Executive Boardroom');
    });
  });

  describe('getRoomById', () => {
    it('should return room for valid ID', () => {
      const room = roomService.getRoomById('room-001');

      expect(room).toBeDefined();
      expect(room!.id).toBe('room-001');
      expect(room!.name).toBe('Conference Room A');
    });

    it('should return undefined for invalid ID', () => {
      const room = roomService.getRoomById('non-existent');

      expect(room).toBeUndefined();
    });
  });
});
