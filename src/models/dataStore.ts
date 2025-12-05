import { Room, Booking } from '../types';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage
class DataStore {
  private rooms: Map<string, Room> = new Map();
  private bookings: Map<string, Booking> = new Map();

  constructor() {
    this.initializeRooms();
  }

  private initializeRooms() {
    const hardcodedRooms: Room[] = [
      {
        id: 'room-001',
        name: 'Conference Room A',
        capacity: 10,
        amenities: ['Projector', 'Whiteboard', 'Video Conferencing', 'TV Display'],
      },
      {
        id: 'room-002',
        name: 'Meeting Room B',
        capacity: 6,
        amenities: ['Whiteboard', 'TV Display'],
      },
      {
        id: 'room-003',
        name: 'Small Room C',
        capacity: 4,
        amenities: ['Whiteboard'],
      },
      {
        id: 'room-004',
        name: 'Executive Boardroom',
        capacity: 12,
        amenities: ['Projector', 'Whiteboard', 'Video Conferencing', 'TV Display', 'Coffee Machine'],
      },
    ];

    hardcodedRooms.forEach(room => {
      this.rooms.set(room.id, room);
    });
  }

  // Room operations
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  getRoomById(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  // Booking operations
  getAllBookings(): Booking[] {
    return Array.from(this.bookings.values());
  }

  getBookingById(id: string): Booking | undefined {
    return this.bookings.get(id);
  }

  getBookingsByRoomId(roomId: string): Booking[] {
    return Array.from(this.bookings.values()).filter(
      booking => booking.roomId === roomId
    );
  }

  createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Booking {
    const newBooking: Booking = {
      ...booking,
      id: uuidv4(),
      createdAt: new Date(),
    };
    this.bookings.set(newBooking.id, newBooking);
    return newBooking;
  }

  deleteBooking(id: string): boolean {
    return this.bookings.delete(id);
  }

  // Check if a time slot is available
  isRoomAvailable(roomId: string, startTime: Date, endTime: Date, excludeBookingId?: string): boolean {
    const roomBookings = this.getBookingsByRoomId(roomId);
    
    return !roomBookings.some(booking => {
      // Skip the booking we're checking against (for updates)
      if (excludeBookingId && booking.id === excludeBookingId) {
        return false;
      }

      // Check for overlap: new booking starts before existing ends AND new booking ends after existing starts
      return startTime < booking.endTime && endTime > booking.startTime;
    });
  }
}

// Export singleton instance
export const dataStore = new DataStore();
