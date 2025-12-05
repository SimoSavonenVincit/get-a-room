import { describe, it, expect, beforeEach } from 'vitest';
import { BookingService } from '../src/services/bookingService';
import { dataStore } from '../src/models/dataStore';

describe('BookingService', () => {
  let bookingService: BookingService;

  beforeEach(() => {
    bookingService = new BookingService();
    // Clear all bookings before each test
    const allBookings = dataStore.getAllBookings();
    allBookings.forEach(booking => dataStore.deleteBooking(booking.id));
  });

  describe('validateBookingTimes', () => {
    it('should reject bookings in the past', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
      const futureDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

      const result = bookingService.validateBookingTimes(pastDate, futureDate);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('past');
    });

    it('should reject bookings where start time equals end time', () => {
      const time = new Date(Date.now() + 1000 * 60 * 60);

      const result = bookingService.validateBookingTimes(time, time);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('before end time');
    });

    it('should reject bookings where start time is after end time', () => {
      const startTime = new Date(Date.now() + 1000 * 60 * 120); // 2 hours from now
      const endTime = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

      const result = bookingService.validateBookingTimes(startTime, endTime);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('before end time');
    });

    it('should accept valid future bookings', () => {
      const startTime = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
      const endTime = new Date(Date.now() + 1000 * 60 * 120); // 2 hours from now

      const result = bookingService.validateBookingTimes(startTime, endTime);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('checkRoomAvailability', () => {
    it('should return false for non-existent room', () => {
      const startTime = new Date(Date.now() + 1000 * 60 * 60);
      const endTime = new Date(Date.now() + 1000 * 60 * 120);

      const result = bookingService.checkRoomAvailability('non-existent', startTime, endTime);

      expect(result.available).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should return true for available room', () => {
      const startTime = new Date(Date.now() + 1000 * 60 * 60);
      const endTime = new Date(Date.now() + 1000 * 60 * 120);

      const result = bookingService.checkRoomAvailability('room-001', startTime, endTime);

      expect(result.available).toBe(true);
    });

    it('should detect overlapping bookings', () => {
      // Create an existing booking
      const existingStart = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
      const existingEnd = new Date(Date.now() + 1000 * 60 * 120); // 2 hours from now

      bookingService.createBooking({
        roomId: 'room-001',
        title: 'Existing Meeting',
        startTime: existingStart.toISOString(),
        endTime: existingEnd.toISOString(),
        organizerEmail: 'existing@example.com',
      });

      // Try to book overlapping time
      const newStart = new Date(Date.now() + 1000 * 60 * 90); // 1.5 hours from now (overlaps)
      const newEnd = new Date(Date.now() + 1000 * 60 * 150); // 2.5 hours from now

      const result = bookingService.checkRoomAvailability('room-001', newStart, newEnd);

      expect(result.available).toBe(false);
      expect(result.error).toContain('not available');
    });
  });

  describe('createBooking', () => {
    it('should create a valid booking', () => {
      const startTime = new Date(Date.now() + 1000 * 60 * 60);
      const endTime = new Date(Date.now() + 1000 * 60 * 120);

      const result = bookingService.createBooking({
        roomId: 'room-001',
        title: 'Team Meeting',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        organizerEmail: 'organizer@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.booking).toBeDefined();
      expect(result.booking?.title).toBe('Team Meeting');
      expect(result.booking?.id).toBeDefined();
    });

    it('should reject booking with invalid times', () => {
      const pastTime = new Date(Date.now() - 1000 * 60 * 60);
      const futureTime = new Date(Date.now() + 1000 * 60 * 60);

      const result = bookingService.createBooking({
        roomId: 'room-001',
        title: 'Team Meeting',
        startTime: pastTime.toISOString(),
        endTime: futureTime.toISOString(),
        organizerEmail: 'organizer@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject overlapping bookings', () => {
      const start1 = new Date(Date.now() + 1000 * 60 * 60);
      const end1 = new Date(Date.now() + 1000 * 60 * 120);

      // Create first booking
      bookingService.createBooking({
        roomId: 'room-001',
        title: 'First Meeting',
        startTime: start1.toISOString(),
        endTime: end1.toISOString(),
        organizerEmail: 'first@example.com',
      });

      // Try to create overlapping booking
      const start2 = new Date(Date.now() + 1000 * 60 * 90);
      const end2 = new Date(Date.now() + 1000 * 60 * 150);

      const result = bookingService.createBooking({
        roomId: 'room-001',
        title: 'Second Meeting',
        startTime: start2.toISOString(),
        endTime: end2.toISOString(),
        organizerEmail: 'second@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not available');
    });
  });

  describe('cancelBooking', () => {
    it('should cancel an existing booking', () => {
      const startTime = new Date(Date.now() + 1000 * 60 * 60);
      const endTime = new Date(Date.now() + 1000 * 60 * 120);

      const createResult = bookingService.createBooking({
        roomId: 'room-001',
        title: 'Meeting to Cancel',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        organizerEmail: 'organizer@example.com',
      });

      const bookingId = createResult.booking!.id;
      const cancelResult = bookingService.cancelBooking(bookingId);

      expect(cancelResult.success).toBe(true);
      expect(dataStore.getBookingById(bookingId)).toBeUndefined();
    });

    it('should return error for non-existent booking', () => {
      const result = bookingService.cancelBooking('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});
