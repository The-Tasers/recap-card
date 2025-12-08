'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, AlertTriangle, Eye, Download } from 'lucide-react';
import { decompressCardFromUrl, downloadImage, exportCardImage } from '@/lib/export';
import { DailyCard, Mood } from '@/lib/types';
import { DailyCardView } from '@/components/daily-card-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRef } from 'react';

function SharedCardContent() {
  const searchParams = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const [card, setCard] = useState<Partial<DailyCard> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const data = searchParams.get('data');
    const expiry = searchParams.get('exp');
    const isPrivateParam = searchParams.get('private') === '1';

    if (!data) {
      setError('No card data found in URL');
      return;
    }

    // Check expiry
    if (expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() > expiryTime) {
        setIsExpired(true);
        return;
      }
    }

    // Check privacy
    setIsPrivate(isPrivateParam);
    if (!isPrivateParam) {
      setShowContent(true);
    }

    // Decompress card data
    const decompressed = decompressCardFromUrl(data);
    if (!decompressed) {
      setError('Invalid card data');
      return;
    }

    // Reconstruct a minimal card for display
    setCard({
      id: 'shared',
      text: decompressed.text || '',
      mood: (decompressed.mood as Mood) || 'neutral',
      createdAt: decompressed.createdAt || new Date().toISOString(),
      blocks: decompressed.blocks,
    });
  }, [searchParams]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const dataUrl = await exportCardImage(cardRef.current);
      const date = card?.createdAt ? new Date(card.createdAt).toLocaleDateString().replace(/\//g, '-') : 'shared';
      downloadImage(dataUrl, `recap-${date}.png`);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <header className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-neutral-800">Shared Card</h1>
        </header>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Error
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expired state
  if (isExpired) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <header className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-neutral-800">Shared Card</h1>
        </header>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Link Expired
            </CardTitle>
            <CardDescription>
              This shared link has expired and is no longer available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Private content gate
  if (isPrivate && !showContent) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <header className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-neutral-800">Shared Card</h1>
        </header>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Private Content
            </CardTitle>
            <CardDescription>
              This card has been marked as private by the sender. The content may be personal or sensitive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click below to view the content. This action cannot be tracked by the sender.
            </p>
            <Button onClick={() => setShowContent(true)} className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              View Content
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (!card) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Shared card view
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-neutral-800">Shared Card</h1>
            <p className="text-sm text-muted-foreground">
              {card.createdAt && new Date(card.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </header>

      {/* Banner for shared content */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800">
        This is a shared card. Create your own daily recaps in the app!
      </div>

      {/* Card View */}
      <DailyCardView ref={cardRef} card={card as DailyCard} />

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleDownload}
          disabled={isExporting}
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Saving...' : 'Save Image'}
        </Button>
        <Link href="/create" className="flex-1">
          <Button className="w-full">
            Create Your Own
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function SharedCardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <SharedCardContent />
    </Suspense>
  );
}
