import { useState } from 'react';
import { format, differenceInHours } from 'date-fns';
import { AlertTriangle, Calendar, Clock, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
}

interface CancelBookingDialogProps {
  booking: Booking;
  roomName: string;
  isOpen: boolean;
  onClose: () => void;
  onCancelled: () => void;
}

export function CancelBookingDialog({
  booking,
  roomName,
  isOpen,
  onClose,
  onCancelled,
}: CancelBookingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const calculateRefund = () => {
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
    const hoursUntilBooking = differenceInHours(bookingDateTime, new Date());

    // Cancellation policy:
    // - More than 24 hours: 100% refund of deposit
    // - 12-24 hours: 50% refund of deposit
    // - Less than 12 hours: No refund
    let refundPercentage = 0;
    let policyMessage = '';

    if (hoursUntilBooking > 24) {
      refundPercentage = 100;
      policyMessage = 'Full refund - cancelled more than 24 hours before check-in';
    } else if (hoursUntilBooking >= 12) {
      refundPercentage = 50;
      policyMessage = '50% refund - cancelled 12-24 hours before check-in';
    } else if (hoursUntilBooking > 0) {
      refundPercentage = 0;
      policyMessage = 'No refund - cancelled less than 12 hours before check-in';
    } else {
      refundPercentage = 0;
      policyMessage = 'No refund - booking time has passed';
    }

    const refundAmount = Math.round((booking.deposit_amount * refundPercentage) / 100);

    return { refundPercentage, refundAmount, policyMessage, hoursUntilBooking };
  };

  const { refundPercentage, refundAmount, policyMessage, hoursUntilBooking } = calculateRefund();

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          payment_status: refundAmount > 0 ? 'refund_pending' : 'no_refund',
        })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: 'Booking Cancelled',
        description: refundAmount > 0
          ? `Your booking has been cancelled. Refund of ₹${refundAmount.toLocaleString('en-IN')} will be processed within 5-7 business days.`
          : 'Your booking has been cancelled.',
      });

      onCancelled();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Cancel Booking
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>Are you sure you want to cancel this booking?</p>

              {/* Booking Details */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="font-medium text-foreground">{roomName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{booking.start_time} - {booking.end_time}</span>
                </div>
              </div>

              {/* Refund Policy */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Deposit Paid</span>
                  <span className="font-medium text-foreground">
                    ₹{booking.deposit_amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Refund Amount</span>
                  <span className={`font-semibold ${refundAmount > 0 ? 'text-green-600' : 'text-destructive'}`}>
                    ₹{refundAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    refundPercentage === 100
                      ? 'bg-green-500/10 text-green-600 border-green-500/20'
                      : refundPercentage === 50
                      ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                      : 'bg-red-500/10 text-red-600 border-red-500/20'
                  }
                >
                  {policyMessage}
                </Badge>
              </div>

              {hoursUntilBooking > 0 && hoursUntilBooking <= 24 && (
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Cancel at least 24 hours before check-in for a full refund.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Keep Booking</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Yes, Cancel Booking'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
