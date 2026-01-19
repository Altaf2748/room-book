import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DurationSelector } from '@/components/booking/DurationSelector';
import { TimeSelector } from '@/components/booking/TimeSelector';
import { GuestSelector } from '@/components/booking/GuestSelector';
import { formatTime } from '@/hooks/useBookingSearch';
import { cn } from '@/lib/utils';

interface HeroSearchProps {
  date: Date;
  startTime: string;
  hours: number;
  guests: number;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  onHoursChange: (hours: number) => void;
  onGuestsChange: (guests: number) => void;
  onSearch: () => void;
}

export function HeroSearch({
  date,
  startTime,
  hours,
  guests,
  onDateChange,
  onTimeChange,
  onHoursChange,
  onGuestsChange,
  onSearch,
}: HeroSearchProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const isSearchEnabled = date && startTime && hours >= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card rounded-3xl shadow-elevated p-6 md:p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Date Picker */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Check-in Date</label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                  'bg-background border border-border',
                  'hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50',
                  'transition-all duration-200 text-left'
                )}
              >
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{format(date, 'EEE, MMM d')}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) {
                    onDateChange(d);
                    setCalendarOpen(false);
                  }
                }}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Selector */}
        <TimeSelector value={startTime} onChange={onTimeChange} />

        {/* Duration */}
        <DurationSelector value={hours} onChange={onHoursChange} />

        {/* Guests */}
        <GuestSelector value={guests} onChange={onGuestsChange} />
      </div>

      {/* Search Button */}
      <div className="mt-6 flex justify-center">
        <Button
          size="lg"
          disabled={!isSearchEnabled}
          onClick={onSearch}
          className="w-full md:w-auto px-8 py-6 text-base font-semibold bg-primary hover:bg-primary/90 group"
        >
          <Search className="w-5 h-5 mr-2" />
          Search — {hours} hrs from {formatTime(startTime)}
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
}
