'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Loader2, Mail, Check } from 'lucide-react';
import isEmail from 'validator/es/lib/isEmail';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { AppFooter, AppLogo } from '@/components/app-footer';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { user, resetPassword, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    return isEmail(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      setError(error);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
    }
  };

  // Show loading while checking auth or redirecting
  if (authLoading || user) {
    return (
      <div className="h-screen-dynamic flex items-center justify-center bg-background">
        <AppLogo size="xl" animated />
      </div>
    );
  }

  if (success) {
    return (
      <div className="h-screen-dynamic bg-background overflow-hidden">
        <div className="max-w-lg mx-auto h-full px-6 pt-6 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-center">
            <AppLogo size="lg" href="/" />
          </div>

          {/* Success content */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
              <Check className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-medium text-center mb-3">
              Check your email
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              We sent a password reset link to{' '}
              <span className="font-medium text-foreground">{email}</span>.
              Click the link to reset your password.
            </p>
            <Button
              className="mt-8"
              variant="outline"
              onClick={() => router.push('/login')}
            >
              Back to login
            </Button>
          </div>

          {/* Footer */}
          <AppFooter showLogo={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen-dynamic bg-background overflow-hidden">
      <div className="max-w-lg mx-auto h-full px-6 pt-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.button
            type="button"
            onClick={() => router.push('/login')}
            className="p-2 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer rounded-md hover:bg-muted/30"
            whileTap={{ scale: 0.95 }}
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>

          <AppLogo size="lg" href="/" />

          {/* Spacer for centering */}
          <div className="w-9" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-2xl font-medium text-center mb-3">
            Forgot password?
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted/30 border border-border/50 focus:border-primary focus:outline-none transition-colors text-sm"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Send reset link'
              )}
            </Button>
          </form>

          {/* Back to login link */}
          <p className="text-sm text-center text-muted-foreground mt-6">
            Remember your password?{' '}
            <Link
              href="/login"
              className="text-foreground hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <AppFooter showLogo={false} />
      </div>
    </div>
  );
}
