export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

// Predefined tags for categorizing daily recaps
export const PREDEFINED_TAGS = [
  'work',
  'family',
  'friends',
  'health',
  'exercise',
  'food',
  'travel',
  'learning',
  'creative',
  'achievement',
  'gratitude',
  'reflection',
  'challenge',
  'milestone',
  'fun',
  'relax',
] as const;

export type PredefinedTag = (typeof PREDEFINED_TAGS)[number];

// Import design system types
import {
  type PaletteId as PaletteIdType,
  type StoryTemplateId as StoryTemplateIdType,
  type StyleId as StyleIdType,
  type TypographySetId as TypographySetIdType,
  COLOR_PALETTES as COLOR_PALETTES_IMPL,
  STORY_TEMPLATES as STORY_TEMPLATES_IMPL,
  VISUAL_STYLES as VISUAL_STYLES_IMPL,
  TYPOGRAPHY_SETS as TYPOGRAPHY_SETS_IMPL,
} from './design-system';

// Re-export design system types for unified usage
export type PaletteId = PaletteIdType;
export type StoryTemplateId = StoryTemplateIdType;
export type StyleId = StyleIdType;
export type TypographySetId = TypographySetIdType;
export const COLOR_PALETTES = COLOR_PALETTES_IMPL;
export const STORY_TEMPLATES = STORY_TEMPLATES_IMPL;
export const VISUAL_STYLES = VISUAL_STYLES_IMPL;
export const TYPOGRAPHY_SETS = TYPOGRAPHY_SETS_IMPL;

// Block types for modular card content
export type BlockType = 'text' | 'number' | 'link' | 'slider' | 'weather';

export type BlockId = 'custom' | 'soundtrack' | 'steps' | 'sleep' | 'weather';

export interface CardBlock {
  id: string;
  type: BlockType;
  blockId: BlockId;
  label: string;
  value: string | number;
  order: number;
  icon?: string;
  // Weather-specific fields
  weatherCondition?: string;
  temperature?: number;
  temperatureUnit?: 'C' | 'F';
}

// Legacy type aliases for backward compatibility
export type TemplateId =
  | 'default'
  | 'photoHeader'
  | 'ultraMinimal'
  | 'mixedGrid';
export type ThemeId = 'sunrise' | 'ocean' | 'sunset' | 'forest' | 'lavender';
export type FontPreset = 'system' | 'serif' | 'mono' | 'rounded';

// Question categories
export type QuestionCategory =
  | 'reflection'
  | 'gratitude'
  | 'work'
  | 'creativity'
  | 'random';

export interface DailyCard {
  id: string;
  text: string;
  mood: Mood;
  photoUrl?: string;
  createdAt: string;
  isPinned?: boolean;

  // New optional fields
  blocks?: CardBlock[];

  // New design system fields
  palette?: PaletteId;
  storyTemplate?: StoryTemplateId;
  style?: StyleId;
  typography?: TypographySetId;
  showGrain?: boolean;
  showVignette?: boolean;

  // Legacy fields (deprecated, for backward compatibility)
  template?: TemplateId;
  theme?: ThemeId;
  font?: FontPreset;
  darkMode?: boolean;
  tags?: string[];

  // Share settings
  shareId?: string;
  shareExpiresAt?: string;
}

// Predefined block definitions
export const BLOCK_DEFINITIONS: Record<
  BlockId,
  { type: BlockType; label: string; placeholder: string; icon: string }
> = {
  custom: {
    type: 'text',
    label: 'Text note',
    placeholder: 'Write anything...',
    icon: '📝',
  },
  soundtrack: {
    type: 'link',
    label: 'Music / Link',
    placeholder: 'Song name, Spotify link, or any URL...',
    icon: '🎵',
  },
  steps: {
    type: 'number',
    label: 'Steps',
    placeholder: '0',
    icon: '👟',
  },
  sleep: {
    type: 'number',
    label: 'Sleep (hours)',
    placeholder: '0',
    icon: '😴',
  },
  weather: {
    type: 'weather',
    label: 'Weather',
    placeholder: 'Select condition...',
    icon: '🌤️',
  },
};

// Template definitions
export const TEMPLATES: Record<
  TemplateId,
  { name: string; description: string }
> = {
  default: { name: 'Classic', description: 'Standard card layout' },
  photoHeader: {
    name: 'Photo Header',
    description: 'Large photo with two columns below',
  },
  ultraMinimal: {
    name: 'Ultra Minimal',
    description: 'Text-only, clean design',
  },
  mixedGrid: {
    name: 'Mixed Grid',
    description: 'Photo + metrics + notes in grid',
  },
};

// Theme definitions
export const THEMES: Record<ThemeId, { name: string; gradient: string }> = {
  sunrise: {
    name: 'Sunrise',
    gradient: 'from-amber-50/80 via-white to-violet-50/80',
  },
  ocean: { name: 'Ocean', gradient: 'from-cyan-50/80 via-white to-blue-50/80' },
  sunset: {
    name: 'Sunset',
    gradient: 'from-orange-50/80 via-white to-pink-50/80',
  },
  forest: {
    name: 'Forest',
    gradient: 'from-green-50/80 via-white to-emerald-50/80',
  },
  lavender: {
    name: 'Lavender',
    gradient: 'from-purple-50/80 via-white to-indigo-50/80',
  },
};

// Font presets
export const FONT_PRESETS: Record<
  FontPreset,
  { name: string; className: string }
> = {
  system: { name: 'Sans', className: 'font-sans' },
  serif: { name: 'Serif', className: 'font-serif' },
  mono: { name: 'Mono', className: 'font-mono' },
  rounded: { name: 'Rounded', className: 'font-sans' }, // Would need custom font
};

export const MOODS: {
  value: Mood;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { value: 'great', label: 'Great', emoji: '😄', color: 'bg-green-500' },
  { value: 'good', label: 'Good', emoji: '🙂', color: 'bg-lime-500' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'bg-yellow-500' },
  { value: 'bad', label: 'Bad', emoji: '😔', color: 'bg-orange-500' },
  { value: 'terrible', label: 'Terrible', emoji: '😢', color: 'bg-red-500' },
];

export const getMoodInfo = (mood: Mood) => {
  return MOODS.find((m) => m.value === mood) || MOODS[2];
};
