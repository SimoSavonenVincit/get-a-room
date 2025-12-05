import { describe, it, expect, beforeEach } from 'vitest';
import { dataStore } from '../src/models/dataStore';

describe('DataStore', () => {
  // Clean up bookings before each test
  beforeEach(() => {
    const allBookings = dataStore.getAllBookings();
    allBookings.forEach(booking => dataStore.deleteBooking(booking.id));
  });

  describe('Room operations', () => {
    it('should have hardcoded rooms initialized', () => {
      const rooms = dataStore.getAllRooms();

      expect(rooms.length).toBe(4);
      expect(rooms[0].id).toBe('room-001');
      expect(rooms[0].name).toBe('Conference Room A');
      expect(rooms[0].capacity).toBe(10);
    });

    it('should retrieve room by ID', () => {
      const room = dataStore.getRoomById('room-002');

      expect(room).toBeDefined();
      expect(room!.name).toBe('Meeting Room B');
      expect(room!.capacity).toBe(6);
    });

    it('should return undefined for non-existent room', () => {
      const room = dataStore.getRoomById('non-existent');

      expect(room).toBeUndefined();
    });
  });

  describe('Booking operations', () => {
    it('should create a booking with generated ID', () => {
      const booking = dataStore.createBooking({
        roomId: 'room-001',
        title: 'Test Meeting',
        startTime: new Date('2025-12-10T10:00:00Z'),
        endTime: new Date('2025-12-10T11:00:00Z'),
        organizerEmail: 'test@example.com',
      });

      expect(booking.id).toBeDefined();
      expect(booking.title).toBe('Test Meeting');
      expect(booking.createdAt).toBeInstanceOf(Date);
    });

    it('should retrieve booking by ID', () => {
      const created = dataStore.createBooking({
        roomId: 'room-001',
        title: 'Test Meeting',
        startTime: new Date('2025-12-10T10:00:00Z'),
        endTime: new Date('2025-12-10T11:00:00Z'),
        organizerEmail: 'test@example.com',
      });

      const retrieved = dataStore.getBookingById(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should retrieve bookings by room ID', () => {
      dataStore.createBooking({
        roomId: 'room-001',
        title: 'Meeting 1',
        startTime: new Date('2025-12-10T10:00:00Z'),
        endTime: new Date('2025-12-10T11:00:00Z'),
        organizerEmail: 'test@example.com',
      });

      dataStore.createBooking({
        roomId: 'room-001',
        title: 'Meeting 2',
        startTime: new Date('2025-12-10T12:00:00Z'),
        endTime: new Date('2025-12-10T13:00:00Z'),
        organizerEmail: 'test@example.com',
      });

      dataStore.createBooking({
        roomId: 'room-002',
        title: 'Meeting 3',
        startTime: new Date('2025-12-10T10:00:00Z'),
        endTime: new Date('2025-12-10T11:00:00Z'),
        organizerEmail: 'test@example.com',
      });

      const room1Bookings = dataStore.getBookingsByRoomId('room-001');

      expect(room1Bookings.length).toBe(2);
      expect(room1Bookings.every(b => b.roomId === 'room-001')).toBe(true);
    });

    it('should delete booking', () => {
      const booking = dataStore.createBooking({
        roomId: 'room-001',
        title: 'Test Meeting',
        startTime: new Date('2025-12-10T10:00:00Z'),
        endTime: new Date('2025-12-10T11:00:00Z'),
        organizerEmail: 'test@example.com',
      });

      const deleted = dataStore.deleteBooking(booking.id);
      expect(deleted).toBe(true);

      const retrieved = dataStore.getBookingById(booking.id);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('isRoomAvailable', () => {
    it('should return true for available time slot', () => {
      const available = dataStore.isRoomAvailable(
        'room-001',
        new Date('2025-12-10T10:00:00Z'),
        new Date('2025-12-10T11:00:00Z')
      );

      expect(available).toBe(true);
    });

    it('should detect overlapping bookings', () => {
      dataStore.createBooking({
        roomId: 'room-001',
        title: 'Existing Meeting',
        startTime: new Date('2025-12-10T10:00:00Z'),
        endTime: new Date('2025-12-10T11:00:00Z'),
        organizerEmail: 'test@example.com',
      });

      // Overlapping booking
      const available = dataStore.isRoomAvailable(
        'room-001',
        new Date('2025-12-10T10:30:00Z'),
        new Date('2025-12-10T11:30:00Z')
      );

      expect(available).toBe(false);
    });

    it('should allow back-to-back bookings', () => {
      dataStore.createBooking({
        roomId: 'room-001',
        title: 'First Meeting',
        startTime: new Date('2025-12-10T10:00:00Z'),
        endTime: new Date('2025-12-10T11:00:00Z'),
        organizerEmail: 'test@example.com',
      });

      // Back-to-back booking (starts when previous ends)
      const available = dataStore.isRoomAvailable(
        'room-001',
        new Date('2025-12-10T11:00:00Z'),
        new Date('2025-12-10T12:00:00Z')
      );

      expect(available).toBe(true);
    });
  });
});
