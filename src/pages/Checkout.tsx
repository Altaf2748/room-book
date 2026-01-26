import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Shield,
  CreditCard,
  Clock,
  Users,
  Calendar,
  CheckCircle,
  Loader2,
  Lock,
  Building2,
  Phone,
  Mail,
  User,
  AlertCircle,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { mockRooms } from '@/data/mockRooms';
import { calculatePrice, formatTime } from '@/hooks/useBookingSearch';
import { useAuthContext } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type CheckoutStep = 'auth' | 'details' | 'payment' | 'confirmation';

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, loading: authLoading, isAuthenticated } = useAuthContext();
  
  // Booking details from URL
  const roomId = searchParams.get('room');
  const bookingDate = searchParams.get('date');
  const startTime = searchParams.get('time') || '14:00';
  const hours = parseInt(searchParams.get('hours') || '3');
  const guests = parseInt(searchParams.get('guests') || '2');
  
  const room = mockRooms.find((r) => r.id === roomId);
  
  // State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('auth');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  
  // Guest details form
  const [guestDetails, setGuestDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  // Calculate end time
  const calculateEndTime = (start: string, duration: number): string => {
    const [h] = start.split(':').map(Number);
    const endHour = (h + duration) % 24;
    return `${endHour.toString().padStart(2, '0')}:00`;
  };

  const endTime = calculateEndTime(startTime, hours);
  const priceDetails = room ? calculatePrice(room.baseHourlyRate, hours) : null;

  // Update step based on auth state
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        setCurrentStep('details');
        // Pre-fill form with user data
        if (profile) {
          setGuestDetails(prev => ({
            ...prev,
            fullName: profile.full_name || '',
            phone: profile.phone || '',
          }));
        }
        if (user?.email) {
          setGuestDetails(prev => ({
            ...prev,
            email: user.email || '',
          }));
        }
      } else {
        setCurrentStep('auth');
      }
    }
  }, [isAuthenticated, authLoading, profile, user]);

  // Send confirmation email
  const sendConfirmationEmail = async (newBookingId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-booking-confirmation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            email: guestDetails.email,
            guestName: guestDetails.fullName,
            roomName: room?.name || 'Room',
            bookingDate: bookingDate,
            startTime: startTime,
            endTime: endTime,
            duration: hours,
            guests: guests,
            totalAmount: priceDetails?.total || 0,
            depositPaid: priceDetails?.deposit || 0,
            bookingId: newBookingId,
          }),
        }
      );

      if (!response.ok) {
        console.error('Failed to send confirmation email');
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  };

  // Handle booking submission
  const handleConfirmBooking = async () => {
    if (!room || !user || !priceDetails || !bookingDate) return;

    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          room_id: room.id,
          user_id: user.id,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          duration_hours: hours,
          guests: guests,
          subtotal: priceDetails.subtotal,
          discount: priceDetails.discount,
          taxes: priceDetails.taxes,
          service_fee: priceDetails.serviceFee,
          total_amount: priceDetails.total,
          deposit_amount: priceDetails.deposit,
          status: 'confirmed',
          payment_status: 'deposit_paid',
        })
        .select()
        .single();

      if (error) throw error;

      setBookingId(data.id);
      
      // Send confirmation email in background
      sendConfirmationEmail(data.id);
      
      setCurrentStep('confirmation');
      toast.success('Booking confirmed! A confirmation email has been sent.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!room || !bookingDate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-display font-semibold mb-2">Invalid Booking</h1>
          <p className="text-muted-foreground mb-6">The booking details are missing or invalid.</p>
          <Button onClick={() => navigate('/rooms')}>Browse Rooms</Button>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 'auth', label: 'Sign In', icon: User },
    { id: 'details', label: 'Details', icon: Building2 },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'confirmation', label: 'Confirmation', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-[calc(var(--header-height)+2rem)] pb-16">
        <div className="container max-w-6xl">
          {/* Back Button */}
          {currentStep !== 'confirmation' && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>
          )}

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                          isCompleted ? 'bg-green-500 text-white' :
                          isActive ? 'bg-accent text-white' :
                          'bg-muted text-muted-foreground'
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className={cn(
                        'text-xs mt-2 font-medium',
                        isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          'w-16 md:w-24 h-0.5 mx-2 transition-all',
                          isCompleted ? 'bg-green-500' : 'bg-muted'
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {/* Auth Step */}
                {currentStep === 'auth' && (
                  <motion.div
                    key="auth"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-card rounded-2xl border border-border p-8"
                  >
                    <div className="text-center py-8">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                        <Lock className="w-10 h-10 text-accent" />
                      </div>
                      <h2 className="text-2xl font-display font-semibold mb-3">
                        Sign in to continue
                      </h2>
                      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Please sign in or create an account to complete your booking. 
                        Your information will be securely stored for a seamless experience.
                      </p>
                      <Button 
                        size="lg" 
                        className="px-8"
                        onClick={() => setIsAuthModalOpen(true)}
                      >
                        Sign In / Create Account
                      </Button>
                      <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        <span>Your data is protected with 256-bit encryption</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Details Step */}
                {currentStep === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Guest Information */}
                    <div className="bg-card rounded-2xl border border-border p-6">
                      <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-accent" />
                        Guest Information
                      </h2>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name *</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="fullName"
                              placeholder="Enter your full name"
                              value={guestDetails.fullName}
                              onChange={(e) => setGuestDetails(prev => ({ ...prev, fullName: e.target.value }))}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="your@email.com"
                              value={guestDetails.email}
                              onChange={(e) => setGuestDetails(prev => ({ ...prev, email: e.target.value }))}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+91 98765 43210"
                              value={guestDetails.phone}
                              onChange={(e) => setGuestDetails(prev => ({ ...prev, phone: e.target.value }))}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="requests">Special Requests (Optional)</Label>
                          <Input
                            id="requests"
                            placeholder="Any special requirements or preferences?"
                            value={guestDetails.specialRequests}
                            onChange={(e) => setGuestDetails(prev => ({ ...prev, specialRequests: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Policies */}
                    <div className="bg-card rounded-2xl border border-border p-6">
                      <h2 className="text-xl font-display font-semibold mb-4">Policies</h2>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Free cancellation up to 2 hours before check-in</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Government-issued ID required at check-in</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span>No smoking policy - ₹5,000 cleaning fee if violated</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Remaining balance due at check-in or auto-charged 2 hours before</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      size="lg" 
                      className="w-full"
                      onClick={() => setCurrentStep('payment')}
                      disabled={!guestDetails.fullName || !guestDetails.email || !guestDetails.phone}
                    >
                      Continue to Payment
                    </Button>
                  </motion.div>
                )}

                {/* Payment Step */}
                {currentStep === 'payment' && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Payment Methods */}
                    <div className="bg-card rounded-2xl border border-border p-6">
                      <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-accent" />
                        Payment Method
                      </h2>
                      
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className="space-y-3">
                          <label
                            className={cn(
                              'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                              paymentMethod === 'razorpay' 
                                ? 'border-accent bg-accent/5' 
                                : 'border-border hover:border-accent/50'
                            )}
                          >
                            <RadioGroupItem value="razorpay" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Razorpay</span>
                                <Badge variant="secondary" className="text-xs">Recommended</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                UPI, Cards, Net Banking, Wallets
                              </p>
                            </div>
                            <img 
                              src="https://razorpay.com/assets/razorpay-glyph.svg" 
                              alt="Razorpay" 
                              className="h-8"
                            />
                          </label>

                          <label
                            className={cn(
                              'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                              paymentMethod === 'stripe' 
                                ? 'border-accent bg-accent/5' 
                                : 'border-border hover:border-accent/50'
                            )}
                          >
                            <RadioGroupItem value="stripe" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Stripe</span>
                                <Badge variant="outline" className="text-xs">International</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Credit/Debit Cards, Apple Pay, Google Pay
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <div className="w-10 h-6 bg-[#635bff] rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">S</span>
                              </div>
                            </div>
                          </label>

                          <label
                            className={cn(
                              'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                              paymentMethod === 'paylater' 
                                ? 'border-accent bg-accent/5' 
                                : 'border-border hover:border-accent/50'
                            )}
                          >
                            <RadioGroupItem value="paylater" />
                            <div className="flex-1">
                              <span className="font-medium">Pay at Hotel</span>
                              <p className="text-sm text-muted-foreground">
                                Cash or card payment at check-in
                              </p>
                            </div>
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          </label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="bg-card rounded-2xl border border-border p-6">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          id="terms" 
                          checked={acceptTerms}
                          onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                          className="mt-1"
                        />
                        <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                          I agree to the{' '}
                          <a href="/terms" className="text-accent hover:underline">Terms of Service</a>,{' '}
                          <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>, and{' '}
                          <a href="/cancellation" className="text-accent hover:underline">Cancellation Policy</a>. 
                          I understand that a deposit of ₹{priceDetails?.deposit.toLocaleString('en-IN')} will be charged now, 
                          and the remaining balance of ₹{((priceDetails?.total || 0) - (priceDetails?.deposit || 0)).toLocaleString('en-IN')} 
                          will be due at check-in.
                        </label>
                      </div>
                    </div>

                    {/* Security Note */}
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      <span>Secured by 256-bit SSL encryption</span>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={() => setCurrentStep('details')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        size="lg" 
                        className="flex-1"
                        onClick={handleConfirmBooking}
                        disabled={!acceptTerms || isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>Pay ₹{priceDetails?.deposit.toLocaleString('en-IN')} Now</>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Confirmation Step */}
                {currentStep === 'confirmation' && (
                  <motion.div
                    key="confirmation"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card rounded-2xl border border-border p-8"
                  >
                    <div className="text-center mb-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center"
                      >
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </motion.div>
                      <h2 className="text-2xl font-display font-semibold mb-2">
                        Booking Confirmed!
                      </h2>
                      <p className="text-muted-foreground">
                        Your reservation has been successfully made
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-muted-foreground">Booking ID</span>
                        <span className="font-mono font-medium">{bookingId?.slice(0, 8).toUpperCase()}</span>
                      </div>
                      <Separator className="my-4" />
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Room</span>
                          <span className="font-medium">{room.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date</span>
                          <span>{format(new Date(bookingDate), 'EEE, MMM d, yyyy')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time</span>
                          <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration</span>
                          <span>{hours} hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Guests</span>
                          <span>{guests} {guests === 1 ? 'guest' : 'guests'}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deposit Paid</span>
                          <span className="font-medium text-green-600">₹{priceDetails?.deposit.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Balance Due</span>
                          <span>₹{((priceDetails?.total || 0) - (priceDetails?.deposit || 0)).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-accent/10 rounded-xl p-4 mb-6">
                      <h3 className="font-medium text-accent mb-2">Check-in Instructions</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Arrive at the hotel reception at your scheduled time</li>
                        <li>• Present your booking confirmation and government ID</li>
                        <li>• Complete balance payment at the front desk</li>
                        <li>• Collect your room key and enjoy your stay!</li>
                      </ul>
                    </div>

                    <p className="text-center text-sm text-muted-foreground mb-6">
                      A confirmation email has been sent to <span className="font-medium">{guestDetails.email}</span>
                    </p>

                    <div className="flex gap-4">
                      <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
                        Back to Home
                      </Button>
                      <Button className="flex-1" onClick={() => navigate('/my-bookings')}>
                        View My Bookings
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar */}
            {currentStep !== 'confirmation' && (
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="bg-card rounded-2xl border border-border p-6 sticky top-28">
                  <h3 className="font-display text-lg font-semibold mb-4">Booking Summary</h3>
                  
                  {/* Room Preview */}
                  <div className="flex gap-4 mb-4">
                    <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0">
                      <img 
                        src={room.images[0]} 
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium line-clamp-1">{room.name}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        <span>Up to {room.capacity} guests</span>
                      </div>
                      {room.badges && room.badges.length > 0 && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {room.badges[0]}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Booking Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{format(new Date(bookingDate), 'EEE, MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{formatTime(startTime)} - {formatTime(endTime)} ({hours} hrs)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{guests} {guests === 1 ? 'guest' : 'guests'}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Price Breakdown */}
                  {priceDetails && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          ₹{room.baseHourlyRate.toLocaleString('en-IN')} × {hours} hrs
                        </span>
                        <span>₹{priceDetails.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      {priceDetails.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Duration discount</span>
                          <span>-₹{priceDetails.discount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxes (18% GST)</span>
                        <span>₹{priceDetails.taxes.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service fee</span>
                        <span>₹{priceDetails.serviceFee.toLocaleString('en-IN')}</span>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="flex justify-between font-semibold text-base">
                        <span>Total</span>
                        <span>₹{priceDetails.total.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="bg-accent/10 rounded-xl p-4 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-accent">Pay Now (30%)</span>
                          <span className="font-bold text-lg text-accent">
                            ₹{priceDetails.deposit.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Remaining ₹{(priceDetails.total - priceDetails.deposit).toLocaleString('en-IN')} due at check-in
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Secure checkout</span>
                  </div>
                </div>
              </motion.aside>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
