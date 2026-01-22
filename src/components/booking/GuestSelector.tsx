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
    <div className={cn('group', className)}>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">
        Guests
      </label>
      
      <div className={cn(
        'flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300',
        'bg-background/80 border-2 border-transparent',
        'group-hover:border-accent/30 group-hover:bg-background',
        'group-hover:shadow-lg group-hover:shadow-accent/5'
      )}>
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-accent" />
        </div>
        
        {/* Label */}
        <div className="flex-1 min-w-0">
          <span className="block text-lg font-semibold text-foreground">
            {value} {value === 1 ? 'Guest' : 'Guests'}
          </span>
          <span className="text-sm text-muted-foreground">Max {max} guests</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'w-9 h-9 rounded-lg transition-all duration-200',
              'hover:bg-background hover:shadow-md',
              'disabled:opacity-30'
            )}
            onClick={decrement}
            disabled={value <= 1}
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <motion.span 
            key={value}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-8 text-center font-bold text-lg tabular-nums"
          >
            {value}
          </motion.span>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'w-9 h-9 rounded-lg transition-all duration-200',
              'hover:bg-background hover:shadow-md',
              'disabled:opacity-30'
            )}
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
