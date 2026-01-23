import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Users, 
  MapPin, 
  Clock,
  Share2,
  Heart,
  Shield,
  CheckCircle,
  X
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DurationSelector } from '@/components/booking/DurationSelector';
import { TimeSelector } from '@/components/booking/TimeSelector';
import { GuestSelector } from '@/components/booking/GuestSelector';
import { PriceBreakdown } from '@/components/booking/PriceBreakdown';
import { AmenityIcon } from '@/components/rooms/AmenityIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mockRooms } from '@/data/mockRooms';
import { calculatePrice, formatTime } from '@/hooks/useBookingSearch';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function RoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const room = mockRooms.find((r) => r.id === roomId);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Booking state
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('14:00');
  const [hours, setHours] = useState(3);
  const [guests, setGuests] = useState(2);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Auto-open booking panel if coming from quick book
  useEffect(() => {
    if (searchParams.get('book') === 'true') {
      // Could trigger a scroll or focus on booking panel
    }
  }, [searchParams]);

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-semibold mb-4">Room not found</h1>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const { total, deposit } = calculatePrice(room.baseHourlyRate, hours);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
  };

  const handleBook = () => {
    // Navigate to checkout
    navigate(`/checkout?room=${room.id}&date=${format(date, 'yyyy-MM-dd')}&time=${startTime}&hours=${hours}&guests=${guests}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-[calc(var(--header-height)+2.25rem)]">
        <div className="container pb-12">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to listings
          </motion.button>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* Image Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden mb-8"
              >
                <div 
                  className="aspect-[16/10] relative cursor-pointer"
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <img
                    src={room.images[currentImageIndex]}
                    alt={`${room.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Navigation */}
                  {room.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  
                  {/* Image count */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm">
                    {currentImageIndex + 1} / {room.images.length}
                  </div>
                </div>

                {/* Thumbnails */}
                {room.images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-2">
                    {room.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={cn(
                          'w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 ring-2 transition-all',
                          idx === currentImageIndex ? 'ring-accent' : 'ring-transparent hover:ring-border'
                        )}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Room Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {room.badges?.map((badge) => (
                        <Badge 
                          key={badge} 
                          variant={badge === 'Premium' ? 'gold' : 'secondary'}
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                      {room.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="font-medium text-foreground">{room.rating}</span>
                        ({room.reviewsCount} reviews)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        Up to {room.capacity} guests
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        Mumbai
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsFavorited(!isFavorited)}
                    >
                      <Heart className={cn('w-5 h-5', isFavorited && 'fill-red-500 text-red-500')} />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="font-display text-xl font-semibold mb-3">About this room</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {room.description}
                  </p>
                </div>

                {/* Amenities */}
                <div className="mb-8">
                  <h2 className="font-display text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {room.amenities.map((amenity) => (
                      <AmenityIcon key={amenity} type={amenity} showLabel size="md" />
                    ))}
                  </div>
                </div>

                {/* Policies */}
                <div className="mb-8">
                  <h2 className="font-display text-xl font-semibold mb-4">Policies</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                      <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Flexible Check-in</p>
                        <p className="text-sm text-muted-foreground">Check in any time, 24/7</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                      <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Free Cancellation</p>
                        <p className="text-sm text-muted-foreground">Cancel up to 2 hours before</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">No Smoking</p>
                        <p className="text-sm text-muted-foreground">This is a non-smoking room</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                      <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Valid ID Required</p>
                        <p className="text-sm text-muted-foreground">Government ID at check-in</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl font-semibold">Guest Reviews</h2>
                    <Button variant="outline" size="sm">See All Reviews</Button>
                  </div>
                  
                  <div className="flex items-center gap-6 p-6 bg-muted/50 rounded-xl">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-foreground">{room.rating}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              'w-4 h-4',
                              i < Math.floor(room.rating) ? 'fill-accent text-accent' : 'text-muted-foreground'
                            )} 
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{room.reviewsCount} reviews</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="text-sm w-3">{stars}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent rounded-full"
                              style={{ 
                                width: `${stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 7 : 3}%` 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Booking Panel */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full lg:w-96 shrink-0"
            >
              <div className="lg:sticky lg:top-28">
                <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
                  <div className="flex items-baseline justify-between mb-6">
                    <div>
                      <span className="text-3xl font-bold">₹{room.baseHourlyRate.toLocaleString('en-IN')}</span>
                      <span className="text-muted-foreground">/hour</span>
                    </div>
                    {room.isInstantBook && (
                      <Badge variant="secondary">Instant Book</Badge>
                    )}
                  </div>

                  <div className="space-y-4 mb-6">
                    {/* Date */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date</label>
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-background border border-border hover:border-accent transition-colors text-left">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{format(date, 'EEE, MMM d, yyyy')}</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => {
                              if (d) {
                                setDate(d);
                                setCalendarOpen(false);
                              }
                            }}
                            disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time */}
                    <TimeSelector value={startTime} onChange={setStartTime} />

                    {/* Duration */}
                    <DurationSelector value={hours} onChange={setHours} />

                    {/* Guests */}
                    <GuestSelector value={guests} onChange={setGuests} max={room.capacity} />
                  </div>

                  {/* Price Breakdown */}
                  <PriceBreakdown baseRate={room.baseHourlyRate} hours={hours} />

                  {/* Book Button */}
                  <Button
                    size="lg"
                    className="w-full mt-6 py-6 text-base font-semibold"
                    onClick={handleBook}
                  >
                    Book — Just pay ₹{deposit.toLocaleString('en-IN')} now
                  </Button>

                  <p className="text-center text-xs text-muted-foreground mt-3">
                    You won't be charged yet
                  </p>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border-0">
          <DialogHeader className="absolute top-4 left-4 z-10">
            <DialogTitle className="sr-only">{room.name} Gallery</DialogTitle>
          </DialogHeader>
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative aspect-[16/10]">
            <img
              src={room.images[currentImageIndex]}
              alt={`${room.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
            />
            {room.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
