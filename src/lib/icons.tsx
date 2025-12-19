'use client';

import {
  Smile,
  Meh,
  Frown,
  Laugh,
  Angry,
  Moon,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
  Wind,
  Egg,
  Salad,
  UtensilsCrossed,
  Cookie,
  ShowerHead,
  Droplets,
  Sparkles,
  Pill,
  Building2,
  Stethoscope,
  ThermometerSun,
  Eye,
  Heart,
  Briefcase,
  Palette,
  Dices,
  CloudSun,
  Waves,
  Dumbbell,
  Footprints,
  Bike,
  Mountain,
  Music,
  Goal,
  PersonStanding,
  Activity,
  Move,
  type LucideIcon,
} from 'lucide-react';
import { Mood, BlockId } from './types';

// Mood icons mapping
export const MOOD_ICONS: Record<Mood, LucideIcon> = {
  great: Laugh,
  good: Smile,
  neutral: Meh,
  bad: Frown,
  terrible: Angry,
};

// Block definition icons
export const BLOCK_ICONS: Record<BlockId, LucideIcon> = {
  sleep: Moon,
  weather: Sun,
  meals: UtensilsCrossed,
  selfcare: ShowerHead,
  health: Stethoscope,
  exercise: Dumbbell,
};

// Weather option icons
export const WEATHER_ICONS: Record<string, LucideIcon> = {
  sunny: Sun,
  'partly-cloudy': CloudSun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: CloudLightning,
  snowy: Snowflake,
  foggy: CloudFog,
  windy: Wind,
};

// Meal option icons
export const MEAL_ICONS: Record<string, LucideIcon> = {
  breakfast: Egg,
  lunch: Salad,
  dinner: UtensilsCrossed,
  'night-snack': Cookie,
};

// Self-care option icons
export const SELFCARE_ICONS: Record<string, LucideIcon> = {
  shower: ShowerHead,
  'brush-teeth': Sparkles,
  'wash-face': Waves,
  'drink-water': Droplets,
};

// Health option icons
export const HEALTH_ICONS: Record<string, LucideIcon> = {
  sick: ThermometerSun,
  hospital: Building2,
  checkup: Stethoscope,
  medicine: Pill,
};

// Exercise option icons
export const EXERCISE_ICONS: Record<string, LucideIcon> = {
  running: Footprints,
  walking: PersonStanding,
  cycling: Bike,
  swimming: Waves,
  gym: Dumbbell,
  yoga: Activity,
  stretching: Move,
  hiking: Mountain,
  dancing: Music,
  sports: Goal,
};

// Question category icons
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  reflection: Eye,
  gratitude: Heart,
  work: Briefcase,
  creativity: Palette,
  random: Dices,
};

// Helper component to render mood icon
interface MoodIconProps {
  mood: Mood;
  className?: string;
}

export function MoodIcon({ mood, className = 'h-6 w-6' }: MoodIconProps) {
  const Icon = MOOD_ICONS[mood];
  return <Icon className={className} />;
}

// Helper to get icon component for options
export function getOptionIcon(
  type: 'weather' | 'meals' | 'selfcare' | 'health' | 'exercise',
  value: string
): LucideIcon {
  switch (type) {
    case 'weather':
      return WEATHER_ICONS[value] || Sun;
    case 'meals':
      return MEAL_ICONS[value] || UtensilsCrossed;
    case 'selfcare':
      return SELFCARE_ICONS[value] || ShowerHead;
    case 'health':
      return HEALTH_ICONS[value] || Stethoscope;
    case 'exercise':
      return EXERCISE_ICONS[value] || Dumbbell;
  }
}
