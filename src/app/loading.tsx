import { AppLogo } from '@/components/app-footer';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <AppLogo size="xl" animated />
    </div>
  );
}
