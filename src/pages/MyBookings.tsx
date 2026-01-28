import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Loader2,
  Hotel,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { supabase } from '@/integrations/supabase/client';
import { BookingCard } from '@/components/bookings/BookingCard';

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
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('bookings-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Booking update:', payload);
            if (payload.eventType === 'UPDATE') {
              setBookings(prev => 
                prev.map(b => b.id === payload.new.id ? payload.new as Booking : b)
              );
            } else if (payload.eventType === 'INSERT') {
              setBookings(prev => [payload.new as Booking, ...prev]);
            } else if (payload.eventType === 'DELETE') {
              setBookings(prev => prev.filter(b => b.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings.filter(b => {
    const bookingDate = new Date(b.booking_date);
    return bookingDate >= today && b.status !== 'cancelled' && b.status !== 'completed';
  });

  const pastBookings = bookings.filter(b => {
    const bookingDate = new Date(b.booking_date);
    return (bookingDate < today && b.status !== 'cancelled') || b.status === 'completed';
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

  const EmptyState = ({ message, icon: Icon }: { message: string; icon: typeof Calendar }) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
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
    </motion.div>
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
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-card rounded-xl border border-border p-4 text-center cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setActiveTab('upcoming')}
            >
              <p className="text-2xl font-bold text-accent">{upcomingBookings.length}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-card rounded-xl border border-border p-4 text-center cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setActiveTab('past')}
            >
              <p className="text-2xl font-bold text-foreground">{pastBookings.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-card rounded-xl border border-border p-4 text-center cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setActiveTab('cancelled')}
            >
              <p className="text-2xl font-bold text-muted-foreground">{cancelledBookings.length}</p>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </motion.div>
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
                <AnimatePresence mode="popLayout">
                  {upcomingBookings.length > 0 ? (
                    upcomingBookings.map(booking => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        onCancelled={fetchBookings}
                      />
                    ))
                  ) : (
                    <EmptyState 
                      message="No upcoming bookings. Ready to plan your next stay?" 
                      icon={Calendar} 
                    />
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {pastBookings.length > 0 ? (
                    pastBookings.map(booking => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        onCancelled={fetchBookings}
                      />
                    ))
                  ) : (
                    <EmptyState 
                      message="No past bookings yet. Book your first stay!" 
                      icon={Hotel} 
                    />
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="cancelled" className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {cancelledBookings.length > 0 ? (
                    cancelledBookings.map(booking => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        onCancelled={fetchBookings}
                      />
                    ))
                  ) : (
                    <EmptyState 
                      message="No cancelled bookings" 
                      icon={AlertCircle} 
                    />
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
