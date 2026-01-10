import { LandingPage } from '@/components/landing-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RECAPZ - Daily Reflection',
  description: 'A quiet place for your days',
};

export default function HomePage() {
  return <LandingPage lang="en" />;
}
