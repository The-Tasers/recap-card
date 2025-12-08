'use client';

import { useState } from 'react';
import { Palette, Layout, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  COLOR_PALETTES,
  PaletteId,
  VISUAL_STYLES,
  StyleId,
  STORY_TEMPLATES,
  StoryTemplateId,
} from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface StoryStyleSelectorProps {
  palette: PaletteId;
  template: StoryTemplateId;
  style?: StyleId;
  showGrain: boolean;
  showVignette: boolean;
  onPaletteChange: (palette: PaletteId) => void;
  onTemplateChange: (template: StoryTemplateId) => void;
  onStyleChange?: (style: StyleId) => void;
  onGrainChange: (show: boolean) => void;
  onVignetteChange: (show: boolean) => void;
}

export function StoryStyleSelector({
  palette,
  template,
  style,
  showGrain,
  showVignette,
  onPaletteChange,
  onTemplateChange,
  onStyleChange,
  onGrainChange,
  onVignetteChange,
}: StoryStyleSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <Sparkles className="h-4 w-4 mr-2" />
          Story Style
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Customize Story Card</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="templates" className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="templates">
              <Layout className="h-4 w-4 mr-2" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="palettes">
              <Palette className="h-4 w-4 mr-2" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="effects">
              <Sparkles className="h-4 w-4 mr-2" />
              Effects
            </TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <Label className="text-sm font-medium">Story Layout</Label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(STORY_TEMPLATES) as StoryTemplateId[]).map(
                (templateId) => {
                  const t = STORY_TEMPLATES[templateId];
                  return (
                    <button
                      key={templateId}
                      onClick={() => onTemplateChange(templateId)}
                      className={cn(
                        'relative p-4 rounded-2xl border-2 text-left transition-all',
                        template === templateId
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-muted-foreground/30'
                      )}
                    >
                      <div className="text-2xl mb-2 font-mono leading-tight whitespace-pre">
                        {t.preview}
                      </div>
                      <div className="text-sm font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t.description}
                      </div>
                      {template === templateId && (
                        <Check className="absolute top-3 right-3 h-4 w-4 text-primary" />
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </TabsContent>

          {/* Palettes Tab */}
          <TabsContent value="palettes" className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <Label className="text-sm font-medium">Color Palette</Label>
            <div className="grid grid-cols-1 gap-3">
              {(Object.keys(COLOR_PALETTES) as PaletteId[]).map((paletteId) => {
                const p = COLOR_PALETTES[paletteId];
                return (
                  <button
                    key={paletteId}
                    onClick={() => onPaletteChange(paletteId)}
                    className={cn(
                      'relative p-4 rounded-2xl border-2 text-left transition-all',
                      palette === paletteId
                        ? 'border-primary'
                        : 'border-muted hover:border-muted-foreground/30'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Color preview circles */}
                      <div className="flex -space-x-1">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: p.background }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: p.surface }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: p.accent }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.description}
                        </div>
                      </div>
                      {/* Gradient preview */}
                      <div
                        className="w-16 h-8 rounded-lg"
                        style={{ background: p.gradient }}
                      />
                    </div>
                    {/* Mood colors preview */}
                    <div className="flex gap-1 mt-3">
                      {Object.entries(p.moodColors).map(([mood, color]) => (
                        <div
                          key={mood}
                          className="flex-1 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                          title={mood}
                        />
                      ))}
                    </div>
                    {palette === paletteId && (
                      <Check className="absolute top-4 right-4 h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent value="effects" className="mt-4 space-y-6">
            <div className="space-y-4">
              <Label className="text-sm font-medium">Visual Effects</Label>
              
              {/* Grain Toggle */}
              <button
                onClick={() => onGrainChange(!showGrain)}
                className={cn(
                  'w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between',
                  showGrain
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/30'
                )}
              >
                <div>
                  <div className="text-sm font-medium">Film Grain</div>
                  <div className="text-xs text-muted-foreground">
                    Add subtle texture for analog feel
                  </div>
                </div>
                <div
                  className={cn(
                    'w-10 h-6 rounded-full transition-colors flex items-center px-1',
                    showGrain ? 'bg-primary' : 'bg-muted'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full bg-white transition-transform',
                      showGrain && 'translate-x-4'
                    )}
                  />
                </div>
              </button>

              {/* Vignette Toggle */}
              <button
                onClick={() => onVignetteChange(!showVignette)}
                className={cn(
                  'w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between',
                  showVignette
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/30'
                )}
              >
                <div>
                  <div className="text-sm font-medium">Vignette</div>
                  <div className="text-xs text-muted-foreground">
                    Darken edges for cinematic look
                  </div>
                </div>
                <div
                  className={cn(
                    'w-10 h-6 rounded-full transition-colors flex items-center px-1',
                    showVignette ? 'bg-primary' : 'bg-muted'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full bg-white transition-transform',
                      showVignette && 'translate-x-4'
                    )}
                  />
                </div>
              </button>
            </div>

            {/* Visual Style Presets */}
            {onStyleChange && (
              <div className="space-y-4">
                <Label className="text-sm font-medium">Style Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(VISUAL_STYLES) as StyleId[]).map((styleId) => {
                    const s = VISUAL_STYLES[styleId];
                    return (
                      <button
                        key={styleId}
                        onClick={() => {
                          onStyleChange(styleId);
                          onPaletteChange(s.defaultPalette);
                        }}
                        className={cn(
                          'relative p-3 rounded-xl border-2 text-left transition-all',
                          style === styleId
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-muted-foreground/30'
                        )}
                      >
                        <div className="text-xs font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {s.vibe}
                        </div>
                        {style === styleId && (
                          <Check className="absolute top-2 right-2 h-3 w-3 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// ============================================
// QUICK TEMPLATE PICKER
// ============================================

interface QuickTemplatePicker {
  selected: StoryTemplateId;
  onChange: (template: StoryTemplateId) => void;
  className?: string;
}

export function QuickTemplatePicker({
  selected,
  onChange,
  className,
}: QuickTemplatePicker) {
  const templates: { id: StoryTemplateId; icon: string; label: string }[] = [
    { id: 'photoHero', icon: '📷', label: 'Hero' },
    { id: 'glassCards', icon: '🔮', label: 'Glass' },
    { id: 'magazineCover', icon: '📰', label: 'Magazine' },
    { id: 'centeredQuote', icon: '💬', label: 'Quote' },
    { id: 'scrapbookStyle', icon: '📎', label: 'Scrapbook' },
    { id: 'darkCinema', icon: '🎬', label: 'Cinema' },
  ];

  return (
    <div className={cn('flex gap-2 overflow-x-auto scrollbar-hide', className)}>
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all shrink-0',
            selected === t.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          <span className="text-lg">{t.icon}</span>
          <span className="text-xs font-medium">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================
// QUICK PALETTE PICKER
// ============================================

interface QuickPalettePicker {
  selected: PaletteId;
  onChange: (palette: PaletteId) => void;
  className?: string;
}

export function QuickPalettePicker({
  selected,
  onChange,
  className,
}: QuickPalettePicker) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto scrollbar-hide', className)}>
      {(Object.keys(COLOR_PALETTES) as PaletteId[]).map((paletteId) => {
        const p = COLOR_PALETTES[paletteId];
        return (
          <button
            key={paletteId}
            onClick={() => onChange(paletteId)}
            className={cn(
              'relative w-10 h-10 rounded-xl overflow-hidden border-2 transition-transform shrink-0',
              selected === paletteId
                ? 'border-primary scale-110'
                : 'border-transparent hover:scale-105'
            )}
            title={p.name}
          >
            <div
              className="absolute inset-0"
              style={{ background: p.gradient }}
            />
            {selected === paletteId && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
