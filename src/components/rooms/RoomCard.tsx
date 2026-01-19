import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Users, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { Room } from '@/types/booking';
import { calculatePrice } from '@/hooks/useBookingSearch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AmenityIcon } from './AmenityIcon';
import { cn } from '@/lib/utils';

interface RoomCardProps {
  room: Room;
  selectedHours: number;
  onView: (id: string) => void;
  onBook: (id: string) => void;
}

export function RoomCard({ room, selectedHours, onView, onBook }: RoomCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const { total, deposit } = calculatePrice(room.baseHourlyRate, selectedHours);
  const displayAmenities = room.amenities.slice(0, 4);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
  };

  return (
    <motion.article
      className="group relative bg-card rounded-2xl overflow-hidden shadow-card card-hover cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(room.id)}
      role="button"
      tabIndex={0}
      aria-labelledby={`room-title-${room.id}`}
      onKeyDown={(e) => e.key === 'Enter' && onView(room.id)}
    >
      {/* Image Carousel */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          key={currentImageIndex}
          src={room.images[currentImageIndex]}
          alt={`${room.name} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Image Navigation */}
        {room.images.length > 1 && isHovered && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
        
        {/* Image Dots */}
        {room.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {room.images.map((_, idx) => (
              <span
                key={idx}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  idx === currentImageIndex 
                    ? 'bg-white w-4' 
                    : 'bg-white/60'
                )}
              />
            ))}
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {room.badges?.map((badge) => (
            <Badge 
              key={badge} 
              variant={badge === 'Premium' ? 'default' : 'secondary'}
              className={cn(
                'text-xs font-medium',
                badge === 'Premium' && 'bg-gradient-to-r from-accent to-gold-dark text-white border-0'
              )}
            >
              {badge}
            </Badge>
          ))}
        </div>
        
        {/* Instant Book */}
        {room.isInstantBook && (
          <div className="absolute top-3 right-3">
            <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Instant
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 
            id={`room-title-${room.id}`}
            className="font-display font-semibold text-lg text-foreground line-clamp-1"
          >
            {room.name}
          </h3>
          <div className="flex items-center gap-1 text-sm shrink-0">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-medium">{room.rating}</span>
            <span className="text-muted-foreground">({room.reviewsCount})</span>
          </div>
        </div>

        {/* Room Info */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <span className="capitalize">{room.roomType}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            Up to {room.capacity}
          </span>
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-2 mb-4">
          {displayAmenities.map((amenity) => (
            <AmenityIcon key={amenity} type={amenity} size="sm" />
          ))}
          {room.amenities.length > 4 && (
            <span className="text-xs text-muted-foreground">
              +{room.amenities.length - 4} more
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-end justify-between pt-3 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground">
              ₹{room.baseHourlyRate.toLocaleString('en-IN')}/hr
            </p>
            <p className="font-semibold text-lg">
              ₹{total.toLocaleString('en-IN')}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                for {selectedHours}h
              </span>
            </p>
          </div>
          
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onBook(room.id);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            Book Now
          </Button>
        </div>
      </div>

      {/* Hover Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none"
      />
    </motion.article>
  );
}
