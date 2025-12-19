'use client';

import Link from 'next/link';

interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className = '' }: AppFooterProps) {
  return (
    <div className={`group flex flex-col items-center gap-2 ${className}`}>
      <Link
        href="/"
        className="text-xs text-center font-bold tracking-widest uppercase transition-opacity"
      >
        <span className="text-emerald-500/50 group-hover:text-emerald-500/80 transition-colors">R</span>
        <span className="text-green-500/50 group-hover:text-green-500/80 transition-colors">E</span>
        <span className="text-amber-500/50 group-hover:text-amber-500/80 transition-colors">C</span>
        <span className="text-orange-500/50 group-hover:text-orange-500/80 transition-colors">A</span>
        <span className="text-red-500/50 group-hover:text-red-500/80 transition-colors">P</span>
        <span className="text-primary/50 group-hover:text-primary/80 transition-colors">Z</span>
      </Link>
      <div className="flex items-center justify-center w-32 gap-3 text-[10px] text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors">
        <Link
          href="/privacy"
          className="hover:text-muted-foreground transition-colors"
        >
          Privacy
        </Link>
        <span>·</span>
        <Link
          href="/terms"
          className="hover:text-muted-foreground transition-colors"
        >
          Terms
        </Link>
      </div>
    </div>
  );
}
