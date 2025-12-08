'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCardStore } from '@/lib/store';
import { StoryCard } from '@/components/story-cards';
import {
  StoryStyleSelector,
  QuickTemplatePicker,
  QuickPalettePicker,
} from '@/components/story-style-selector';
import { PaletteId, StoryTemplateId } from '@/lib/design-system';
import { exportCardImage, downloadImage, shareImage } from '@/lib/export';

export default function StoryExportPage() {
  const params = useParams();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const { getById, hydrated } = useCardStore();

  const [template, setTemplate] = useState<StoryTemplateId>('photoHero');
  const [palette, setPalette] = useState<PaletteId>('warmCinematic');
  const [showGrain, setShowGrain] = useState(true);
  const [showVignette, setShowVignette] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const card = hydrated ? getById(params.id as string) : null;

  // Auto-select best template based on card content
  useEffect(() => {
    if (card) {
      if (card.photoUrl) {
        setTemplate('photoHero');
      } else if (card.text.length < 100) {
        setTemplate('centeredQuote');
      } else {
        setTemplate('magazineCover');
      }

      // Auto-select palette based on mood
      const moodPalettes: Record<string, PaletteId> = {
        great: 'pastelDream',
        good: 'forestMist',
        neutral: 'earthyRaw',
        bad: 'warmCinematic',
        terrible: 'infraredNeon',
      };
      setPalette(moodPalettes[card.mood] || 'warmCinematic');
    }
  }, [card]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Card not found</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleExport = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await exportCardImage(cardRef.current);
      const shared = await shareImage(dataUrl, 'My Day Story');
      if (!shared) {
        // Fallback to download if share not available
        downloadImage(
          dataUrl,
          `story-${new Date(card.createdAt).toISOString().split('T')[0]}.png`
        );
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await exportCardImage(cardRef.current);
      downloadImage(
        dataUrl,
        `story-${new Date(card.createdAt).toISOString().split('T')[0]}.png`
      );
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-neutral-950/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Story Export
          </h1>
          <StoryStyleSelector
            palette={palette}
            template={template}
            showGrain={showGrain}
            showVignette={showVignette}
            onPaletteChange={setPalette}
            onTemplateChange={setTemplate}
            onGrainChange={setShowGrain}
            onVignetteChange={setShowVignette}
          />
        </div>
      </header>

      {/* Preview Area */}
      <div className="px-4 py-6">
        <div className="max-w-sm mx-auto">
          {/* Story Card Preview */}
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <StoryCard
              ref={cardRef}
              card={card}
              template={template}
              palette={palette}
              showGrain={showGrain}
              showVignette={showVignette}
            />
          </div>
        </div>
      </div>

      {/* Quick Selectors */}
      <div className="px-4 space-y-4 pb-6">
        {/* Template Picker */}
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider mb-2">
            Layout
          </p>
          <QuickTemplatePicker
            selected={template}
            onChange={setTemplate}
          />
        </div>

        {/* Palette Picker */}
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider mb-2">
            Colors
          </p>
          <QuickPalettePicker
            selected={palette}
            onChange={setPalette}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur-sm border-t border-white/10 p-4 pb-safe">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-full h-12 bg-white/5 border-white/20 text-white hover:bg-white/10"
            onClick={handleDownload}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            className="flex-1 rounded-full h-12 bg-white text-black hover:bg-white/90"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Share2 className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Share to Story'}
          </Button>
        </div>
      </div>
    </div>
  );
}
