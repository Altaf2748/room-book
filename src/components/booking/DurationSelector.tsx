import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
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
    <div className={cn('group', className)}>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">
        Duration
      </label>
      
      <div className={cn(
        'px-4 py-3 rounded-2xl transition-all duration-300',
        'bg-background/80 border-2 border-transparent',
        'group-hover:border-accent/30 group-hover:bg-background',
        'group-hover:shadow-lg group-hover:shadow-accent/5'
      )}>
        {/* Icon and label */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-accent" />
          </div>
          <div>
            <span className="block text-lg font-semibold text-foreground">
              {value} hours
            </span>
            <span className="text-sm text-muted-foreground">Stay duration</span>
          </div>
        </div>

        {/* Preset pills */}
        <div className="flex flex-wrap gap-2">
          {presets.map((hours) => (
            <motion.button
              key={hours}
              type="button"
              onClick={() => handlePresetClick(hours)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                'border-2',
                value === hours && !isCustom 
                  ? 'bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/20' 
                  : 'bg-background border-border hover:border-accent/50 hover:bg-accent/5'
              )}
              whileTap={{ scale: 0.95 }}
            >
              {hours}h
            </motion.button>
          ))}
          
          {/* Custom input */}
          <div className="relative">
            <Input
              type="number"
              min={3}
              value={customValue}
              onChange={(e) => handleCustomChange(e.target.value)}
              onFocus={handleCustomFocus}
              placeholder="Custom"
              className={cn(
                'w-20 h-10 text-center rounded-xl text-sm border-2 bg-background',
                isCustom 
                  ? 'border-accent ring-2 ring-accent/20' 
                  : 'border-border hover:border-accent/50'
              )}
            />
            {isCustom && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                h
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Min. 3 hours • Discounts for 6h+
        </p>
      </div>
    </div>
  );
}
