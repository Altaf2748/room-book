import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DurationSelectorProps {
  value: number;
  onChange: (hours: number) => void;
  className?: string;
}

const presets = [3, 6, 12, 24];

export function DurationSelector({ value, onChange, className }: DurationSelectorProps) {
  const [isCustom, setIsCustom] = useState(!presets.includes(value));
  const [customValue, setCustomValue] = useState(value.toString());

  const handlePresetClick = (hours: number) => {
    setIsCustom(false);
    setCustomValue(hours.toString());
    onChange(hours);
  };

  const handleCustomChange = (val: string) => {
    setCustomValue(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 3) {
      onChange(num);
    }
  };

  const handleCustomFocus = () => {
    setIsCustom(true);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <label className="text-sm font-medium text-foreground">Duration</label>
      
      <div className="flex flex-wrap gap-2">
        {presets.map((hours) => (
          <motion.button
            key={hours}
            type="button"
            onClick={() => handlePresetClick(hours)}
            className={cn(
              'duration-pill',
              value === hours && !isCustom && 'active'
            )}
            whileTap={{ scale: 0.95 }}
          >
            {hours} hrs
          </motion.button>
        ))}
        
        <div className="relative">
          <Input
            type="number"
            min={3}
            value={customValue}
            onChange={(e) => handleCustomChange(e.target.value)}
            onFocus={handleCustomFocus}
            placeholder="Custom"
            className={cn(
              'w-24 h-10 text-center rounded-full text-sm',
              isCustom && 'ring-2 ring-accent border-accent'
            )}
          />
          {isCustom && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              hrs
            </span>
          )}
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Minimum booking: 3 hours
      </p>
    </div>
  );
}
