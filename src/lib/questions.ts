import { QuestionCategory } from './types';

export interface DailyQuestion {
  id: string;
  text: string;
  category: QuestionCategory;
}

export const DAILY_QUESTIONS: DailyQuestion[] = [
  // Reflection
  { id: 'r1', text: 'What moment today do you want to remember?', category: 'reflection' },
  { id: 'r2', text: 'How did today differ from what you expected?', category: 'reflection' },
  { id: 'r3', text: 'What would you do differently if you could relive today?', category: 'reflection' },
  { id: 'r4', text: 'What emotion dominated your day?', category: 'reflection' },
  { id: 'r5', text: 'What conversation stuck with you today?', category: 'reflection' },
  { id: 'r6', text: 'What did you notice for the first time today?', category: 'reflection' },
  { id: 'r7', text: 'How did you take care of yourself today?', category: 'reflection' },
  { id: 'r8', text: 'What made you smile today?', category: 'reflection' },
  
  // Gratitude
  { id: 'g1', text: 'What are three things you\'re grateful for right now?', category: 'gratitude' },
  { id: 'g2', text: 'Who made your day better today?', category: 'gratitude' },
  { id: 'g3', text: 'What small comfort did you enjoy today?', category: 'gratitude' },
  { id: 'g4', text: 'What opportunity are you thankful for?', category: 'gratitude' },
  { id: 'g5', text: 'What ability or skill are you grateful to have?', category: 'gratitude' },
  { id: 'g6', text: 'What made you feel lucky today?', category: 'gratitude' },
  { id: 'g7', text: 'What beauty did you witness today?', category: 'gratitude' },
  
  // Work
  { id: 'w1', text: 'What did you accomplish at work today?', category: 'work' },
  { id: 'w2', text: 'What challenge did you overcome professionally?', category: 'work' },
  { id: 'w3', text: 'What did you learn that will help your career?', category: 'work' },
  { id: 'w4', text: 'How did you help a colleague today?', category: 'work' },
  { id: 'w5', text: 'What project are you most excited about?', category: 'work' },
  { id: 'w6', text: 'What skill do you want to improve at work?', category: 'work' },
  { id: 'w7', text: 'What feedback did you receive or give today?', category: 'work' },
  
  // Creativity
  { id: 'c1', text: 'What inspired you creatively today?', category: 'creativity' },
  { id: 'c2', text: 'What would you create if you had unlimited time?', category: 'creativity' },
  { id: 'c3', text: 'What problem do you wish you could solve creatively?', category: 'creativity' },
  { id: 'c4', text: 'What new idea came to you today?', category: 'creativity' },
  { id: 'c5', text: 'How did you express yourself today?', category: 'creativity' },
  { id: 'c6', text: 'What would you like to learn to create?', category: 'creativity' },
  { id: 'c7', text: 'What creative work moved you recently?', category: 'creativity' },
  
  // Random
  { id: 'x1', text: 'If today were a movie, what genre would it be?', category: 'random' },
  { id: 'x2', text: 'What song describes your mood right now?', category: 'random' },
  { id: 'x3', text: 'What would your pet (real or imaginary) say about your day?', category: 'random' },
  { id: 'x4', text: 'If you could teleport anywhere right now, where would you go?', category: 'random' },
  { id: 'x5', text: 'What superpower would have been useful today?', category: 'random' },
  { id: 'x6', text: 'What did you eat today that was memorable?', category: 'random' },
  { id: 'x7', text: 'If today had a color, what would it be?', category: 'random' },
  { id: 'x8', text: 'What would you tell your past self from this morning?', category: 'random' },
];

export const QUESTION_CATEGORIES: { value: QuestionCategory; label: string; emoji: string }[] = [
  { value: 'reflection', label: 'Reflection', emoji: '🪞' },
  { value: 'gratitude', label: 'Gratitude', emoji: '🙏' },
  { value: 'work', label: 'Work', emoji: '💼' },
  { value: 'creativity', label: 'Creativity', emoji: '🎨' },
  { value: 'random', label: 'Random', emoji: '🎲' },
];

export const getQuestionsByCategory = (category: QuestionCategory): DailyQuestion[] => {
  return DAILY_QUESTIONS.filter(q => q.category === category);
};

export const getRandomQuestion = (category?: QuestionCategory): DailyQuestion => {
  const questions = category 
    ? getQuestionsByCategory(category)
    : DAILY_QUESTIONS;
  return questions[Math.floor(Math.random() * questions.length)];
};

export const getDailyQuestion = (): DailyQuestion => {
  // Use date as seed for consistent daily question
  const today = new Date().toDateString();
  const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DAILY_QUESTIONS[seed % DAILY_QUESTIONS.length];
};
