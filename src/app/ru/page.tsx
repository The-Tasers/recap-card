import { LandingPage } from '@/components/landing-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RECAPZ - Дневник настроений',
  description: 'Место для ваших мыслей и чувств',
};

export default function RussianPage() {
  return <LandingPage lang="ru" />;
}
