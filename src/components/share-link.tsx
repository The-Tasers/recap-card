'use client';

import { useState } from 'react';
import { Copy, Check, Link2, Clock, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DailyCard } from '@/lib/types';
import { compressCardForUrl } from '@/lib/export';

interface ShareLinkDialogProps {
  card: DailyCard;
  trigger?: React.ReactNode;
}

export function ShareLinkDialog({ card, trigger }: ShareLinkDialogProps) {
  const [copied, setCopied] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [expiresIn, setExpiresIn] = useState<'1h' | '24h' | '7d' | 'never'>(
    'never'
  );
  const [shareUrl, setShareUrl] = useState('');

  // Generate shareable URL when dialog opens or options change
  const generateShareUrl = () => {
    const compressed = compressCardForUrl(card);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    // Add expiry and privacy params
    const params = new URLSearchParams();
    params.set('data', compressed);

    if (isPrivate) {
      params.set('private', '1');
    }

    if (expiresIn !== 'never') {
      const expiryMap = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
      };
      const expiryTime = Date.now() + expiryMap[expiresIn];
      params.set('exp', expiryTime.toString());
    }

    setShareUrl(`${baseUrl}/shared?${params.toString()}`);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Day Recap',
          text: `Check out my day recap from ${new Date(
            card.createdAt
          ).toLocaleDateString()}`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        console.error('Share failed:', error);
      }
    }
  };

  return (
    <Dialog onOpenChange={(open) => open && generateShareUrl()}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Link2 className="h-4 w-4 mr-2" />
            Share Link
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share This Card</DialogTitle>
          <DialogDescription>
            Generate a shareable link to this card. The link contains the card
            data - no server required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Privacy Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPrivate ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Globe className="h-4 w-4 text-muted-foreground" />
              )}
              <Label htmlFor="private-mode">Private Mode</Label>
            </div>
            <Button
              id="private-mode"
              variant={isPrivate ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setIsPrivate(!isPrivate);
                setTimeout(generateShareUrl, 0);
              }}
            >
              {isPrivate ? 'On' : 'Off'}
            </Button>
          </div>
          {isPrivate && (
            <p className="text-xs text-muted-foreground pl-6">
              Private links show a &quot;sensitive content&quot; warning before
              revealing.
            </p>
          )}

          {/* Expiry Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label>Link Expires</Label>
            </div>
            <div className="flex gap-2">
              {(['1h', '24h', '7d', 'never'] as const).map((option) => (
                <Button
                  key={option}
                  variant={expiresIn === option ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setExpiresIn(option);
                    setTimeout(generateShareUrl, 0);
                  }}
                  className="flex-1"
                >
                  {option === 'never' ? 'Never' : option}
                </Button>
              ))}
            </div>
          </div>

          {/* Share URL */}
          <div className="space-y-2">
            <Label>Shareable Link</Label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="font-mono text-xs" />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCopy} className="flex-1">
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          {'share' in navigator && (
            <Button variant="outline" onClick={handleNativeShare}>
              Share
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
