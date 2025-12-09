'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home', type: 'home' as const },
  {
    href: '/timeline',
    icon: List,
    label: 'Timeline',
    type: 'timeline' as const,
  },
  {
    href: '/settings',
    icon: Settings,
    label: 'Settings',
    type: 'settings' as const,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-t border-neutral-200/50 dark:border-neutral-700/50 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.type === 'timeline'
              ? pathname.startsWith('/timeline')
              : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-xl transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon
                className={cn('h-6 w-6', isActive && 'stroke-[2.5px]')}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
