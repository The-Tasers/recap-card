import { LandingPage } from '@/components/landing-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RECAPZ - Reflexión Diaria',
  description: 'Un lugar tranquilo para tus días',
};

export default function SpanishPage() {
  return <LandingPage lang="es" />;
}
