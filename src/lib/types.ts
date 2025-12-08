export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

export interface DailyCard {
  id: string;
  text: string;
  mood: Mood;
  photoUrl?: string;
  createdAt: string;
}

export const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'great', label: 'Great', emoji: '😄' },
  { value: 'good', label: 'Good', emoji: '🙂' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'bad', label: 'Bad', emoji: '😔' },
  { value: 'terrible', label: 'Terrible', emoji: '😢' },
];

export const getMoodInfo = (mood: Mood) => {
  return MOODS.find((m) => m.value === mood) || MOODS[2];
};
