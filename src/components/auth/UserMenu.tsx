import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, Calendar, ChevronDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function UserMenu() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuthContext();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
    }
    setIsOpen(false);
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center gap-2 px-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover border-2 border-accent"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <span className="text-sm font-semibold text-accent-foreground">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
          {displayName}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl shadow-elevated border border-border z-50 overflow-hidden"
            >
              {/* User Info */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>

              {/* Menu Items */}
              <div className="p-1">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/my-bookings');
                  }}
                >
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  My Bookings
                </button>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/refund-tracking');
                  }}
                >
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                  Refund Tracking
                </button>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to settings
                  }}
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Account Settings
                </button>
              </div>

              {/* Sign Out */}
              <div className="p-1 border-t border-border">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
