export interface Room {
  id: string;
  name: string;
  description: string;
  images: string[];
  amenities: string[];
  baseHourlyRate: number;
  rating: number;
  reviewsCount: number;
  capacity: number;
  roomType: 'single' | 'double' | 'suite' | 'couple' | 'family';
  badges?: string[];
  isInstantBook?: boolean;
}

export interface BookingSearchParams {
  date: Date;
  startTime: string;
  hours: number;
  guests: number;
}

export interface PriceBreakdown {
  subtotal: number;
  discount: number;
  taxes: number;
  serviceFee: number;
  total: number;
  deposit: number;
}

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  startDate: Date;
  startTime: string;
  hours: number;
  guests: number;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  priceBreakdown: PriceBreakdown;
  createdAt: Date;
  expiresAt?: Date;
}

export type AmenityType = 
  | 'wifi'
  | 'ac'
  | 'tv'
  | 'minibar'
  | 'safe'
  | 'roomService'
  | 'parking'
  | 'pool'
  | 'gym'
  | 'spa'
  | 'breakfast'
  | 'bathtub'
  | 'shower'
  | 'balcony'
  | 'view'
  | 'kitchen';

export interface FilterState {
  priceRange: [number, number];
  roomTypes: string[];
  amenities: string[];
  minRating: number;
  capacity: number;
  instantOnly: boolean;
}
