import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  ChevronDown, 
  Phone, 
  Search, 
  User, 
  ShoppingBag,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserMenu } from '@/components/auth/UserMenu';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/rooms', label: 'Rooms' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const { isAuthenticated, loading } = useAuthContext();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 48);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Strip */}
      <div className="bg-primary text-primary-foreground">
        <div className="container flex items-center justify-between h-9 text-xs">
          <button className="flex items-center gap-1.5 hover:text-accent transition-colors">
            <MapPin className="w-3.5 h-3.5" />
            <span>Bangalore</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          
          <p className="hidden sm:block text-primary-foreground/80">
            ✨ Use code <span className="font-semibold text-accent">FIRST20</span> for 20% off your first booking
          </p>
          
          <div className="flex items-center gap-4">
            <a href="tel:+911234567890" className="flex items-center gap-1.5 hover:text-accent transition-colors">
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">+91 123 456 7890</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <motion.nav
        className={cn(
          'transition-all duration-300',
          isScrolled 
            ? 'bg-card/95 backdrop-blur-lg shadow-card border-b border-border' 
            : 'bg-transparent'
        )}
      >
        <div className="container flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-gold-dark flex items-center justify-center">
              <span className="text-xl font-display font-bold text-white">S</span>
            </div>
            <span className="text-xl font-display font-semibold text-foreground">Staycation</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-foreground link-underline transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="w-5 h-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="hidden sm:flex relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                2
              </span>
            </Button>

            {/* Auth Section */}
            {!loading && (
              isAuthenticated ? (
                <UserMenu />
              ) : (
                <Button 
                  variant="default" 
                  className="hidden sm:flex"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="container py-4 space-y-2">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block py-3 px-4 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border">
                {isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Login / Sign Up
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}
