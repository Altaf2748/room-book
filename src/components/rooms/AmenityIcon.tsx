import { 
  Wifi, 
  Wind, 
  Tv, 
  Wine, 
  Lock, 
  Bell,
  Car, 
  Waves, 
  Dumbbell, 
  Sparkles, 
  Coffee, 
  Bath, 
  Droplets, 
  DoorOpen, 
  Mountain, 
  UtensilsCrossed,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const amenityConfig: Record<string, { icon: LucideIcon; label: string }> = {
  wifi: { icon: Wifi, label: 'Free WiFi' },
  ac: { icon: Wind, label: 'Air Conditioning' },
  tv: { icon: Tv, label: 'Smart TV' },
  minibar: { icon: Wine, label: 'Mini Bar' },
  safe: { icon: Lock, label: 'In-room Safe' },
  roomService: { icon: Bell, label: 'Room Service' },
  parking: { icon: Car, label: 'Free Parking' },
  pool: { icon: Waves, label: 'Pool Access' },
  gym: { icon: Dumbbell, label: 'Gym Access' },
  spa: { icon: Sparkles, label: 'Spa Access' },
  breakfast: { icon: Coffee, label: 'Breakfast' },
  bathtub: { icon: Bath, label: 'Bathtub' },
  shower: { icon: Droplets, label: 'Rain Shower' },
  balcony: { icon: DoorOpen, label: 'Private Balcony' },
  view: { icon: Mountain, label: 'Scenic View' },
  kitchen: { icon: UtensilsCrossed, label: 'Kitchenette' },
};

interface AmenityIconProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function AmenityIcon({ type, size = 'md', showLabel = false, className }: AmenityIconProps) {
  const config = amenityConfig[type];
  if (!config) return null;

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const containerClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  if (showLabel) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn(
          'rounded-lg bg-muted flex items-center justify-center',
          containerClasses[size]
        )}>
          <Icon className={cn(sizeClasses[size], 'text-muted-foreground')} />
        </div>
        <span className="text-sm text-foreground">{config.label}</span>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          'rounded-lg bg-muted flex items-center justify-center cursor-default',
          containerClasses[size],
          className
        )}>
          <Icon className={cn(sizeClasses[size], 'text-muted-foreground')} />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{config.label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
