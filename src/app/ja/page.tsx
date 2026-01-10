import { LandingPage } from '@/components/landing-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RECAPZ - 毎日の振り返り',
  description: 'あなたの日々のための静かな場所',
};

export default function JapanesePage() {
  return <LandingPage lang="ja" />;
}
