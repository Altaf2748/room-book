import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, User, Search, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const blogCategories = [
  { id: 'all', label: 'All Posts' },
  { id: 'travel', label: 'Travel Tips' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'destinations', label: 'Destinations' },
  { id: 'guides', label: 'Guides' },
];

const blogPosts = [
  {
    id: 1,
    slug: 'perfect-staycation-mumbai',
    title: 'Planning the Perfect Staycation in Mumbai',
    excerpt:
      'Discover how to make the most of your hourly hotel booking in the city that never sleeps. From romantic escapes to business meetings.',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800',
    category: 'travel',
    author: 'Priya Sharma',
    date: '2026-01-15',
    readTime: '5 min read',
    featured: true,
  },
  {
    id: 2,
    slug: 'hourly-hotels-work-meetings',
    title: 'Why Hourly Hotels are Perfect for Work Meetings',
    excerpt:
      'Skip the noisy cafes and crowded co-working spaces. Learn how hourly hotel rooms offer the perfect professional environment.',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    category: 'guides',
    author: 'Rahul Mehta',
    date: '2026-01-12',
    readTime: '4 min read',
    featured: false,
  },
  {
    id: 3,
    slug: 'romantic-getaway-ideas',
    title: '10 Romantic Getaway Ideas for Couples',
    excerpt:
      "Create unforgettable memories with your partner. Here are our top picks for romantic hourly room experiences you'll both love.",
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
    category: 'lifestyle',
    author: 'Ananya Patel',
    date: '2026-01-10',
    readTime: '7 min read',
    featured: true,
  },
  {
    id: 4,
    slug: 'hidden-gems-delhi',
    title: 'Hidden Gem Hotels in Delhi You Must Try',
    excerpt:
      'Beyond the usual tourist spots, discover boutique properties offering exceptional hourly stays in the capital.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    category: 'destinations',
    author: 'Vikram Singh',
    date: '2026-01-08',
    readTime: '6 min read',
    featured: false,
  },
  {
    id: 5,
    slug: 'self-care-day-guide',
    title: 'The Ultimate Self-Care Day: A Complete Guide',
    excerpt:
      'Treat yourself to a luxurious day of relaxation. How to plan a perfect self-care experience with spa amenities and room service.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    category: 'lifestyle',
    author: 'Meera Kapoor',
    date: '2026-01-05',
    readTime: '5 min read',
    featured: false,
  },
  {
    id: 6,
    slug: 'business-travel-hacks',
    title: 'Smart Business Travel: Hourly Booking Hacks',
    excerpt:
      'Maximize productivity and comfort during layovers or between meetings with these insider tips from frequent travelers.',
    image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=800',
    category: 'travel',
    author: 'Arjun Reddy',
    date: '2026-01-03',
    readTime: '4 min read',
    featured: false,
  },
];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter((post) => post.featured);

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
                The Staycation Blog
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Travel tips, destination guides, and lifestyle inspiration for
                the modern traveler
              </p>

              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-full"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Posts */}
        {activeCategory === 'all' && searchQuery === '' && (
          <section className="py-12 bg-muted/30">
            <div className="container">
              <h2 className="font-display text-2xl font-semibold mb-6">
                Featured Stories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative rounded-2xl overflow-hidden aspect-[16/10]"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <Badge variant="accent" className="mb-3">
                        {blogCategories.find((c) => c.id === post.category)?.label}
                      </Badge>
                      <h3 className="font-display text-2xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="text-white/80 line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-white/60 text-sm">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Category Filter */}
        <section className="py-8 border-b border-border">
          <div className="container">
            <div className="flex flex-wrap items-center gap-2">
              {blogCategories.map((cat) => (
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

        {/* Blog Grid */}
        <section className="py-12">
          <div className="container">
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-shadow"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">
                          {blogCategories.find((c) => c.id === post.category)?.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="text-muted-foreground line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl font-display text-muted-foreground mb-4">
                  No articles found
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                >
                  View all posts
                </Button>
              </div>
            )}

            {/* Load More */}
            {filteredPosts.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Load More Articles
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-primary">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-display text-3xl font-bold text-primary-foreground mb-4">
                Stay Updated
              </h2>
              <p className="text-primary-foreground/80 mb-6">
                Subscribe to our newsletter for the latest travel tips, exclusive
                deals, and destination inspiration.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Button variant="accent" size="lg">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
