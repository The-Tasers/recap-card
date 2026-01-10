import { LandingPage } from '@/components/landing-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RECAPZ - 일일 성찰',
  description: '당신의 하루를 위한 고요한 공간',
};

export default function KoreanPage() {
  return <LandingPage lang="ko" />;
}
