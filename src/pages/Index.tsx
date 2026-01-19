import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ArrowDownUp, ChevronDown } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSearch } from '@/components/search/HeroSearch';
import { FilterPanel } from '@/components/search/FilterPanel';
import { RoomCard } from '@/components/rooms/RoomCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBookingSearch } from '@/hooks/useBookingSearch';
import { mockRooms } from '@/data/mockRooms';
import { Room, FilterState } from '@/types/booking';
import heroImage from '@/assets/hero-hotel.jpg';

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

function filterRooms(rooms: Room[], filters: FilterState): Room[] {
  return rooms.filter((room) => {
    // Price filter
    if (room.baseHourlyRate < filters.priceRange[0] || room.baseHourlyRate > filters.priceRange[1]) {
      return false;
    }
    
    // Room type filter
    if (filters.roomTypes.length > 0 && !filters.roomTypes.includes(room.roomType)) {
      return false;
    }
    
    // Amenities filter
    if (filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every((a) => room.amenities.includes(a));
      if (!hasAllAmenities) return false;
    }
    
    // Rating filter
    if (room.rating < filters.minRating) {
      return false;
    }
    
    // Instant book filter
    if (filters.instantOnly && !room.isInstantBook) {
      return false;
    }
    
    return true;
  });
}

function sortRooms(rooms: Room[], sortBy: string): Room[] {
  const sorted = [...rooms];
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.baseHourlyRate - b.baseHourlyRate);
    case 'price-high':
      return sorted.sort((a, b) => b.baseHourlyRate - a.baseHourlyRate);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    default:
      return sorted;
  }
}

const Index = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('relevance');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const {
    searchParams,
    filters,
    updateSearchParams,
    updateFilters,
    resetFilters,
    getActiveFilterCount,
  } = useBookingSearch();

  const filteredRooms = sortRooms(filterRooms(mockRooms, filters), sortBy);
  const activeFilterCount = getActiveFilterCount();

  const handleSearch = () => {
    // In production, this would trigger an API call
    console.log('Search params:', searchParams);
  };

  const handleViewRoom = (id: string) => {
    navigate(`/room/${id}`);
  };

  const handleBookRoom = (id: string) => {
    // Quick book action
    navigate(`/room/${id}?book=true`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-[calc(var(--header-height)+2.25rem)] pb-8 md:pb-12">
        {/* Hero Background */}
        <div className="absolute inset-0 -z-10">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="container">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-8 md:mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Book by the Hour,
              <span className="text-gradient-gold block">Stay on Your Terms</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              Premium hotel rooms for flexible stays. Perfect for day use, layovers, or spontaneous escapes.
            </p>
          </motion.div>

          {/* Search Form */}
          <HeroSearch
            date={searchParams.date}
            startTime={searchParams.startTime}
            hours={searchParams.hours}
            guests={searchParams.guests}
            onDateChange={(date) => updateSearchParams({ date })}
            onTimeChange={(startTime) => updateSearchParams({ startTime })}
            onHoursChange={(hours) => updateSearchParams({ hours })}
            onGuestsChange={(guests) => updateSearchParams({ guests })}
            onSearch={handleSearch}
          />
        </div>
      </section>

      {/* Listings Section */}
      <section className="py-8 md:py-12">
        <div className="container">
          {/* Active Filters Chips */}
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {filters.roomTypes.map((type) => (
                <Badge key={type} variant="secondary" className="gap-1 pr-1">
                  {type}
                  <button
                    onClick={() => updateFilters({
                      roomTypes: filters.roomTypes.filter((t) => t !== type)
                    })}
                    className="ml-1 hover:bg-foreground/10 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {filters.amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary" className="gap-1 pr-1">
                  {amenity}
                  <button
                    onClick={() => updateFilters({
                      amenities: filters.amenities.filter((a) => a !== amenity)
                    })}
                    className="ml-1 hover:bg-foreground/10 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {filters.minRating > 0 && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  {filters.minRating}+ rating
                  <button
                    onClick={() => updateFilters({ minRating: 0 })}
                    className="ml-1 hover:bg-foreground/10 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.instantOnly && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  Instant Book
                  <button
                    onClick={() => updateFilters({ instantOnly: false })}
                    className="ml-1 hover:bg-foreground/10 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </motion.div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters */}
            <div className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-28">
                <FilterPanel
                  filters={filters}
                  onFilterChange={updateFilters}
                  onReset={resetFilters}
                  activeCount={activeFilterCount}
                />
              </div>
            </div>

            {/* Results */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredRooms.length}</span> rooms available
                </p>

                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden relative">
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Filters
                        {activeFilterCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                            {activeFilterCount}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[320px] p-0">
                      <SheetHeader className="p-6 pb-0">
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="p-6">
                        <FilterPanel
                          filters={filters}
                          onFilterChange={updateFilters}
                          onReset={resetFilters}
                          activeCount={activeFilterCount}
                          isOpen={isFilterOpen}
                          onClose={() => setIsFilterOpen(false)}
                          className="shadow-none p-0"
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <ArrowDownUp className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Room Grid */}
              {filteredRooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 stagger-fade-in">
                  {filteredRooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      selectedHours={searchParams.hours}
                      onView={handleViewRoom}
                      onBook={handleBookRoom}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <p className="text-xl font-display font-semibold text-foreground mb-2">
                    No rooms match your criteria
                  </p>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search parameters
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    Clear All Filters
                  </Button>
                </motion.div>
              )}

              {/* Load More */}
              {filteredRooms.length > 0 && (
                <div className="flex justify-center mt-12">
                  <Button variant="outline" size="lg">
                    Load More Rooms
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
