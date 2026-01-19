import { motion } from 'framer-motion';
import { X, SlidersHorizontal } from 'lucide-react';
import { FilterState } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onReset: () => void;
  activeCount: number;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const roomTypes = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'suite', label: 'Suite' },
  { value: 'couple', label: 'Couple' },
  { value: 'family', label: 'Family' },
];

const amenitiesList = [
  { value: 'wifi', label: 'WiFi' },
  { value: 'ac', label: 'AC' },
  { value: 'tv', label: 'TV' },
  { value: 'minibar', label: 'Mini Bar' },
  { value: 'pool', label: 'Pool' },
  { value: 'gym', label: 'Gym' },
  { value: 'spa', label: 'Spa' },
  { value: 'parking', label: 'Parking' },
];

const ratingOptions = [
  { value: 4.5, label: '4.5+ Excellent' },
  { value: 4.0, label: '4.0+ Very Good' },
  { value: 3.5, label: '3.5+ Good' },
  { value: 0, label: 'Any' },
];

export function FilterPanel({
  filters,
  onFilterChange,
  onReset,
  activeCount,
  isOpen,
  onClose,
  className,
}: FilterPanelProps) {
  const toggleRoomType = (type: string) => {
    const current = filters.roomTypes;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFilterChange({ roomTypes: updated });
  };

  const toggleAmenity = (amenity: string) => {
    const current = filters.amenities;
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    onFilterChange({ amenities: updated });
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn('bg-card rounded-2xl shadow-card p-6', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          <h2 className="font-display font-semibold text-lg">Filters</h2>
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeCount}
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear All
          </Button>
        )}
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Price Range */}
        <div>
          <label className="text-sm font-medium mb-4 block">
            Price Range (per hour)
          </label>
          <Slider
            value={filters.priceRange}
            onValueChange={(val) => onFilterChange({ priceRange: val as [number, number] })}
            min={0}
            max={2000}
            step={50}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{filters.priceRange[0]}</span>
            <span>₹{filters.priceRange[1]}+</span>
          </div>
        </div>

        {/* Room Types */}
        <div>
          <label className="text-sm font-medium mb-3 block">Room Type</label>
          <div className="space-y-2">
            {roomTypes.map((type) => (
              <label
                key={type.value}
                className="flex items-center gap-3 cursor-pointer py-1"
              >
                <Checkbox
                  checked={filters.roomTypes.includes(type.value)}
                  onCheckedChange={() => toggleRoomType(type.value)}
                />
                <span className="text-sm">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="text-sm font-medium mb-3 block">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {amenitiesList.map((amenity) => (
              <button
                key={amenity.value}
                onClick={() => toggleAmenity(amenity.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm border transition-colors',
                  filters.amenities.includes(amenity.value)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:border-accent'
                )}
              >
                {amenity.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="text-sm font-medium mb-3 block">Minimum Rating</label>
          <div className="space-y-2">
            {ratingOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer py-1"
              >
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === option.value}
                  onChange={() => onFilterChange({ minRating: option.value })}
                  className="w-4 h-4 accent-accent"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Instant Book */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Instant Book Only</label>
          <Switch
            checked={filters.instantOnly}
            onCheckedChange={(checked) => onFilterChange({ instantOnly: checked })}
          />
        </div>

        {/* Apply Button (Mobile) */}
        {onClose && (
          <Button onClick={onClose} className="w-full mt-4 md:hidden">
            Apply Filters
          </Button>
        )}
      </div>
    </motion.aside>
  );
}
