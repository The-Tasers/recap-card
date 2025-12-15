export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

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
export type BlockType = 'text' | 'number' | 'link' | 'slider' | 'weather' | 'multiselect' | 'checkbox';

export type BlockId = 'sleep' | 'weather' | 'meals' | 'selfcare' | 'health';

export interface CardBlock {
  id: string;
  type: BlockType;
  blockId: BlockId;
  label: string;
  value: string | number | string[]; // string[] for multiselect
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
}

// Predefined block definitions
export const BLOCK_DEFINITIONS: Record<
  BlockId,
  { type: BlockType; label: string; placeholder: string; icon: string }
> = {
  sleep: {
    type: 'number',
    label: 'Sleep',
    placeholder: '0',
    icon: '🌙',
  },
  weather: {
    type: 'multiselect',
    label: 'Weather',
    placeholder: 'Select condition...',
    icon: '☀️',
  },
  meals: {
    type: 'multiselect',
    label: 'Meals',
    placeholder: 'Select meals...',
    icon: '🍳',
  },
  selfcare: {
    type: 'multiselect',
    label: 'Self-Care',
    placeholder: 'Select activities...',
    icon: '🚿',
  },
  health: {
    type: 'multiselect',
    label: 'Health',
    placeholder: 'Select items...',
    icon: '🩺',
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

// Block options definitions
export const WEATHER_OPTIONS = [
  { value: 'sunny', label: 'sunny', icon: '☀️' },
  { value: 'partly-cloudy', label: 'partly cloudy', icon: '⛅' },
  { value: 'cloudy', label: 'cloudy', icon: '☁️' },
  { value: 'rainy', label: 'rainy', icon: '🌧️' },
  { value: 'stormy', label: 'stormy', icon: '⛈️' },
  { value: 'snowy', label: 'snowy', icon: '❄️' },
  { value: 'foggy', label: 'foggy', icon: '🌫️' },
  { value: 'windy', label: 'windy', icon: '💨' },
];

export const MEAL_OPTIONS = [
  { value: 'breakfast', label: 'breakfast', icon: '🍳' },
  { value: 'lunch', label: 'lunch', icon: '🥗' },
  { value: 'dinner', label: 'dinner', icon: '🍽️' },
  { value: 'night-snack', label: 'night snack', icon: '🍪' },
];

export const SELFCARE_OPTIONS = [
  { value: 'shower', label: 'shower', icon: '🚿' },
  { value: 'brush-teeth', label: 'brush teeth', icon: '🪥' },
  { value: 'wash-face', label: 'wash face', icon: '🧼' },
  { value: 'drink-water', label: 'drink water', icon: '💧' },
];

export const HEALTH_OPTIONS = [
  { value: 'sick', label: 'sick', icon: '🤢' },
  { value: 'hospital', label: 'hospital', icon: '🏥' },
  { value: 'checkup', label: 'checkup', icon: '🩺' },
  { value: 'medicine', label: 'medicine', icon: '💊' },
];
