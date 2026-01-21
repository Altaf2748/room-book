import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

const galleryCategories = [
  { id: 'all', label: 'All' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'dining', label: 'Dining' },
  { id: 'exterior', label: 'Exterior' },
];

const galleryImages = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
    category: 'rooms',
    title: 'Serene Garden Suite',
    description: 'Luxurious suite with garden views',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    category: 'rooms',
    title: 'Modern Bedroom',
    description: 'Contemporary design meets comfort',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    category: 'rooms',
    title: 'Premium Double Room',
    description: 'Elegant double accommodation',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    category: 'rooms',
    title: 'Urban Comfort',
    description: 'City views and modern amenities',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
    category: 'rooms',
    title: 'Cozy Retreat',
    description: 'Warm and inviting atmosphere',
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    category: 'exterior',
    title: 'Hotel Exterior',
    description: 'Grand entrance and facade',
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    category: 'exterior',
    title: 'Pool Area',
    description: 'Relaxing poolside experience',
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    category: 'amenities',
    title: 'Infinity Pool',
    description: 'Stunning views from the pool',
  },
  {
    id: 9,
    src: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
    category: 'amenities',
    title: 'Spa & Wellness',
    description: 'Rejuvenating spa treatments',
  },
  {
    id: 10,
    src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    category: 'dining',
    title: 'Fine Dining',
    description: 'Exquisite culinary experiences',
  },
  {
    id: 11,
    src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    category: 'dining',
    title: 'Restaurant Interior',
    description: 'Elegant dining atmosphere',
  },
  {
    id: 12,
    src: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
    category: 'rooms',
    title: 'Romantic Suite',
    description: 'Perfect for special occasions',
  },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const filteredImages =
    activeCategory === 'all'
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  const currentImageIndex = selectedImage
    ? filteredImages.findIndex((img) => img.id === selectedImage)
    : -1;

  const goToPrev = () => {
    if (currentImageIndex > 0) {
      setSelectedImage(filteredImages[currentImageIndex - 1].id);
    }
  };

  const goToNext = () => {
    if (currentImageIndex < filteredImages.length - 1) {
      setSelectedImage(filteredImages[currentImageIndex + 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-[calc(var(--header-height)+2.25rem)]">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-secondary to-background py-12 md:py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                Our Gallery
              </h1>
              <p className="text-lg text-muted-foreground">
                Explore our beautiful spaces and discover the perfect setting for
                your stay
              </p>
            </motion.div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 border-b border-border sticky top-[calc(var(--header-height)+2.25rem)] bg-background/95 backdrop-blur-lg z-10">
          <div className="container">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {galleryCategories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                  className="rounded-full"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-12">
          <div className="container">
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={cn(
                      'group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer',
                      index % 5 === 0 && 'sm:col-span-2 sm:row-span-2 aspect-square'
                    )}
                    onClick={() => setSelectedImage(image.id)}
                  >
                    <img
                      src={image.src}
                      alt={image.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-display text-lg font-semibold text-white">
                          {image.title}
                        </h3>
                        <p className="text-white/80 text-sm">{image.description}</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <ZoomIn className="w-5 h-5 text-foreground" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Lightbox */}
      <Dialog
        open={selectedImage !== null}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        <DialogContent className="max-w-6xl p-0 bg-black/95 border-0">
          <DialogTitle className="sr-only">Image Gallery</DialogTitle>
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {currentImageIndex > 0 && (
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {currentImageIndex < filteredImages.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {selectedImage && (
            <div className="relative">
              <img
                src={filteredImages[currentImageIndex]?.src}
                alt={filteredImages[currentImageIndex]?.title}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="font-display text-xl font-semibold text-white">
                  {filteredImages[currentImageIndex]?.title}
                </h3>
                <p className="text-white/80">
                  {filteredImages[currentImageIndex]?.description}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
