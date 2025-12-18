import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <SearchX className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Page not found
        </h1>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-11 px-6 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
