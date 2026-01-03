'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLogo } from '@/components/app-footer';

export default function ResetPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings');
  }, [router]);

  return (
    <div className="h-screen-dynamic flex items-center justify-center bg-background">
      <AppLogo size="xl" animated />
    </div>
  );
}
