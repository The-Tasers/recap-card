'use client';

import { CheckInHome } from '@/components/checkin-home';
import { Onboarding, useOnboarding } from '@/components/onboarding';
import { SignupPrompt } from '@/components/signup-prompt';
import { Activity } from 'lucide-react';

export default function HomePage() {
  const {
    showOnboarding,
    completeOnboarding,
    checked: onboardingChecked,
    shouldShowRecap,
    clearShowRecap,
  } = useOnboarding();

  // Loading state
  if (!onboardingChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <span className="text-2xl font-bold tracking-wide uppercase flex items-center">
          <span className="text-[#ef4444]">R</span>
          <span className="text-[#f97316]">E</span>
          <span className="text-[#eab308]">C</span>
          <span className="text-[#84cc16]">A</span>
          <span className="text-[#22c55e]">P</span>
          <Activity
            className="h-6 w-6 text-primary rotate-45"
            strokeWidth={3}
          />
        </span>
      </div>
    );
  }

  // Show onboarding for first-time users
  if (showOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  return (
    <>
      <CheckInHome initialShowRecap={shouldShowRecap} onRecapShown={clearShowRecap} />
      <SignupPrompt />
    </>
  );
}
