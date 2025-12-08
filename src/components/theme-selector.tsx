'use client';

import { useState } from 'react';
import { Palette, Check } from 'lucide-react';
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
import {
  ThemeId,
  THEMES,
  FontPreset,
  FONT_PRESETS,
  TemplateId,
  TEMPLATES,
} from '@/lib/types';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  theme: ThemeId;
  font: FontPreset;
  darkMode: boolean;
  template: TemplateId;
  onThemeChange: (theme: ThemeId) => void;
  onFontChange: (font: FontPreset) => void;
  onDarkModeChange: (darkMode: boolean) => void;
  onTemplateChange: (template: TemplateId) => void;
}

export function ThemeSelector({
  theme,
  font,
  darkMode,
  template,
  onThemeChange,
  onFontChange,
  onDarkModeChange,
  onTemplateChange,
}: ThemeSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Palette className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl max-h-[80vh] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Card Style</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 py-4">
          {/* Template Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Template</Label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(TEMPLATES) as TemplateId[]).map((templateId) => {
                const t = TEMPLATES[templateId];
                return (
                  <button
                    key={templateId}
                    onClick={() => onTemplateChange(templateId)}
                    className={cn(
                      'relative p-3 rounded-xl border-2 transition-colors text-left',
                      template === templateId
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/30'
                    )}
                  >
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t.description}
                    </div>
                    {template === templateId && (
                      <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Color Theme</Label>
            <div className="flex flex-wrap gap-3">
              {(Object.keys(THEMES) as ThemeId[]).map((themeId) => {
                const t = THEMES[themeId];
                return (
                  <button
                    key={themeId}
                    onClick={() => onThemeChange(themeId)}
                    className={cn(
                      'relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-transform',
                      theme === themeId
                        ? 'border-primary scale-110'
                        : 'border-transparent hover:scale-105'
                    )}
                    title={t.name}
                  >
                    <div
                      className={cn(
                        'absolute inset-0 bg-gradient-to-br',
                        t.gradient
                      )}
                    />
                    {theme === themeId && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Font</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(FONT_PRESETS) as FontPreset[]).map((fontId) => {
                const f = FONT_PRESETS[fontId];
                return (
                  <button
                    key={fontId}
                    onClick={() => onFontChange(fontId)}
                    className={cn(
                      'p-3 rounded-xl border-2 transition-colors',
                      font === fontId
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/30',
                      f.className
                    )}
                  >
                    <span className="text-sm">{f.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div>
              <Label className="text-sm font-medium">Dark Mode</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Apply dark theme to this card
              </p>
            </div>
            <Switch checked={darkMode} onCheckedChange={onDarkModeChange} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Compact theme preview for card list
interface ThemePreviewProps {
  theme: ThemeId;
  className?: string;
}

export function ThemePreview({ theme, className }: ThemePreviewProps) {
  const t = THEMES[theme];
  return (
    <div
      className={cn(
        'w-4 h-4 rounded-full bg-gradient-to-br border border-black/10',
        t.gradient,
        className
      )}
      title={t.name}
    />
  );
}
