import { LandingPage } from '@/components/landing-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RECAPZ - 每日反思',
  description: '你的日子的安静之地',
};

export default function ChinesePage() {
  return <LandingPage lang="zh" />;
}
