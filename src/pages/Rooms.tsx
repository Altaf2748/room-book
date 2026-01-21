import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSearch } from '@/components/search/HeroSearch';
import { FilterPanel } from '@/components/search/FilterPanel';
import { RoomCard } from '@/components/rooms/RoomCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X } from 'lucide-react';
import { mockRooms } from '@/data/mockRooms';
import { useBookingSearch } from '@/hooks/useBookingSearch';
import { FilterState } from '@/types/booking';

export default function Rooms() {
  const navigate = useNavigate();
  const { searchParams, updateSearchParams } = useBookingSearch();
  const [sortBy, setSortBy] = useState('relevance');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 2000],
    roomTypes: [],
    amenities: [],
    minRating: 0,
    capacity: 0,
    instantOnly: false,
  });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.roomTypes.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.minRating > 0) count++;
    if (filters.capacity > 0) count++;
    if (filters.instantOnly) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 2000) count++;
    return count;
  }, [filters]);

  const filteredRooms = useMemo(() => {
    let rooms = [...mockRooms];

    // Apply filters
    if (filters.roomTypes.length > 0) {
      rooms = rooms.filter((room) => filters.roomTypes.includes(room.roomType));
    }
    if (filters.amenities.length > 0) {
      rooms = rooms.filter((room) =>
        filters.amenities.every((amenity) => room.amenities.includes(amenity))
      );
    }
    if (filters.minRating > 0) {
      rooms = rooms.filter((room) => room.rating >= filters.minRating);
    }
    if (filters.capacity > 0) {
      rooms = rooms.filter((room) => room.capacity >= filters.capacity);
    }
    if (filters.instantOnly) {
      rooms = rooms.filter((room) => room.isInstantBook);
    }
    rooms = rooms.filter(
      (room) =>
        room.baseHourlyRate >= filters.priceRange[0] &&
        room.baseHourlyRate <= filters.priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price-low':
        rooms.sort((a, b) => a.baseHourlyRate - b.baseHourlyRate);
        break;
      case 'price-high':
        rooms.sort((a, b) => b.baseHourlyRate - a.baseHourlyRate);
        break;
      case 'rating':
        rooms.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return rooms;
  }, [filters, sortBy]);

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 2000],
      roomTypes: [],
      amenities: [],
      minRating: 0,
      capacity: 0,
      instantOnly: false,
    });
  };

  const handleViewRoom = (id: string) => {
    navigate(`/room/${id}`);
  };

  const handleBookRoom = (id: string) => {
    navigate(`/room/${id}?book=true`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-[calc(var(--header-height)+2.25rem)]">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-secondary to-background py-12 md:py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-8"
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Find Your Perfect Room
              </h1>
              <p className="text-lg text-muted-foreground">
                Browse our curated collection of premium hourly rooms
              </p>
            </motion.div>

            <HeroSearch
              date={searchParams.date}
              startTime={searchParams.startTime}
              hours={searchParams.hours}
              guests={searchParams.guests}
              onDateChange={(date) => updateSearchParams({ date })}
              onTimeChange={(startTime) => updateSearchParams({ startTime })}
              onHoursChange={(hours) => updateSearchParams({ hours })}
              onGuestsChange={(guests) => updateSearchParams({ guests })}
              onSearch={() => {}}
            />
          </div>
        </section>

        {/* Results Section */}
        <section className="py-8 md:py-12">
          <div className="container">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Desktop Filters */}
              <aside className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-28">
                  <FilterPanel
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={clearFilters}
                    activeCount={activeFilterCount}
                  />
                </div>
              </aside>

              {/* Results */}
              <div className="flex-1">
                {/* Results Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    {/* Mobile Filter Button */}
                    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="lg:hidden">
                          <Filter className="w-4 h-4 mr-2" />
                          Filters
                          {activeFilterCount > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              {activeFilterCount}
                            </Badge>
                          )}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-[320px] p-0">
                        <div className="p-6">
                          <FilterPanel
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onReset={clearFilters}
                            activeCount={activeFilterCount}
                            onClose={() => setIsFilterOpen(false)}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>

                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {filteredRooms.length}
                      </span>{' '}
                      rooms available
                    </p>
                  </div>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Filters */}
                {activeFilterCount > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    {filters.roomTypes.map((type) => (
                      <Badge
                        key={type}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {type}
                        <button
                          onClick={() =>
                            handleFilterChange({
                              roomTypes: filters.roomTypes.filter((t) => t !== type),
                            })
                          }
                          className="ml-1 p-0.5 hover:bg-muted rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    {filters.instantOnly && (
                      <Badge variant="secondary" className="gap-1 pr-1">
                        Instant Book
                        <button
                          onClick={() => handleFilterChange({ instantOnly: false })}
                          className="ml-1 p-0.5 hover:bg-muted rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-muted-foreground"
                    >
                      Clear all
                    </Button>
                  </div>
                )}

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
                    <p className="text-xl font-display text-muted-foreground mb-4">
                      No rooms match your criteria
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
