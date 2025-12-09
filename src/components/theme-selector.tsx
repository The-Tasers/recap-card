'use client';

import { useState } from 'react';
import {
  Palette,
  Layout,
  Sparkles,
  Check,
  Type,
  Image as ImageIcon,
  Layers,
  Newspaper,
  Quote,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  COLOR_PALETTES,
  PaletteId,
  STORY_TEMPLATES,
  StoryTemplateId,
  TYPOGRAPHY_SETS,
  TypographySetId,
} from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  palette: PaletteId;
  storyTemplate: StoryTemplateId;
  typography: TypographySetId;
  showGrain: boolean;
  showVignette: boolean;
  onPaletteChange: (palette: PaletteId) => void;
  onTemplateChange: (template: StoryTemplateId) => void;
  onTypographyChange: (typography: TypographySetId) => void;
  onGrainChange: (show: boolean) => void;
  onVignetteChange: (show: boolean) => void;
}

export function ThemeSelector({
  palette,
  storyTemplate,
  typography,
  showGrain,
  showVignette,
  onPaletteChange,
  onTemplateChange,
  onTypographyChange,
  onGrainChange,
  onVignetteChange,
}: ThemeSelectorProps) {
  const [open, setOpen] = useState(false);
  const currentPalette = COLOR_PALETTES[palette];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-auto py-4 px-6 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: currentPalette.gradient,
              }}
            >
              <Palette className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                {currentPalette.name}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Customize colors, layout & typography
              </div>
            </div>
          </div>
          <Sparkles className="h-4 w-4 text-neutral-400" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-3xl overflow-hidden"
      >
        <SheetHeader>
          <SheetTitle>Card Style</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="palette" className="mt-4 h-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="palette" className="text-xs">
              <Palette className="h-3.5 w-3.5 mr-1.5" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-xs">
              <Layout className="h-3.5 w-3.5 mr-1.5" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="typography" className="text-xs">
              <Type className="h-3.5 w-3.5 mr-1.5" />
              Font
            </TabsTrigger>
            <TabsTrigger value="effects" className="text-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              FX
            </TabsTrigger>
          </TabsList>

          {/* Palette Tab */}
          <TabsContent
            value="palette"
            className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pb-20"
          >
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
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-muted hover:border-muted-foreground/30'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Color preview circles */}
                      <div className="flex -space-x-1">
                        <div
                          className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: p.background }}
                        />
                        <div
                          className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: p.surface }}
                        />
                        <div
                          className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: p.accent }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.description}
                        </div>
                      </div>
                      {palette === paletteId && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    {/* Gradient preview */}
                    <div
                      className="mt-3 h-8 rounded-lg"
                      style={{ background: p.gradient }}
                    />
                  </button>
                );
              })}
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent
            value="layout"
            className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pb-20"
          >
            <Label className="text-sm font-medium">Card Layout</Label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(STORY_TEMPLATES) as StoryTemplateId[]).map(
                (templateId) => {
                  const t = STORY_TEMPLATES[templateId];

                  // Icon mapping for each template
                  const iconMap: Partial<
                    Record<StoryTemplateId, React.ReactNode>
                  > = {
                    photoHero: <ImageIcon className="h-6 w-6" />,
                    glassCards: <Layers className="h-6 w-6" />,
                    magazineCover: <Newspaper className="h-6 w-6" />,
                    centeredQuote: <Quote className="h-6 w-6" />,
                  };

                  return (
                    <button
                      key={templateId}
                      onClick={() => onTemplateChange(templateId)}
                      className={cn(
                        'relative p-4 rounded-2xl border-2 text-left transition-all',
                        storyTemplate === templateId
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-muted hover:border-muted-foreground/30'
                      )}
                    >
                      <div className="flex flex-col items-center justify-center gap-2 mb-2">
                        <div className="text-neutral-600 dark:text-neutral-400">
                          {iconMap[templateId]}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-center">
                        {t.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 text-center">
                        {t.description}
                      </div>
                      {storyTemplate === templateId && (
                        <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent
            value="typography"
            className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pb-20"
          >
            <Label className="text-sm font-medium">Typography</Label>
            <div className="grid grid-cols-1 gap-3">
              {(Object.keys(TYPOGRAPHY_SETS) as TypographySetId[]).map(
                (typoId) => {
                  const t = TYPOGRAPHY_SETS[typoId];
                  return (
                    <button
                      key={typoId}
                      onClick={() => onTypographyChange(typoId)}
                      className={cn(
                        'relative p-4 rounded-2xl border-2 text-left transition-all',
                        typography === typoId
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-muted hover:border-muted-foreground/30'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={cn('text-lg', t.headlineClass)}>
                            {t.name}
                          </div>
                          <div
                            className={cn(
                              'text-sm text-muted-foreground mt-1',
                              t.bodyClass
                            )}
                          >
                            The quick brown fox jumps over the lazy dog
                          </div>
                        </div>
                        {typography === typoId && (
                          <Check className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent
            value="effects"
            className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pb-20"
          >
            <Label className="text-sm font-medium">Visual Effects</Label>

            <div className="space-y-3">
              {/* Film Grain */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
                <div>
                  <Label className="text-sm font-medium">Film Grain</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Adds subtle texture for a cinematic feel
                  </p>
                </div>
                <Switch checked={showGrain} onCheckedChange={onGrainChange} />
              </div>

              {/* Vignette */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
                <div>
                  <Label className="text-sm font-medium">Vignette</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Darkens edges for dramatic focus
                  </p>
                </div>
                <Switch
                  checked={showVignette}
                  onCheckedChange={onVignetteChange}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// Quick palette picker for inline use
interface QuickPalettePickerProps {
  selected: PaletteId;
  onChange: (palette: PaletteId) => void;
}

export function QuickPalettePicker({
  selected,
  onChange,
}: QuickPalettePickerProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {(Object.keys(COLOR_PALETTES) as PaletteId[]).map((paletteId) => {
        const p = COLOR_PALETTES[paletteId];
        return (
          <button
            key={paletteId}
            onClick={() => onChange(paletteId)}
            className={cn(
              'shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-transform',
              selected === paletteId
                ? 'border-primary scale-110 ring-2 ring-primary/30'
                : 'border-transparent hover:scale-105'
            )}
            title={p.name}
          >
            <div className="w-full h-full" style={{ background: p.gradient }} />
          </button>
        );
      })}
    </div>
  );
}

// Quick template picker for inline use
interface QuickTemplatePickerProps {
  selected: StoryTemplateId;
  onChange: (template: StoryTemplateId) => void;
}

export function QuickTemplatePicker({
  selected,
  onChange,
}: QuickTemplatePickerProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {(Object.keys(STORY_TEMPLATES) as StoryTemplateId[]).map((templateId) => {
        const t = STORY_TEMPLATES[templateId];
        return (
          <button
            key={templateId}
            onClick={() => onChange(templateId)}
            className={cn(
              'shrink-0 px-3 py-2 rounded-xl border-2 transition-all text-center min-w-20',
              selected === templateId
                ? 'border-primary bg-primary/10'
                : 'border-muted hover:border-muted-foreground/30'
            )}
            title={t.description}
          >
            <div className="text-lg font-mono leading-tight whitespace-pre">
              {t.preview}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 truncate">
              {t.name}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Theme preview badge
interface ThemePreviewProps {
  palette: PaletteId;
  className?: string;
}

export function ThemePreview({ palette, className }: ThemePreviewProps) {
  const p = COLOR_PALETTES[palette];
  return (
    <div
      className={cn('w-4 h-4 rounded-full border border-black/10', className)}
      style={{ background: p.gradient }}
      title={p.name}
    />
  );
}
