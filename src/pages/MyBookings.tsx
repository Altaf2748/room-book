import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  ChevronRight,
  Loader2,
  Hotel,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
  RefreshCw,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthContext } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { supabase } from '@/integrations/supabase/client';
import { mockRooms } from '@/data/mockRooms';
import { cn } from '@/lib/utils';

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

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  confirmed: { label: 'Confirmed', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle },
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: Timer },
  completed: { label: 'Completed', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
  refunded: { label: 'Refunded', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20', icon: RefreshCw },
};

export default function MyBookings() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useAuthContext();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchBookings();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime12h = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getRoomDetails = (roomId: string) => {
    return mockRooms.find(r => r.id === roomId);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings.filter(b => {
    const bookingDate = new Date(b.booking_date);
    return bookingDate >= today && b.status !== 'cancelled';
  });

  const pastBookings = bookings.filter(b => {
    const bookingDate = new Date(b.booking_date);
    return bookingDate < today || b.status === 'completed';
  });

  const cancelledBookings = bookings.filter(b => 
    b.status === 'cancelled' || b.status === 'refunded'
  );

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
                <Hotel className="w-10 h-10 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-display font-semibold mb-3">
                View Your Bookings
              </h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Sign in to view your booking history, manage reservations, and access your upcoming stays.
              </p>
              <Button size="lg" onClick={() => setIsAuthModalOpen(true)}>
                Sign In to Continue
              </Button>
            </motion.div>
          </div>
        </main>
        <Footer />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </div>
    );
  }

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const room = getRoomDetails(booking.room_id);
    const status = statusConfig[booking.status] || statusConfig.pending;
    const StatusIcon = status.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all group"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Room Image */}
          <div className="sm:w-48 h-32 sm:h-auto overflow-hidden">
            <img
              src={room?.images[0] || '/placeholder.svg'}
              alt={room?.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
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
      </motion.div>
    );
  };

  const EmptyState = ({ message, icon: Icon }: { message: string; icon: typeof Calendar }) => (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{message}</p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={() => navigate('/rooms')}
      >
        Browse Rooms
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-[calc(var(--header-height)+2rem)] pb-16">
        <div className="container max-w-5xl">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              My Bookings
            </h1>
            <p className="text-muted-foreground">
              Manage your reservations and view booking history
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-accent">{upcomingBookings.length}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{pastBookings.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-muted-foreground">{bookings.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </motion.div>

          {/* Bookings Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="upcoming" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Upcoming ({upcomingBookings.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Past ({pastBookings.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="gap-2">
                  <XCircle className="w-4 h-4" />
                  Cancelled ({cancelledBookings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))
                ) : (
                  <EmptyState 
                    message="No upcoming bookings. Ready to plan your next stay?" 
                    icon={Calendar} 
                  />
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastBookings.length > 0 ? (
                  pastBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))
                ) : (
                  <EmptyState 
                    message="No past bookings yet. Book your first stay!" 
                    icon={Hotel} 
                  />
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="space-y-4">
                {cancelledBookings.length > 0 ? (
                  cancelledBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))
                ) : (
                  <EmptyState 
                    message="No cancelled bookings" 
                    icon={AlertCircle} 
                  />
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
