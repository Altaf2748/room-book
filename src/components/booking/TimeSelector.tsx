import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown } from 'lucide-react';
import { formatTime, generateTimeSlots } from '@/hooks/useBookingSearch';
import { cn } from '@/lib/utils';

interface TimeSelectorProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
  bookedSlots?: string[];
}

export function TimeSelector({ value, onChange, className, bookedSlots = [] }: TimeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeSlots = generateTimeSlots();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      setIsOpen(!isOpen);
    }
  };

  const isSlotBooked = (time: string) => bookedSlots.includes(time);

  return (
    <div ref={containerRef} className={cn('relative group', className)}>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">
        Start Time
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-4 rounded-2xl',
          'bg-background/80 border-2 border-transparent',
          'hover:border-accent/30 hover:bg-background',
          'focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10',
          'transition-all duration-300 text-left',
          'group-hover:shadow-lg group-hover:shadow-accent/5'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="block text-lg font-semibold text-foreground">
            {formatTime(value)}
          </span>
          <span className="text-sm text-muted-foreground">Check-in time</span>
        </div>
        <ChevronDown className={cn(
          'w-5 h-5 text-muted-foreground transition-transform duration-300',
          isOpen && 'rotate-180'
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute z-50 mt-2 w-full bg-card/98 backdrop-blur-xl rounded-2xl shadow-elevated border border-border/50 overflow-hidden"
            role="listbox"
          >
            <div className="max-h-64 overflow-y-auto scrollbar-hide p-2">
              {timeSlots.map((time) => {
                const booked = isSlotBooked(time);
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      if (!booked) {
                        onChange(time);
                        setIsOpen(false);
                      }
                    }}
                    disabled={booked}
                    className={cn(
                      'w-full px-4 py-3 text-left rounded-xl text-sm transition-all duration-200',
                      booked 
                        ? 'opacity-40 cursor-not-allowed line-through text-muted-foreground bg-destructive/5'
                        : 'hover:bg-accent/10',
                      value === time && !booked && 'bg-accent/15 text-accent font-semibold ring-1 ring-accent/30'
                    )}
                    role="option"
                    aria-selected={value === time}
                    aria-disabled={booked}
                  >
                    <div className="flex items-center justify-between">
                      <span>{formatTime(time)}</span>
                      {booked && (
                        <span className="text-xs text-destructive font-medium">Booked</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
