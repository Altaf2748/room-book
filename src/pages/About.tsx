import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Clock,
  Shield,
  Heart,
  Award,
  Users,
  MapPin,
  Star,
  Sparkles,
} from 'lucide-react';

const stats = [
  { value: '50,000+', label: 'Happy Guests' },
  { value: '200+', label: 'Premium Rooms' },
  { value: '15+', label: 'Cities' },
  { value: '4.8', label: 'Average Rating' },
];

const values = [
  {
    icon: Clock,
    title: 'Flexibility First',
    description:
      'We believe your time is precious. Book by the hour, not by the night, and use spaces exactly when you need them.',
  },
  {
    icon: Shield,
    title: 'Trust & Safety',
    description:
      'Every property is verified, every booking is secure, and every guest is treated with respect and privacy.',
  },
  {
    icon: Heart,
    title: 'Curated Quality',
    description:
      'We handpick each property to ensure it meets our high standards for comfort, cleanliness, and service.',
  },
  {
    icon: Sparkles,
    title: 'Seamless Experience',
    description:
      'From booking to check-out, we make every step simple, intuitive, and delightful.',
  },
];

const team = [
  {
    name: 'Aditya Sharma',
    role: 'Founder & CEO',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: 'Former hospitality executive with 15+ years in luxury hotels.',
  },
  {
    name: 'Priya Patel',
    role: 'Chief Operating Officer',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    bio: 'Operations expert who scaled multiple hospitality startups.',
  },
  {
    name: 'Rahul Mehta',
    role: 'Head of Product',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    bio: 'Tech leader passionate about creating seamless user experiences.',
  },
  {
    name: 'Ananya Reddy',
    role: 'Head of Partnerships',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    bio: 'Building relationships with premium properties across India.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-[calc(var(--header-height)+2.25rem)]">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-charcoal to-primary" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600')] bg-cover bg-center opacity-20" />
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Redefining How You{' '}
                <span className="text-accent">Experience Hotels</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                We're on a mission to make premium hotel experiences accessible,
                flexible, and perfectly tailored to your schedule.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="accent" asChild>
                  <Link to="/rooms">Explore Rooms</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  asChild
                >
                  <Link to="/contact">Get in Touch</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-card border-y border-border">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="font-display text-4xl md:text-5xl font-bold text-accent mb-2">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-accent font-medium mb-2 block">
                  Our Story
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                  Born from a Simple Idea
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    It started with a question: Why do hotels only rent by the
                    night? In a world where we value flexibility in everything
                    from work to entertainment, hotel stays remained stuck in the
                    past.
                  </p>
                  <p>
                    Founded in 2023, Staycation was created to bridge this gap. We
                    partner with premium hotels across India to offer hourly
                    bookings that fit your schedule—whether you need a quiet space
                    for work, a romantic afternoon escape, or a comfortable spot
                    to freshen up between flights.
                  </p>
                  <p>
                    Today, we've helped over 50,000 guests discover a new way to
                    experience hotels. Our mission is simple: make luxury
                    accessible, flexible, and always available when you need it.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <img
                  src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800"
                  alt="Luxury hotel room"
                  className="rounded-2xl shadow-elevated"
                />
                <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-card p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold">Best Travel Startup</p>
                      <p className="text-sm text-muted-foreground">2025 Awards</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <span className="text-accent font-medium mb-2 block">
                Our Values
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                What Drives Us
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-shadow"
                >
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 md:py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <span className="text-accent font-medium mb-2 block">
                Our Team
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Meet the People Behind Staycation
              </h2>
              <p className="text-muted-foreground">
                A passionate team dedicated to transforming how you experience
                hotels.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group text-center"
                >
                  <div className="relative mb-4 overflow-hidden rounded-2xl aspect-square">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">
                    {member.name}
                  </h3>
                  <p className="text-accent text-sm mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-primary to-charcoal">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                  Ready to experience the difference?
                </h2>
                <p className="text-white/80">
                  Book your first hourly stay and see why guests love Staycation.
                </p>
              </div>
              <div className="flex gap-4">
                <Button size="lg" variant="accent" asChild>
                  <Link to="/rooms">Browse Rooms</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  asChild
                >
                  <Link to="/contact">Contact Us</Link>
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
