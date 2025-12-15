import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Page not found
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-11 px-6 rounded-xl font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
