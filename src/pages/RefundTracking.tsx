import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  Loader2,
  Hotel,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  IndianRupee,
  CalendarClock,
  AlertCircle,
  CircleDot,
} from 'lucide-react';
import { format, addBusinessDays } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthContext } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { supabase } from '@/integrations/supabase/client';
import { mockRooms } from '@/data/mockRooms';
import { cn } from '@/lib/utils';

interface CancelledBooking {
  id: string;
  room_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_amount: number;
  deposit_amount: number;
  status: string;
  payment_status: string;
  updated_at: string;
  created_at: string;
}

const paymentStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle; progress: number }> = {
  refund_pending: {
    label: 'Refund Processing',
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    icon: Clock,
    progress: 40,
  },
  refund_processed: {
    label: 'Refund Completed',
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    icon: CheckCircle,
    progress: 100,
  },
  no_refund: {
    label: 'No Refund',
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    icon: XCircle,
    progress: 100,
  },
};

function getRefundEstimate(booking: CancelledBooking) {
  const cancelledDate = new Date(booking.updated_at);
  const estimatedDate = addBusinessDays(cancelledDate, 7);
  return estimatedDate;
}

function getRefundAmount(booking: CancelledBooking) {
  // Reconstruct the refund based on payment_status
  if (booking.payment_status === 'no_refund') return 0;
  // For refund_pending/refund_processed, the deposit was refundable
  // We approximate: if status is refund_pending, deposit is the refund
  return booking.deposit_amount;
}

function RefundCard({ booking }: { booking: CancelledBooking }) {
  const room = mockRooms.find(r => r.id === booking.room_id);
  const config = paymentStatusConfig[booking.payment_status] || paymentStatusConfig.no_refund;
  const StatusIcon = config.icon;
  const refundAmount = getRefundAmount(booking);
  const estimatedDate = getRefundEstimate(booking);
  const cancelledDate = new Date(booking.updated_at);
  const isProcessed = booking.payment_status === 'refund_processed';
  const isPending = booking.payment_status === 'refund_pending';
  const isNoRefund = booking.payment_status === 'no_refund';

  // Timeline steps
  const steps = isNoRefund
    ? [
        { label: 'Booking Cancelled', date: cancelledDate, done: true },
        { label: 'No Refund Applicable', date: cancelledDate, done: true },
      ]
    : [
        { label: 'Booking Cancelled', date: cancelledDate, done: true },
        { label: 'Refund Initiated', date: cancelledDate, done: true },
        { label: 'Processing by Bank', date: null, done: isProcessed },
        { label: 'Refund Credited', date: isProcessed ? estimatedDate : null, done: isProcessed },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Room Image */}
        <div className="sm:w-44 h-28 sm:h-auto overflow-hidden relative shrink-0">
          <img
            src={room?.images[0] || '/placeholder.svg'}
            alt={room?.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg text-foreground">
                {room?.name || 'Unknown Room'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Booking #{booking.id.slice(0, 8).toUpperCase()} •
                Cancelled on {format(cancelledDate, 'MMM d, yyyy')}
              </p>
            </div>
            <Badge className={cn('border shrink-0', config.color)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>

          {/* Refund Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Deposit Paid</p>
              <p className="text-lg font-semibold text-foreground flex items-center gap-1">
                <IndianRupee className="w-4 h-4" />
                {booking.deposit_amount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className={cn('rounded-lg p-3', refundAmount > 0 ? 'bg-green-500/5' : 'bg-red-500/5')}>
              <p className="text-xs text-muted-foreground mb-1">Refund Amount</p>
              <p className={cn('text-lg font-semibold flex items-center gap-1', refundAmount > 0 ? 'text-green-600' : 'text-red-500')}>
                <IndianRupee className="w-4 h-4" />
                {refundAmount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">
                {isProcessed ? 'Refunded On' : isPending ? 'Expected By' : 'Status'}
              </p>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <CalendarClock className="w-4 h-4 text-muted-foreground" />
                {isNoRefund
                  ? 'N/A'
                  : format(isProcessed ? estimatedDate : estimatedDate, 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* Progress bar for pending refunds */}
          {isPending && (
            <div className="mb-5">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Refund Progress</span>
                <span>Processing (5-7 business days)</span>
              </div>
              <Progress value={config.progress} className="h-2" />
            </div>
          )}

          {/* Timeline */}
          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
              Refund Timeline
            </p>
            <div className="flex flex-col gap-0">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {/* Timeline dot & line */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-3 h-3 rounded-full border-2 shrink-0 mt-0.5',
                      step.done
                        ? 'bg-accent border-accent'
                        : 'bg-background border-muted-foreground/30'
                    )} />
                    {idx < steps.length - 1 && (
                      <div className={cn(
                        'w-0.5 h-8',
                        step.done ? 'bg-accent/40' : 'bg-muted-foreground/15'
                      )} />
                    )}
                  </div>
                  {/* Text */}
                  <div className="pb-2">
                    <p className={cn(
                      'text-sm font-medium',
                      step.done ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-xs text-muted-foreground">
                        {format(step.date, 'MMM d, yyyy • h:mm a')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function RefundTracking() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useAuthContext();
  const [bookings, setBookings] = useState<CancelledBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'refund_pending' | 'refund_processed' | 'no_refund'>('all');

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchCancelledBookings();

      const channel = supabase
        .channel('refund-tracking')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bookings',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const updated = payload.new as CancelledBooking;
            if (updated.status === 'cancelled') {
              setBookings(prev => {
                const exists = prev.find(b => b.id === updated.id);
                if (exists) {
                  return prev.map(b => b.id === updated.id ? updated : b);
                }
                return [updated, ...prev];
              });
            }
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchCancelledBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'cancelled')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching cancelled bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.payment_status === filter);

  const pendingCount = bookings.filter(b => b.payment_status === 'refund_pending').length;
  const processedCount = bookings.filter(b => b.payment_status === 'refund_processed').length;
  const noRefundCount = bookings.filter(b => b.payment_status === 'no_refund').length;
  const totalRefundAmount = bookings
    .filter(b => b.payment_status !== 'no_refund')
    .reduce((sum, b) => sum + b.deposit_amount, 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-[calc(var(--header-height)+4rem)] pb-16">
          <div className="container max-w-5xl flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-[calc(var(--header-height)+4rem)] pb-16">
          <div className="container max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-display font-semibold mb-3">
                Track Your Refunds
              </h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Sign in to view your refund status and processing timeline.
              </p>
              <Button size="lg" onClick={() => setIsAuthModalOpen(true)}>
                Sign In to Continue
              </Button>
            </motion.div>
          </div>
        </main>
        <Footer />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-[calc(var(--header-height)+2rem)] pb-16">
        <div className="container max-w-5xl">
          {/* Back link + Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 gap-1.5 text-muted-foreground"
              onClick={() => navigate('/my-bookings')}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to My Bookings
            </Button>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Refund Tracking
            </h1>
            <p className="text-muted-foreground">
              Track the status and timeline of your booking refunds
            </p>
          </motion.div>

          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          >
            <div
              className={cn(
                'bg-card rounded-xl border p-4 text-center cursor-pointer transition-all hover:shadow-md',
                filter === 'all' ? 'border-accent ring-1 ring-accent/30' : 'border-border'
              )}
              onClick={() => setFilter('all')}
            >
              <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div
              className={cn(
                'bg-card rounded-xl border p-4 text-center cursor-pointer transition-all hover:shadow-md',
                filter === 'refund_pending' ? 'border-yellow-500 ring-1 ring-yellow-500/30' : 'border-border'
              )}
              onClick={() => setFilter('refund_pending')}
            >
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Processing</p>
            </div>
            <div
              className={cn(
                'bg-card rounded-xl border p-4 text-center cursor-pointer transition-all hover:shadow-md',
                filter === 'refund_processed' ? 'border-green-500 ring-1 ring-green-500/30' : 'border-border'
              )}
              onClick={() => setFilter('refund_processed')}
            >
              <p className="text-2xl font-bold text-green-600">{processedCount}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div
              className={cn(
                'bg-card rounded-xl border p-4 text-center cursor-pointer transition-all hover:shadow-md',
                filter === 'no_refund' ? 'border-red-500 ring-1 ring-red-500/30' : 'border-border'
              )}
              onClick={() => setFilter('no_refund')}
            >
              <p className="text-2xl font-bold text-red-500">{noRefundCount}</p>
              <p className="text-xs text-muted-foreground">No Refund</p>
            </div>
          </motion.div>

          {/* Total refund banner */}
          {totalRefundAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-8 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Total Refund Amount</p>
                  <p className="text-xs text-muted-foreground">{pendingCount} pending • {processedCount} completed</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">
                ₹{totalRefundAmount.toLocaleString('en-IN')}
              </p>
            </motion.div>
          )}

          {/* Refund Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredBookings.length > 0 ? (
                filteredBookings.map(booking => (
                  <RefundCard key={booking.id} booking={booking} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    {filter === 'all'
                      ? 'No cancelled bookings with refund information.'
                      : `No ${filter.replace('_', ' ')} refunds found.`}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/rooms')}
                  >
                    Browse Rooms
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Policy Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 bg-muted/50 rounded-xl p-6 border border-border"
          >
            <h3 className="font-display font-semibold text-lg mb-4 text-foreground">
              Cancellation & Refund Policy
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">24+ hours before</p>
                  <p className="text-xs text-muted-foreground">100% refund of deposit</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">12-24 hours before</p>
                  <p className="text-xs text-muted-foreground">50% refund of deposit</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Less than 12 hours</p>
                  <p className="text-xs text-muted-foreground">No refund applicable</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Refunds are typically processed within 5-7 business days and credited to the original payment method.
              For any issues, contact support@stayhour.com.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
