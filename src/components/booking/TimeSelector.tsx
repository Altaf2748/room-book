import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown } from 'lucide-react';
import { formatTime, generateTimeSlots } from '@/hooks/useBookingSearch';
import { cn } from '@/lib/utils';

interface TimeSelectorProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
}

export function TimeSelector({ value, onChange, className }: TimeSelectorProps) {
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

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <label className="text-sm font-medium text-foreground mb-2 block">Start Time</label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl',
          'bg-background border border-border',
          'hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50',
          'transition-all duration-200'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{formatTime(value)}</span>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-muted-foreground transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute z-50 mt-2 w-full bg-card rounded-xl shadow-elevated border border-border overflow-hidden"
            role="listbox"
          >
            <div className="max-h-60 overflow-y-auto scrollbar-hide p-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => {
                    onChange(time);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2.5 text-left rounded-lg text-sm',
                    'hover:bg-muted transition-colors',
                    value === time && 'bg-accent/10 text-accent font-medium'
                  )}
                  role="option"
                  aria-selected={value === time}
                >
                  {formatTime(time)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
