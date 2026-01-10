import { LandingPage } from '@/components/landing-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RECAPZ - Tägliche Reflexion',
  description: 'Ein ruhiger Ort für deine Tage',
};

export default function GermanPage() {
  return <LandingPage lang="de" />;
}
