import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, Shield, AlertCircle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { validateEmail } from '@/utils/emailValidation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'verify-otp';

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // OTP verification states
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpSentAt, setOtpSentAt] = useState<Date | null>(null);
  const [pendingAction, setPendingAction] = useState<'login' | 'signup' | null>(null);
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);

  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useAuthContext();

  // Handle OTP resend cooldown timer
  useEffect(() => {
    if (otpResendCooldown > 0) {
      const timer = setTimeout(() => setOtpResendCooldown(otpResendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpResendCooldown]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setShowPassword(false);
    setAcceptTerms(false);
    setEmailSent(false);
    setEmailError(null);
    setOtp('');
    setGeneratedOtp(null);
    setOtpSentAt(null);
    setPendingAction(null);
    setOtpResendCooldown(0);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Clear error when user starts typing
    if (emailError) {
      setEmailError(null);
    }
  };

  const handleEmailBlur = () => {
    if (email.trim()) {
      const validation = validateEmail(email.trim());
      if (!validation.isValid) {
        setEmailError(validation.error || 'Invalid email');
      }
    }
  };

  const handleClose = () => {
    resetForm();
    setMode('login');
    onClose();
  };

  // Send OTP via edge function
  const sendOtpEmail = async (targetEmail: string, otpCode: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            email: targetEmail,
            otp: otpCode,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send OTP');
      }

      return true;
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      toast.error('Failed to send verification code. Please try again.');
      return false;
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate email format and check for disposable emails
    const emailValidation = validateEmail(email.trim());
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email');
      toast.error(emailValidation.error || 'Invalid email');
      return;
    }
    
    setIsLoading(true);

    // Generate and send OTP
    const newOtp = generateOTP();
    const sent = await sendOtpEmail(email.trim(), newOtp);
    
    if (sent) {
      setGeneratedOtp(newOtp);
      setOtpSentAt(new Date());
      setPendingAction('login');
      setMode('verify-otp');
      setOtpResendCooldown(60);
      toast.success('Verification code sent to your email!');
    }
    
    setIsLoading(false);
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate email format and check for disposable emails
    const emailValidation = validateEmail(email.trim());
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email');
      toast.error(emailValidation.error || 'Invalid email');
      return;
    }
    
    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    // Generate and send OTP
    const newOtp = generateOTP();
    const sent = await sendOtpEmail(email.trim(), newOtp);
    
    if (sent) {
      setGeneratedOtp(newOtp);
      setOtpSentAt(new Date());
      setPendingAction('signup');
      setMode('verify-otp');
      setOtpResendCooldown(60);
      toast.success('Verification code sent to your email!');
    }
    
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    // Check if OTP has expired (10 minutes)
    if (otpSentAt && new Date().getTime() - otpSentAt.getTime() > 10 * 60 * 1000) {
      toast.error('Verification code has expired. Please request a new one.');
      setOtp('');
      setGeneratedOtp(null);
      return;
    }

    if (otp !== generatedOtp) {
      toast.error('Invalid verification code. Please try again.');
      setOtp('');
      return;
    }

    setIsLoading(true);

    try {
      if (pendingAction === 'login') {
        const { error } = await signInWithEmail(email.trim(), password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Welcome back!');
          handleClose();
        }
      } else if (pendingAction === 'signup') {
        const { data, error } = await signUpWithEmail(email.trim(), password, fullName.trim());
        if (error) {
          toast.error(error.message);
        } else if (data?.user) {
          toast.success('Account created successfully! Welcome to Staycation.');
          handleClose();
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpResendCooldown > 0) return;
    
    setIsLoading(true);
    const newOtp = generateOTP();
    const sent = await sendOtpEmail(email.trim(), newOtp);
    
    if (sent) {
      setGeneratedOtp(newOtp);
      setOtpSentAt(new Date());
      setOtp('');
      setOtpResendCooldown(60);
      toast.success('New verification code sent!');
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    // Validate email format and check for disposable emails
    const emailValidation = validateEmail(email.trim());
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email');
      toast.error(emailValidation.error || 'Invalid email');
      return;
    }
    
    setIsLoading(true);

    const { error } = await resetPassword(email.trim());

    if (error) {
      toast.error(error.message);
    } else {
      setEmailSent(true);
      toast.success('Password reset email sent!');
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      // Google OAuth might not be configured yet
      if (error.message.includes('provider is not enabled')) {
        toast.error('Google sign-in is not configured yet. Please use email login.');
      } else {
        toast.error(error.message);
      }
      setIsLoading(false);
    }
    // Don't set loading to false on success - redirect will happen
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
          >
            <div className="relative w-full max-w-md bg-card rounded-2xl shadow-elevated overflow-hidden">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg">
                    <span className="text-2xl sm:text-3xl font-display font-bold text-white">S</span>
                  </div>
                  <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-display font-semibold text-foreground">
                    {mode === 'login' && 'Welcome Back'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot-password' && 'Reset Password'}
                    {mode === 'verify-otp' && 'Verify Email'}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-2">
                    {mode === 'login' && 'Sign in to continue your booking'}
                    {mode === 'signup' && 'Join us for exclusive deals'}
                    {mode === 'forgot-password' && "We'll send you a reset link"}
                    {mode === 'verify-otp' && 'Enter the code sent to your email'}
                  </p>
                </div>

                {emailSent ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Check your email</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      We've sent a password reset link to{' '}
                      <span className="font-medium text-foreground">{email}</span>
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEmailSent(false);
                        setMode('login');
                      }}
                    >
                      Back to Login
                    </Button>
                  </div>
                ) : mode === 'verify-otp' ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                        <KeyRound className="w-8 h-8 text-accent" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Code sent to <span className="font-medium text-foreground">{email}</span>
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={setOtp}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <Button 
                      className="w-full h-11 sm:h-12" 
                      onClick={handleVerifyOtp}
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Didn't receive the code?{' '}
                        {otpResendCooldown > 0 ? (
                          <span className="text-muted-foreground">
                            Resend in {otpResendCooldown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            className="text-accent hover:underline font-medium"
                            disabled={isLoading}
                          >
                            Resend Code
                          </button>
                        )}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setMode(pendingAction === 'signup' ? 'signup' : 'login');
                        setOtp('');
                        setGeneratedOtp(null);
                      }}
                    >
                      Back
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Google Login */}
                    <Button
                      variant="outline"
                      className="w-full mb-4 h-11 sm:h-12 text-sm sm:text-base"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          Continue with Google
                        </>
                      )}
                    </Button>

                    <div className="relative mb-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-3 text-muted-foreground">Or continue with email</span>
                      </div>
                    </div>

                    {/* Forms */}
                    {mode === 'login' && (
                      <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                            <Input
                              id="login-email"
                              type="email"
                              placeholder="you@gmail.com"
                              value={email}
                              onChange={handleEmailChange}
                              onBlur={handleEmailBlur}
                              className={`pl-10 h-11 sm:h-12 ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                              autoComplete="email"
                              required
                            />
                          </div>
                          {emailError && (
                            <div className="flex items-center gap-1.5 text-destructive text-xs">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{emailError}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="login-password">Password</Label>
                            <button
                              type="button"
                              onClick={() => setMode('forgot-password')}
                              className="text-xs text-accent hover:text-accent/80 transition-colors"
                            >
                              Forgot password?
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                            <Input
                              id="login-password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 pr-10 h-11 sm:h-12"
                              autoComplete="current-password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </button>
                          </div>
                        </div>

                        <Button type="submit" className="w-full h-11 sm:h-12" disabled={isLoading}>
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                        </Button>
                      </form>
                    )}

                    {mode === 'signup' && (
                      <form onSubmit={handleEmailSignup} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-fullName">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                            <Input
                              id="signup-fullName"
                              type="text"
                              placeholder="John Doe"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="pl-10 h-11 sm:h-12"
                              autoComplete="name"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="you@gmail.com"
                              value={email}
                              onChange={handleEmailChange}
                              onBlur={handleEmailBlur}
                              className={`pl-10 h-11 sm:h-12 ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                              autoComplete="email"
                              required
                            />
                          </div>
                          {emailError && (
                            <div className="flex items-center gap-1.5 text-destructive text-xs">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{emailError}</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Use a valid email (Gmail, Outlook, Yahoo, etc.)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                            <Input
                              id="signup-password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Min. 6 characters"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 pr-10 h-11 sm:h-12"
                              autoComplete="new-password"
                              minLength={6}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="terms"
                            checked={acceptTerms}
                            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                            className="mt-0.5"
                          />
                          <label htmlFor="terms" className="text-xs sm:text-sm text-muted-foreground leading-relaxed cursor-pointer">
                            I accept the{' '}
                            <a href="/terms" className="text-accent hover:underline">
                              Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="/privacy" className="text-accent hover:underline">
                              Privacy Policy
                            </a>
                          </label>
                        </div>

                        <Button type="submit" className="w-full h-11 sm:h-12" disabled={isLoading}>
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                        </Button>
                      </form>
                    )}

                    {mode === 'forgot-password' && (
                      <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder="you@gmail.com"
                              value={email}
                              onChange={handleEmailChange}
                              onBlur={handleEmailBlur}
                              className={`pl-10 h-11 sm:h-12 ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                              autoComplete="email"
                              required
                            />
                          </div>
                          {emailError && (
                            <div className="flex items-center gap-1.5 text-destructive text-xs">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{emailError}</span>
                            </div>
                          )}
                        </div>

                        <Button type="submit" className="w-full h-11 sm:h-12" disabled={isLoading}>
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={() => setMode('login')}
                        >
                          Back to Login
                        </Button>
                      </form>
                    )}

                    {/* Footer */}
                    {mode !== 'forgot-password' && (
                      <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                          type="button"
                          onClick={() => {
                            resetForm();
                            setMode(mode === 'login' ? 'signup' : 'login');
                          }}
                          className="text-accent hover:underline font-medium"
                        >
                          {mode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                      </p>
                    )}

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Secured with 256-bit encryption</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
