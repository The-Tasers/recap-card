'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MainContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWelcomePage = pathname === '/welcome';

  return (
    <div
      className={cn(
        'max-w-md mx-auto lg:max-w-none bg-neutral-50 dark:bg-neutral-900 min-h-screen relative',
        isWelcomePage ? 'lg:ml-0' : 'lg:ml-64 [body:has(nav.sidebar-collapsed)_&]:lg:ml-20'
      )}
    >
      <main className="min-h-screen">{children}</main>
    </div>
  );
}
