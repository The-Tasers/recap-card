'use client';

import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <BookOpen className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
        No entries yet
      </h2>
      <p className="text-muted-foreground mb-6 max-w-xs">
        Start capturing your daily moments. Create your first recap card!
      </p>
      <Link href="/create">
        <Button size="lg" className="rounded-full px-8">
          Create Your First Card
        </Button>
      </Link>
    </div>
  );
}
