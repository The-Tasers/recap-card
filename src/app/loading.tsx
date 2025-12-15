export default function Loading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-700 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Loading...
        </p>
      </div>
    </div>
  );
}
