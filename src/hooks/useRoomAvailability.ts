import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface BookedSlot {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface UseRoomAvailabilityProps {
  date: Date;
  startTime: string;
  durationHours: number;
}

interface RoomAvailability {
  roomId: string;
  isAvailable: boolean;
  conflictingSlots: BookedSlot[];
}

export function useRoomAvailability({ date, startTime, durationHours }: UseRoomAvailabilityProps) {
  const [bookings, setBookings] = useState<BookedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateStr = format(date, 'yyyy-MM-dd');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('room_id, booking_date, start_time, end_time, status')
        .eq('booking_date', dateStr)
        .in('status', ['confirmed', 'pending']);
      
      if (fetchError) {
        throw fetchError;
      }
      
      const slots: BookedSlot[] = (data || []).map((booking) => ({
        roomId: booking.room_id,
        date: booking.booking_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        status: booking.status,
      }));
      
      setBookings(slots);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    fetchBookings();

    // Subscribe to realtime booking changes
    const channel = supabase
      .channel('room-availability')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          console.log('Realtime booking update:', payload);
          // Refetch bookings when any change occurs
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBookings]);

  // Check if a specific room is available for the given time slot
  const checkRoomAvailability = useCallback((roomId: string): RoomAvailability => {
    const [startHour] = startTime.split(':').map(Number);
    const endHour = (startHour + durationHours) % 24;
    const endTimeStr = `${endHour.toString().padStart(2, '0')}:00`;
    
    const conflictingSlots = bookings.filter((booking) => {
      if (booking.roomId !== roomId) return false;
      
      const bookingStart = parseInt(booking.startTime.split(':')[0], 10);
      const bookingEnd = parseInt(booking.endTime.split(':')[0], 10);
      
      // Check for overlap
      // Two time ranges overlap if one starts before the other ends
      const requestStart = startHour;
      const requestEnd = endHour > startHour ? endHour : endHour + 24;
      const bStart = bookingStart;
      const bEnd = bookingEnd > bookingStart ? bookingEnd : bookingEnd + 24;
      
      return requestStart < bEnd && bStart < requestEnd;
    });
    
    return {
      roomId,
      isAvailable: conflictingSlots.length === 0,
      conflictingSlots,
    };
  }, [bookings, startTime, durationHours]);

  // Get all booked time slots for a specific room
  const getBookedSlotsForRoom = useCallback((roomId: string): string[] => {
    const roomBookings = bookings.filter((b) => b.roomId === roomId);
    const bookedTimes: string[] = [];
    
    roomBookings.forEach((booking) => {
      const startHour = parseInt(booking.startTime.split(':')[0], 10);
      const endHour = parseInt(booking.endTime.split(':')[0], 10);
      
      // Add all hours in the booking range
      let hour = startHour;
      while (hour !== endHour) {
        bookedTimes.push(`${hour.toString().padStart(2, '0')}:00`);
        hour = (hour + 1) % 24;
      }
    });
    
    return bookedTimes;
  }, [bookings]);

  // Get availability for all rooms
  const getAllRoomsAvailability = useCallback((roomIds: string[]): Map<string, RoomAvailability> => {
    const availabilityMap = new Map<string, RoomAvailability>();
    
    roomIds.forEach((roomId) => {
      availabilityMap.set(roomId, checkRoomAvailability(roomId));
    });
    
    return availabilityMap;
  }, [checkRoomAvailability]);

  return {
    bookings,
    loading,
    error,
    checkRoomAvailability,
    getBookedSlotsForRoom,
    getAllRoomsAvailability,
    refetch: fetchBookings,
  };
}

// Helper function to format time range display
export function formatTimeRange(startTime: string, endTime: string): string {
  const formatHour = (time: string) => {
    const [hours] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours} ${period}`;
  };
  
  return `${formatHour(startTime)} - ${formatHour(endTime)}`;
}
