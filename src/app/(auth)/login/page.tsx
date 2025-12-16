'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, LogIn, ArrowLeft, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth-provider';
import { useCardStore } from '@/lib/store';
import { Mood } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Mood-specific button colors
const MOOD_BUTTON_CLASSES: Record<Mood, string> = {
  great: 'bg-emerald-500 hover:bg-emerald-600',
  good: 'bg-green-500 hover:bg-green-600',
  neutral: 'bg-amber-500 hover:bg-amber-600',
  bad: 'bg-orange-500 hover:bg-orange-600',
  terrible: 'bg-red-500 hover:bg-red-600',
};

// Mood-specific icon colors
const MOOD_ICON_CLASSES: Record<Mood, string> = {
  great: 'text-emerald-500',
  good: 'text-green-500',
  neutral: 'text-amber-500',
  bad: 'text-orange-500',
  terrible: 'text-red-500',
};

// Mood-specific link colors
const MOOD_LINK_CLASSES: Record<Mood, string> = {
  great: 'text-emerald-500 hover:text-emerald-600',
  good: 'text-green-500 hover:text-green-600',
  neutral: 'text-amber-500 hover:text-amber-600',
  bad: 'text-orange-500 hover:text-orange-600',
  terrible: 'text-red-500 hover:text-red-600',
};

// Mood-specific input focus ring colors
const MOOD_INPUT_CLASSES: Record<Mood, string> = {
  great: 'focus-visible:ring-emerald-500 focus-visible:border-emerald-500',
  good: 'focus-visible:ring-green-500 focus-visible:border-green-500',
  neutral: 'focus-visible:ring-amber-500 focus-visible:border-amber-500',
  bad: 'focus-visible:ring-orange-500 focus-visible:border-orange-500',
  terrible: 'focus-visible:ring-red-500 focus-visible:border-red-500',
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithEmail, signInWithGoogle, user } = useAuth();
  const { cards, hydrated } = useCardStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Get mood from most recent card, default to neutral
  const currentMood: Mood = hydrated && cards.length > 0 ? cards[0].mood : 'neutral';

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
        description: 'We sent you a confirmation link to complete your sign up.',
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-4 lg:mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-2 lg:mb-4 flex justify-center"
            >
              <Hand className={cn('h-10 w-10 lg:h-12 lg:w-12', MOOD_ICON_CLASSES[currentMood])} />
            </motion.div>
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1 lg:mb-2">
              Welcome back
            </h1>
            <p className="text-sm lg:text-base text-neutral-600 dark:text-neutral-400">
              Sign in to continue your journey
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-5 lg:p-8 shadow-xl shadow-neutral-200/50 dark:shadow-none border border-neutral-200/50 dark:border-neutral-800">
            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 lg:h-12 rounded-xl text-sm lg:text-base font-medium mb-4 lg:mb-6 border-neutral-300 dark:border-neutral-700"
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
                <span className="w-full border-t border-neutral-300 dark:border-neutral-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-neutral-900 px-2 text-neutral-500">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} className="space-y-3 lg:space-y-4">
              <div className="space-y-1.5 lg:space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn('pl-9 lg:pl-10 h-10 lg:h-12 rounded-xl text-sm lg:text-base', MOOD_INPUT_CLASSES[currentMood])}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 lg:space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-neutral-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn('pl-9 lg:pl-10 h-10 lg:h-12 rounded-xl text-sm lg:text-base', MOOD_INPUT_CLASSES[currentMood])}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className={cn('w-full h-10 lg:h-12 rounded-xl text-sm lg:text-base font-semibold text-white shadow-sm', MOOD_BUTTON_CLASSES[currentMood])}
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
          <p className="text-center mt-4 lg:mt-6 text-sm lg:text-base text-neutral-600 dark:text-neutral-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className={cn('hover:underline font-medium', MOOD_LINK_CLASSES[currentMood])}
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
