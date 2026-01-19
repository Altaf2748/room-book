import { motion } from 'framer-motion';
import { Minus, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GuestSelectorProps {
  value: number;
  onChange: (guests: number) => void;
  max?: number;
  className?: string;
}

export function GuestSelector({ value, onChange, max = 10, className }: GuestSelectorProps) {
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  const decrement = () => {
    if (value > 1) onChange(value - 1);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">Guests</label>
      
      <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-2">
        <Users className="w-4 h-4 text-muted-foreground" />
        
        <div className="flex items-center gap-3 ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full"
            onClick={decrement}
            disabled={value <= 1}
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <motion.span 
            key={value}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-8 text-center font-semibold tabular-nums"
          >
            {value}
          </motion.span>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full"
            onClick={increment}
            disabled={value >= max}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
