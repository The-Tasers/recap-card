'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, LogIn, Hand, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';
import { AppFooter } from '@/components/app-footer';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithEmail, signInWithGoogle, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    const message = searchParams.get('message');
    const error = searchParams.get('error');

    if (message === 'check-email') {
      toast.success('Check your email', {
        description:
          'We sent you a confirmation link to complete your sign up.',
      });
    }

    if (error === 'auth_failed') {
      toast.error('Authentication failed', {
        description: 'Something went wrong. Please try again.',
      });
    }
  }, [searchParams]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const { error } = await signInWithEmail(email, password);
    setLoading(false);

    if (error) {
      toast.error('Sign in failed', {
        description: error.message,
      });
    } else {
      router.push('/');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await signInWithGoogle();
  };

  return (
    <div className="h-screen-dynamic bg-background overflow-hidden">
      <div className="max-w-md mx-auto h-full px-6 pt-6 flex flex-col">
        <div className="shrink-0">
          <motion.button
            onClick={() => router.back()}
            className="p-2 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer rounded-md hover:bg-muted/30"
            whileTap={{ scale: 0.95 }}
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          {/* Header */}
          <div className="text-center mb-4 lg:mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-2 lg:mb-4 flex justify-center"
            >
              <motion.div
                animate={{ rotate: [0, 12, -8, 10, -6, 8, 0] }}
                transition={{
                  delay: 0.6,
                  duration: 0.6,
                  ease: 'easeInOut',
                }}
                style={{ originX: 0.7, originY: 0.9 }}
              >
                <Hand className="h-10 w-10 lg:h-12 lg:w-12 text-primary" />
              </motion.div>
            </motion.div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 lg:mb-2">
              Welcome back
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              Sign in to continue your journey
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-5 lg:p-8 shadow-xl border border-border/50">
            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 lg:h-12 rounded-xl text-sm lg:text-base font-medium mb-4 lg:mb-6"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4 lg:h-5 lg:w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative mb-4 lg:mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form
              onSubmit={handleEmailLogin}
              className="space-y-3 lg:space-y-4"
            >
              <div className="space-y-1.5 lg:space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    className={`pl-9 lg:pl-10 h-10 lg:h-12 rounded-xl text-sm lg:text-base focus-visible:ring-primary/50 ${emailError ? 'border-destructive focus-visible:ring-destructive/50' : ''}`}
                    required
                  />
                </div>
                {emailError && (
                  <p className="text-xs text-destructive">{emailError}</p>
                )}
              </div>

              <div className="space-y-1.5 lg:space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 lg:pl-10 h-10 lg:h-12 rounded-xl text-sm lg:text-base focus-visible:ring-primary/50"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 lg:h-12 rounded-xl text-sm lg:text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                )}
                Sign In
              </Button>
            </form>
          </div>

          {/* Sign Up Link */}
          <p className="text-center mt-4 lg:mt-6 text-sm lg:text-base text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="hover:underline font-medium text-primary"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <AppFooter />
      </div>
    </div>
  );
}
