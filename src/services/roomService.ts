import { dataStore } from '../models/dataStore';
import { RoomWithStatus } from '../types';

export class RoomService {
  getAllRoomsWithStatus(): RoomWithStatus[] {
    const rooms = dataStore.getAllRooms();
    const now = new Date();

    return rooms.map(room => {
      const bookings = dataStore.getBookingsByRoomId(room.id);
      
      // Find current booking (if room is occupied right now)
      const currentBooking = bookings.find(
        booking => booking.startTime <= now && booking.endTime > now
      );

      const roomWithStatus: RoomWithStatus = {
        ...room,
        currentStatus: currentBooking ? 'occupied' : 'available',
      };

      if (currentBooking) {
        roomWithStatus.currentBooking = {
          id: currentBooking.id,
          title: currentBooking.title,
          startTime: currentBooking.startTime,
          endTime: currentBooking.endTime,
        };
      }

      return roomWithStatus;
    });
  }

  getRoomById(roomId: string) {
    return dataStore.getRoomById(roomId);
  }
}

export const roomService = new RoomService();
