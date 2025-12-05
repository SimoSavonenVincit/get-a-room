export interface Room {
  id: string;
  name: string;
  capacity: number;
  amenities: string[];
}

export interface Booking {
  id: string;
  roomId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  organizerEmail: string;
  createdAt: Date;
}

export interface CreateBookingRequest {
  roomId: string;
  title: string;
  startTime: string; // ISO 8601 format
  endTime: string;   // ISO 8601 format
  organizerEmail: string;
}

export interface RoomWithStatus extends Room {
  currentStatus: 'available' | 'occupied';
  currentBooking?: {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
  };
}
