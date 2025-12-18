'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, Cloud, Smartphone, Shield, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

export default function SignUpPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please make sure your passwords match.',
      });
      return;
    }

    if (password.length < 6) {
      toast.error('Password too short', {
        description: 'Password must be at least 6 characters.',
      });
      return;
    }

    setLoading(true);
    const { error } = await signUpWithEmail(email, password);
    setLoading(false);

    if (error) {
      toast.error('Sign up failed', {
        description: error.message,
      });
    } else {
      toast.success('Check your email', {
        description: 'We sent you a confirmation link to complete your sign up.',
      });
      router.push('/login?message=check-email');
    }
  };

  const handleGoogleSignUp = async () => {
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
              <Sparkles className="h-10 w-10 lg:h-12 lg:w-12 text-primary" />
            </motion.div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 lg:mb-2">
              Create your account
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              Start capturing your daily moments
            </p>
          </div>

          {/* Benefits - hidden on mobile for compactness */}
          <div className="hidden sm:flex flex-wrap justify-center gap-2 lg:gap-3 mb-4 lg:mb-6">
            <div className="flex items-center gap-1.5 text-xs lg:text-sm text-muted-foreground bg-muted px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full">
              <Cloud className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary" />
              <span>Sync across devices</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs lg:text-sm text-muted-foreground bg-muted px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full">
              <Shield className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary" />
              <span>Never lose your memories</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs lg:text-sm text-muted-foreground bg-muted px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full">
              <Smartphone className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary" />
              <span>Access anywhere</span>
            </div>
          </div>

          {/* Sign Up Form */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-5 lg:p-8 shadow-xl border border-border/50">
            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 lg:h-12 rounded-xl text-sm lg:text-base font-medium mb-4 lg:mb-6"
              onClick={handleGoogleSignUp}
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
            <form onSubmit={handleEmailSignUp} className="space-y-3 lg:space-y-4">
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
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 lg:pl-10 h-10 lg:h-12 rounded-xl text-sm lg:text-base focus-visible:ring-primary/50"
                    required
                  />
                </div>
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
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 lg:pl-10 h-10 lg:h-12 rounded-xl text-sm lg:text-base focus-visible:ring-primary/50"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-1.5 lg:space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <User className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                )}
                Create Account
              </Button>
            </form>
          </div>

          {/* Login Link */}
          <p className="text-center mt-4 lg:mt-6 text-sm lg:text-base text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="hover:underline font-medium text-primary"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
