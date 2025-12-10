'use client';

import { NotebookPen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center mb-6">
        <NotebookPen className="h-10 w-10 text-amber-600 dark:text-amber-400" />
      </div>
      <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
        No recaps yet
      </h2>
      <p className="text-muted-foreground mb-6 max-w-xs">
        Start capturing your daily moments. Create your first recap!
      </p>
      <Link href="/create">
        <Button size="lg" className="rounded-full px-8">
          Create Your First Recap
        </Button>
      </Link>
    </div>
  );
}
