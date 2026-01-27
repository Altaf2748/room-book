import { useState, useCallback } from 'react';
import { BookingSearchParams, FilterState } from '@/types/booking';

const defaultFilters: FilterState = {
  priceRange: [0, 2000],
  roomTypes: [],
  amenities: [],
  minRating: 0,
  capacity: 1,
  instantOnly: false,
};

export function useBookingSearch() {
  const [searchParams, setSearchParams] = useState<BookingSearchParams>({
    date: new Date(),
    startTime: getDefaultStartTime(),
    hours: 3,
    guests: 2,
  });

  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const updateSearchParams = useCallback((updates: Partial<BookingSearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...updates }));
  }, []);

  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 2000) count++;
    if (filters.roomTypes.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.minRating > 0) count++;
    if (filters.capacity > 1) count++;
    if (filters.instantOnly) count++;
    return count;
  }, [filters]);

  return {
    searchParams,
    filters,
    updateSearchParams,
    updateFilters,
    resetFilters,
    getActiveFilterCount,
  };
}

function getDefaultStartTime(): string {
  const now = new Date();
  const hours = now.getHours();
  const nextHour = (hours + 1) % 24;
  return `${nextHour.toString().padStart(2, '0')}:00`;
}

export function formatTime(time: string): string {
  const [hours] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:00 ${period}`;
}

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let i = 0; i < 24; i++) {
    slots.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return slots;
}

export function calculatePrice(baseRate: number, hours: number, paymentOption: 'full' | 'partial' = 'partial'): { subtotal: number; discount: number; taxes: number; serviceFee: number; total: number; deposit: number; payNow: number; payLater: number } {
  const subtotal = baseRate * hours;
  
  // Duration discounts
  let discountPercent = 0;
  if (hours >= 24) discountPercent = 20;
  else if (hours >= 12) discountPercent = 15;
  else if (hours >= 6) discountPercent = 10;
  
  const discount = Math.round(subtotal * discountPercent / 100);
  const afterDiscount = subtotal - discount;
  const taxes = Math.round(afterDiscount * 0.18); // 18% GST
  const serviceFee = 99; // Fixed service fee
  const total = afterDiscount + taxes + serviceFee;
  
  // Payment calculation based on option
  // Full: pay 100% now, Partial: pay 40% now (min ₹500)
  const deposit = paymentOption === 'full' 
    ? total 
    : Math.max(500, Math.round(total * 0.40));
  
  const payNow = deposit;
  const payLater = total - deposit;
  
  return { subtotal, discount, taxes, serviceFee, total, deposit, payNow, payLater };
}
