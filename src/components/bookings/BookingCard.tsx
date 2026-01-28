import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Users,
  ChevronRight,
  Timer,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { mockRooms } from '@/data/mockRooms';
import { CancelBookingDialog } from './CancelBookingDialog';

interface Booking {
  id: string;
  room_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  guests: number;
  total_amount: number;
  deposit_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

interface BookingCardProps {
  booking: Booking;
  onCancelled: () => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  confirmed: { label: 'Confirmed', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle },
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: Timer },
  completed: { label: 'Completed', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
  refunded: { label: 'Refunded', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20', icon: RefreshCw },
};

export function BookingCard({ booking, onCancelled }: BookingCardProps) {
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const room = mockRooms.find(r => r.id === booking.room_id);
  const status = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const formatTime12h = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const isUpcoming = () => {
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
    return bookingDateTime > new Date() && booking.status !== 'cancelled';
  };

  const canCancel = isUpcoming() && booking.status !== 'cancelled' && booking.status !== 'completed';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all group"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Room Image */}
          <div className="sm:w-48 h-32 sm:h-auto overflow-hidden relative">
            <img
              src={room?.images[0] || '/placeholder.svg'}
              alt={room?.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {booking.status === 'cancelled' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-medium">Cancelled</span>
              </div>
            )}
          </div>
          
          {/* Booking Details */}
          <div className="flex-1 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  {room?.name || 'Unknown Room'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Booking #{booking.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <Badge className={cn('border', status.color)}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>{format(new Date(booking.booking_date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{formatTime12h(booking.start_time)} - {formatTime12h(booking.end_time)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Timer className="w-4 h-4 shrink-0" />
                <span>{booking.duration_hours}h</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4 shrink-0" />
                <span>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-lg font-semibold text-foreground">
                  ₹{booking.total_amount.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelDialog(true)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/room/${booking.room_id}`)}
                  className="gap-1"
                >
                  View Room
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <CancelBookingDialog
        booking={booking}
        roomName={room?.name || 'Unknown Room'}
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onCancelled={() => {
          setShowCancelDialog(false);
          onCancelled();
        }}
      />
    </>
  );
}
