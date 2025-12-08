// AI Day Recap - Visual Design System
// Premium, share-ready card styles for Instagram/TikTok Stories

// ============================================
// COLOR PALETTES
// ============================================

export type PaletteId =
  | 'warmCinematic'
  | 'cyberGradient'
  | 'pastelDream'
  | 'earthyRaw'
  | 'infraredNeon'
  | 'forestMist'
  | 'sunsetBoulevard';

export interface ColorPalette {
  id: PaletteId;
  name: string;
  description: string;
  background: string;
  surface: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  gradient: string;
  gradientClass: string;
  moodColors: {
    great: string;
    good: string;
    neutral: string;
    bad: string;
    terrible: string;
  };
}

export const COLOR_PALETTES: Record<PaletteId, ColorPalette> = {
  warmCinematic: {
    id: 'warmCinematic',
    name: 'Warm Cinematic',
    description: 'Deep, atmospheric with film-noir influence',
    background: '#1A1512',
    surface: '#2D2420',
    accent: '#E8A87C',
    textPrimary: '#F5F0EB',
    textSecondary: '#9C8B7D',
    gradient: 'linear-gradient(135deg, #1A1512, #3D2B1F, #5C3D2E)',
    gradientClass: 'from-[#1A1512] via-[#3D2B1F] to-[#5C3D2E]',
    moodColors: {
      great: '#E8C07C',
      good: '#7CA8A8',
      neutral: '#A89C8C',
      bad: '#8B5A5A',
      terrible: '#6B7B8C',
    },
  },
  cyberGradient: {
    id: 'cyberGradient',
    name: 'Cyber Gradient',
    description: 'Vibrant, energetic mesh gradients',
    background: '#0D0D1A',
    surface: '#1A1A2E',
    accent: '#00D4FF',
    textPrimary: '#FFFFFF',
    textSecondary: '#8B8BA3',
    gradient: 'linear-gradient(135deg, #667EEA, #764BA2, #F093FB)',
    gradientClass: 'from-[#667EEA] via-[#764BA2] to-[#F093FB]',
    moodColors: {
      great: '#00FF88',
      good: '#667EEA',
      neutral: '#A78BFA',
      bad: '#F472B6',
      terrible: '#22D3EE',
    },
  },
  pastelDream: {
    id: 'pastelDream',
    name: 'Pastel Dream',
    description: 'Soft, dreamy lifestyle aesthetic',
    background: '#FFF8F0',
    surface: '#FFFFFF',
    accent: '#FFB5A7',
    textPrimary: '#2D3748',
    textSecondary: '#718096',
    gradient: 'linear-gradient(135deg, #FFDDD2, #FFE5EC, #E2F0FF)',
    gradientClass: 'from-[#FFDDD2] via-[#FFE5EC] to-[#E2F0FF]',
    moodColors: {
      great: '#FFE066',
      good: '#B8F0D4',
      neutral: '#E2E8F0',
      bad: '#FEB2B2',
      terrible: '#C4B5FD',
    },
  },
  earthyRaw: {
    id: 'earthyRaw',
    name: 'Earthy Raw',
    description: 'Warm, natural tones',
    background: '#F5F1EB',
    surface: '#FDFBF7',
    accent: '#C17F59',
    textPrimary: '#3D3528',
    textSecondary: '#7C7265',
    gradient: 'linear-gradient(135deg, #E8DFD0, #D4C4B0, #C4B49A)',
    gradientClass: 'from-[#E8DFD0] via-[#D4C4B0] to-[#C4B49A]',
    moodColors: {
      great: '#E9B44C',
      good: '#87A878',
      neutral: '#B8AFA3',
      bad: '#B07156',
      terrible: '#7B8794',
    },
  },
  infraredNeon: {
    id: 'infraredNeon',
    name: 'Infrared Neon',
    description: 'Bold, electrifying contrast',
    background: '#0A0A0F',
    surface: '#12121A',
    accent: '#FF2D6A',
    textPrimary: '#FFFFFF',
    textSecondary: '#6B6B8D',
    gradient: 'linear-gradient(135deg, #FF2D6A, #6B2DFF, #00D4FF)',
    gradientClass: 'from-[#FF2D6A] via-[#6B2DFF] to-[#00D4FF]',
    moodColors: {
      great: '#FFDD00',
      good: '#00D4FF',
      neutral: '#8B5CF6',
      bad: '#FF6B6B',
      terrible: '#2DD4FF',
    },
  },
  forestMist: {
    id: 'forestMist',
    name: 'Forest Mist',
    description: 'Calm, nature-inspired',
    background: '#1C2420',
    surface: '#243028',
    accent: '#7FB069',
    textPrimary: '#E8F0E8',
    textSecondary: '#9CAF9C',
    gradient: 'linear-gradient(135deg, #1C2420, #2D4035, #3D5A48)',
    gradientClass: 'from-[#1C2420] via-[#2D4035] to-[#3D5A48]',
    moodColors: {
      great: '#B8E986',
      good: '#6BB8A8',
      neutral: '#8CA88C',
      bad: '#D4A574',
      terrible: '#7B9EBC',
    },
  },
  sunsetBoulevard: {
    id: 'sunsetBoulevard',
    name: 'Sunset Boulevard',
    description: 'Warm twilight vibes',
    background: '#1F1B2D',
    surface: '#2A2540',
    accent: '#FF8C42',
    textPrimary: '#FFF5EB',
    textSecondary: '#A89EC9',
    gradient: 'linear-gradient(135deg, #FF8C42, #F56565, #9F7AEA)',
    gradientClass: 'from-[#FF8C42] via-[#F56565] to-[#9F7AEA]',
    moodColors: {
      great: '#FFD93D',
      good: '#9F7AEA',
      neutral: '#E2B6CF',
      bad: '#F56565',
      terrible: '#667EEA',
    },
  },
};

// ============================================
// VISUAL STYLES
// ============================================

export type StyleId =
  | 'cinematic'
  | 'softMinimal'
  | 'boldGradient'
  | 'scrapbook'
  | 'editorial'
  | 'neoBrutalist'
  | 'warmAnalog'
  | 'pastelLifestyle';

export interface VisualStyle {
  id: StyleId;
  name: string;
  description: string;
  vibe: string;
  defaultPalette: PaletteId;
  features: string[];
}

export const VISUAL_STYLES: Record<StyleId, VisualStyle> = {
  cinematic: {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Deep, atmospheric with film-noir influence',
    vibe: 'Introspective, artistic, story-driven',
    defaultPalette: 'warmCinematic',
    features: ['vignette', 'filmGrain', 'warmHighlights'],
  },
  softMinimal: {
    id: 'softMinimal',
    name: 'Soft Minimal',
    description: 'Generous whitespace, whisper-soft colors',
    vibe: 'Peaceful, refined, breathable',
    defaultPalette: 'pastelDream',
    features: ['largeMargins', 'subtleShadows', 'centeredContent'],
  },
  boldGradient: {
    id: 'boldGradient',
    name: 'Bold Gradient',
    description: 'Vibrant, unapologetically colorful',
    vibe: 'Confident, expressive, dynamic',
    defaultPalette: 'cyberGradient',
    features: ['meshGradient', 'glassMorphism', 'boldType'],
  },
  scrapbook: {
    id: 'scrapbook',
    name: 'Scrapbook',
    description: 'Layered, tactile, handmade feeling',
    vibe: 'Playful, authentic, memory-book',
    defaultPalette: 'earthyRaw',
    features: ['rotatedPhotos', 'paperTexture', 'tapeStrips', 'doodles'],
  },
  editorial: {
    id: 'editorial',
    name: 'Editorial',
    description: 'High-fashion layout principles',
    vibe: 'Polished, aspirational, curated',
    defaultPalette: 'warmCinematic',
    features: ['oversizedHeadlines', 'columnLayouts', 'dramaticCrops'],
  },
  neoBrutalist: {
    id: 'neoBrutalist',
    name: 'Neo Brutalist',
    description: 'Raw, honest, anti-design that is highly designed',
    vibe: 'Authentic, bold, unapologetic',
    defaultPalette: 'infraredNeon',
    features: ['thickBorders', 'solidBlocks', 'monospaceType', 'highContrast'],
  },
  warmAnalog: {
    id: 'warmAnalog',
    name: 'Warm Analog',
    description: 'Nostalgic film photography feel',
    vibe: 'Cozy, nostalgic, timeless',
    defaultPalette: 'earthyRaw',
    features: ['filmGrain', 'lightLeaks', 'warmTint', 'roundedCorners'],
  },
  pastelLifestyle: {
    id: 'pastelLifestyle',
    name: 'Pastel Lifestyle',
    description: 'Soft, dreamy, Instagram-aesthetic',
    vibe: 'Fresh, approachable, lifestyle',
    defaultPalette: 'pastelDream',
    features: ['softPastels', 'cleanLines', 'gentleGradients'],
  },
};

// ============================================
// STORY TEMPLATES (9:16)
// ============================================

export type StoryTemplateId =
  | 'photoHero'
  | 'glassCards'
  | 'gridCollage'
  | 'magazineCover'
  | 'centeredQuote'
  | 'splitMood'
  | 'scrapbookStyle'
  | 'darkCinema';

export interface StoryTemplate {
  id: StoryTemplateId;
  name: string;
  description: string;
  preview: string; // ASCII preview for selection UI
  bestFor: string[];
}

export const STORY_TEMPLATES: Record<StoryTemplateId, StoryTemplate> = {
  photoHero: {
    id: 'photoHero',
    name: 'Photo Hero',
    description: 'Large photo at top with text overlay',
    preview: '📷\n───\n📝',
    bestFor: ['photos', 'highlights', 'memories'],
  },
  glassCards: {
    id: 'glassCards',
    name: 'Glass Cards',
    description: 'Frosted glass cards over full-bleed photo',
    preview: '🖼️\n▓▓▓',
    bestFor: ['photos', 'modern', 'clean'],
  },
  gridCollage: {
    id: 'gridCollage',
    name: 'Grid Collage',
    description: '2-4 photos with text cells',
    preview: '▢▢\n▢▢',
    bestFor: ['multiple-photos', 'busy-days', 'variety'],
  },
  magazineCover: {
    id: 'magazineCover',
    name: 'Magazine Cover',
    description: 'Editorial style with big headline',
    preview: 'TITLE\n▢\n"quote"',
    bestFor: ['statements', 'milestones', 'achievements'],
  },
  centeredQuote: {
    id: 'centeredQuote',
    name: 'Centered Quote',
    description: 'Minimalist text-focused layout',
    preview: '···\n""\n···',
    bestFor: ['reflections', 'quotes', 'minimal'],
  },
  splitMood: {
    id: 'splitMood',
    name: 'Split Mood',
    description: 'Two-column mood and highlights',
    preview: '▌│▐\n━━━',
    bestFor: ['metrics', 'tracking', 'data'],
  },
  scrapbookStyle: {
    id: 'scrapbookStyle',
    name: 'Scrapbook',
    description: 'Taped photos, stickers, handwritten notes',
    preview: '📎📷\n✦✦✦',
    bestFor: ['fun', 'memories', 'creative'],
  },
  darkCinema: {
    id: 'darkCinema',
    name: 'Dark Cinema',
    description: 'Moody poster style with dramatic lighting',
    preview: '▓▓▓\n🎬',
    bestFor: ['dramatic', 'evening', 'deep-thoughts'],
  },
};

// ============================================
// TYPOGRAPHY
// ============================================

export type TypographySetId =
  | 'modernGeo'
  | 'strongCondensed'
  | 'elegantSerif'
  | 'roundedFriendly'
  | 'editorialContrast';

export interface TypographySet {
  id: TypographySetId;
  name: string;
  headline: string;
  body: string;
  micro: string;
  headlineClass: string;
  bodyClass: string;
  microClass: string;
}

export const TYPOGRAPHY_SETS: Record<TypographySetId, TypographySet> = {
  modernGeo: {
    id: 'modernGeo',
    name: 'Modern Geometric',
    headline: 'Inter, system-ui',
    body: 'Inter, system-ui',
    micro: 'Inter, system-ui',
    headlineClass: 'font-sans font-bold tracking-tight',
    bodyClass: 'font-sans font-normal leading-relaxed',
    microClass: 'font-sans font-medium text-xs uppercase tracking-wider',
  },
  strongCondensed: {
    id: 'strongCondensed',
    name: 'Strong Condensed',
    headline: 'Arial Narrow, sans-serif',
    body: 'system-ui',
    micro: 'monospace',
    headlineClass: 'font-sans font-black uppercase tracking-wide',
    bodyClass: 'font-sans font-normal leading-relaxed',
    microClass: 'font-mono text-xs tracking-tight',
  },
  elegantSerif: {
    id: 'elegantSerif',
    name: 'Elegant Serif',
    headline: 'Georgia, serif',
    body: 'Georgia, serif',
    micro: 'system-ui',
    headlineClass: 'font-serif font-semibold tracking-tight italic',
    bodyClass: 'font-serif font-normal leading-loose',
    microClass: 'font-sans font-medium text-xs tracking-wide',
  },
  roundedFriendly: {
    id: 'roundedFriendly',
    name: 'Rounded Friendly',
    headline: 'system-ui',
    body: 'system-ui',
    micro: 'system-ui',
    headlineClass: 'font-sans font-extrabold tracking-tight',
    bodyClass: 'font-sans font-medium leading-relaxed',
    microClass: 'font-sans font-semibold text-xs',
  },
  editorialContrast: {
    id: 'editorialContrast',
    name: 'Editorial Contrast',
    headline: 'Georgia, serif',
    body: 'Georgia, serif',
    micro: 'system-ui',
    headlineClass: 'font-serif font-normal text-5xl leading-none',
    bodyClass: 'font-serif font-normal leading-relaxed',
    microClass: 'font-sans font-medium text-xs uppercase tracking-widest',
  },
};

// ============================================
// DECORATIVE ELEMENTS
// ============================================

export type DecorativeElementId =
  | 'grainSubtle'
  | 'grainHeavy'
  | 'vignette'
  | 'softGlow'
  | 'lightLeak'
  | 'paperTexture'
  | 'noiseGradient';

export interface DecorativeElement {
  id: DecorativeElementId;
  name: string;
  cssClass: string;
}

export const DECORATIVE_ELEMENTS: Record<
  DecorativeElementId,
  DecorativeElement
> = {
  grainSubtle: {
    id: 'grainSubtle',
    name: 'Subtle Grain',
    cssClass: 'grain-subtle',
  },
  grainHeavy: {
    id: 'grainHeavy',
    name: 'Heavy Grain',
    cssClass: 'grain-heavy',
  },
  vignette: {
    id: 'vignette',
    name: 'Vignette',
    cssClass: 'vignette',
  },
  softGlow: {
    id: 'softGlow',
    name: 'Soft Glow',
    cssClass: 'soft-glow',
  },
  lightLeak: {
    id: 'lightLeak',
    name: 'Light Leak',
    cssClass: 'light-leak',
  },
  paperTexture: {
    id: 'paperTexture',
    name: 'Paper Texture',
    cssClass: 'paper-texture',
  },
  noiseGradient: {
    id: 'noiseGradient',
    name: 'Noise Gradient',
    cssClass: 'noise-gradient',
  },
};

// ============================================
// MOOD INDICATOR STYLES
// ============================================

export type MoodIndicatorStyle =
  | 'dotScale'
  | 'gradientBar'
  | 'emojiLabel'
  | 'ringIndicator';

export const MOOD_INDICATOR_STYLES: Record<
  MoodIndicatorStyle,
  { name: string; description: string }
> = {
  dotScale: { name: 'Dot Scale', description: '○ ○ ○ ○ ●' },
  gradientBar: { name: 'Gradient Bar', description: '████░░░░' },
  emojiLabel: { name: 'Emoji + Label', description: '😊 Great Day' },
  ringIndicator: { name: 'Ring', description: 'Circular mood ring' },
};

// ============================================
// STORY EXPORT SPECS
// ============================================

export const STORY_SPECS = {
  width: 1080,
  height: 1920,
  aspectRatio: '9:16',
  safeZone: {
    top: 120, // For platform UI
    bottom: 160, // For swipe up / reply
    sides: 48,
  },
  typography: {
    headline: { min: 48, max: 72 },
    subheadline: { min: 24, max: 32 },
    body: { min: 18, max: 22 },
    micro: { min: 12, max: 14 },
  },
};

// ============================================
// MOOD ICONS (Clean SVG paths)
// ============================================

export const MOOD_ICONS = {
  great: {
    emoji: '😊',
    label: 'Great Day',
    svgPath:
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  },
  good: {
    emoji: '🙂',
    label: 'Good Day',
    svgPath:
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z',
  },
  neutral: {
    emoji: '😐',
    label: 'Neutral',
    svgPath:
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-6h10v2H7v-2z',
  },
  bad: {
    emoji: '😔',
    label: 'Hard Day',
    svgPath:
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-4c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z',
  },
  terrible: {
    emoji: '😢',
    label: 'Tough Day',
    svgPath:
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-6c.78 2.34 2.72 4 5 4s4.22-1.66 5-4H7z',
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getPaletteForStyle(styleId: StyleId): ColorPalette {
  const style = VISUAL_STYLES[styleId];
  return COLOR_PALETTES[style.defaultPalette];
}

export function getMoodColor(
  paletteId: PaletteId,
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible'
): string {
  return COLOR_PALETTES[paletteId].moodColors[mood];
}
