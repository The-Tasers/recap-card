import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timeline',
};

export default function TimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
