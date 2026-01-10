import { LandingPage } from '@/components/landing-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RECAPZ - Réflexion Quotidienne',
  description: 'Un endroit calme pour vos journées',
};

export default function FrenchPage() {
  return <LandingPage lang="fr" />;
}
