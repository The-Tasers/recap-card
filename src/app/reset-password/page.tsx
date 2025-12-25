'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Loader2, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { AppFooter, AppLogo } from '@/components/app-footer';
import { useI18n, type TranslationKey } from '@/lib/i18n';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { user, updatePassword, loading: authLoading } = useAuth();
  const { t } = useI18n();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect to login if not authenticated (no valid recovery session)
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setIsLoading(true);

    const { error } = await updatePassword(password);

    if (error) {
      setError(t(`auth.error.${error}` as TranslationKey));
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="h-screen-dynamic flex items-center justify-center bg-background">
        <AppLogo size="xl" animated />
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return null;
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
              {t('auth.passwordResetSuccess')}
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              {t('auth.passwordResetSuccessDescription')}
            </p>
            <Button
              className="mt-8"
              onClick={() => router.push('/')}
            >
              {t('auth.continue')}
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
            onClick={() => router.push('/')}
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
            {t('auth.resetPasswordTitle')}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            {t('auth.resetPasswordDescription')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password field */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.newPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-muted/30 border border-border/50 focus:border-primary focus:outline-none transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Confirm password field */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.confirmNewPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted/30 border border-border/50 focus:border-primary focus:outline-none transition-colors text-sm"
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading || !password || !confirmPassword}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('auth.resetPassword')
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <AppFooter showLogo={false} />
      </div>
    </div>
  );
}
