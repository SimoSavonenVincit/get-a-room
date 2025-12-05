import { dataStore } from '../models/dataStore';
import { CreateBookingRequest, Booking } from '../types';

export class BookingService {
  validateBookingTimes(startTime: Date, endTime: Date): { valid: boolean; error?: string } {
    const now = new Date();

    // Check if start time is in the past
    if (startTime < now) {
      return {
        valid: false,
        error: 'Booking start time cannot be in the past',
      };
    }

    // Check if start time is before end time
    if (startTime >= endTime) {
      return {
        valid: false,
        error: 'Booking start time must be before end time',
      };
    }

    return { valid: true };
  }

  checkRoomAvailability(
    roomId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
  ): { available: boolean; error?: string } {
    const room = dataStore.getRoomById(roomId);

    if (!room) {
      return {
        available: false,
        error: 'Room not found',
      };
    }

    const isAvailable = dataStore.isRoomAvailable(roomId, startTime, endTime, excludeBookingId);

    if (!isAvailable) {
      return {
        available: false,
        error: 'Room is not available for the selected time slot. There is an overlapping booking.',
      };
    }

    return { available: true };
  }

  createBooking(request: CreateBookingRequest): { success: boolean; booking?: Booking; error?: string } {
    const startTime = new Date(request.startTime);
    const endTime = new Date(request.endTime);

    // Validate times
    const timeValidation = this.validateBookingTimes(startTime, endTime);
    if (!timeValidation.valid) {
      return { success: false, error: timeValidation.error };
    }

    // Check availability
    const availabilityCheck = this.checkRoomAvailability(request.roomId, startTime, endTime);
    if (!availabilityCheck.available) {
      return { success: false, error: availabilityCheck.error };
    }

    // Create the booking
    const booking = dataStore.createBooking({
      roomId: request.roomId,
      title: request.title,
      startTime,
      endTime,
      organizerEmail: request.organizerEmail,
    });

    return { success: true, booking };
  }

  cancelBooking(bookingId: string): { success: boolean; error?: string } {
    const booking = dataStore.getBookingById(bookingId);

    if (!booking) {
      return {
        success: false,
        error: 'Booking not found',
      };
    }

    const deleted = dataStore.deleteBooking(bookingId);

    if (!deleted) {
      return {
        success: false,
        error: 'Failed to delete booking',
      };
    }

    return { success: true };
  }

  getRoomBookings(roomId: string): Booking[] {
    return dataStore.getBookingsByRoomId(roomId);
  }
}

export const bookingService = new BookingService();
