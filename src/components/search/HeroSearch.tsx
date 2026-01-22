import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, ArrowRight, Sparkles } from 'lucide-react';
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
      className="relative"
    >
      {/* Glow effect behind the card */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/40 via-gold-light/30 to-accent/40 rounded-3xl" />
      </div>

      {/* Main search container */}
      <div className="relative overflow-hidden rounded-3xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-elevated">
        {/* Decorative top gradient line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />

        <div className="relative p-6 md:p-8">
          {/* Header badge */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Find your perfect stay</span>
            </motion.div>
          </div>

          {/* Search fields grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Date Picker */}
            <div className="group">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">
                Check-in Date
              </label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-4 rounded-2xl',
                      'bg-background/80 border-2 border-transparent',
                      'hover:border-accent/30 hover:bg-background',
                      'focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10',
                      'transition-all duration-300 text-left',
                      'group-hover:shadow-lg group-hover:shadow-accent/5'
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-lg font-semibold text-foreground truncate">
                        {format(date, 'EEE, MMM d')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(date, 'yyyy')}
                      </span>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-accent/20" align="start">
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
                    className="rounded-xl"
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
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              disabled={!isSearchEnabled}
              onClick={onSearch}
              className={cn(
                'relative overflow-hidden w-full md:w-auto px-10 py-6 text-base font-semibold rounded-2xl',
                'bg-gradient-to-r from-primary via-charcoal to-primary bg-[length:200%_100%]',
                'hover:bg-[position:100%_0] transition-all duration-500',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'group shadow-xl shadow-primary/20'
              )}
            >
              {/* Shine effect */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <span className="relative flex items-center gap-3">
                <Search className="w-5 h-5" />
                <span>Search — {hours} hrs from {formatTime(startTime)}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
