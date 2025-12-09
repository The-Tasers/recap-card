'use client';

import { useState, useMemo } from 'react';
import {
  Dices,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DAILY_QUESTIONS,
  QUESTION_CATEGORIES,
  getRandomQuestion,
  getDailyQuestion,
  getQuestionsByCategory,
  type DailyQuestion,
} from '@/lib/questions';
import { QuestionCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DailyQuestionCardProps {
  onSelectQuestion: (question: string) => void;
  selectedCategory?: QuestionCategory | 'all';
  className?: string;
}

export function DailyQuestionCard({
  onSelectQuestion,
  selectedCategory = 'all',
  className,
}: DailyQuestionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<DailyQuestion | null>(
    () => getDailyQuestion()
  );

  const shuffleQuestion = () => {
    const newQuestion =
      selectedCategory === 'all'
        ? getRandomQuestion()
        : getRandomQuestion(selectedCategory);
    setCurrentQuestion(newQuestion);
  };

  const handleUseQuestion = () => {
    if (currentQuestion) {
      onSelectQuestion(currentQuestion.text);
    }
  };

  if (!currentQuestion) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-linear-to-br from-violet-50/80 to-amber-50/80 dark:from-violet-950/30 dark:to-amber-950/30 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-4 text-left">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-violet-500 dark:text-violet-400" />
              <div>
                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Daily Prompt
                </div>
                <div className="text-xs text-muted-foreground">
                  Get inspired by today&apos;s question
                </div>
              </div>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            <div className="p-4 rounded-xl bg-white/60 dark:bg-white/5">
              <p className="text-base leading-relaxed text-neutral-900 dark:text-neutral-100">
                {currentQuestion.text}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                  {
                    QUESTION_CATEGORIES.find(
                      (c) => c.value === currentQuestion.category
                    )?.label
                  }
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={shuffleQuestion}
                className="flex-1 rounded-full"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Another
              </Button>
              <Button
                size="sm"
                onClick={handleUseQuestion}
                className="flex-1 rounded-full"
              >
                Use This
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// Category picker for questions
interface QuestionCategoryPickerProps {
  selected: QuestionCategory | 'all';
  onSelect: (category: QuestionCategory | 'all') => void;
}

export function QuestionCategoryPicker({
  selected,
  onSelect,
}: QuestionCategoryPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect('all')}
        className={cn(
          'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
          selected === 'all'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        )}
      >
        All
      </button>
      {QUESTION_CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onSelect(cat.value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            selected === cat.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}

// Browse all questions
interface QuestionBrowserProps {
  onSelectQuestion: (question: string) => void;
}

export function QuestionBrowser({ onSelectQuestion }: QuestionBrowserProps) {
  const [category, setCategory] = useState<QuestionCategory | 'all'>('all');

  const questions = useMemo(() => {
    if (category === 'all') return DAILY_QUESTIONS;
    return getQuestionsByCategory(category);
  }, [category]);

  return (
    <div className="space-y-4">
      <QuestionCategoryPicker selected={category} onSelect={setCategory} />

      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {questions.map((q) => (
          <button
            key={q.id}
            onClick={() => onSelectQuestion(q.text)}
            className="w-full text-left p-3 rounded-xl border hover:bg-muted/50 transition-colors"
          >
            <p className="text-sm">{q.text}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                {QUESTION_CATEGORIES.find((c) => c.value === q.category)?.emoji}{' '}
                {QUESTION_CATEGORIES.find((c) => c.value === q.category)?.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Random question button (inline)
interface RandomQuestionButtonProps {
  onQuestion: (question: string) => void;
  category?: QuestionCategory;
}

export function RandomQuestionButton({
  onQuestion,
  category,
}: RandomQuestionButtonProps) {
  const handleClick = () => {
    const q = category ? getRandomQuestion(category) : getRandomQuestion();
    if (q) {
      onQuestion(q.text);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="text-muted-foreground hover:text-foreground"
    >
      <Dices className="h-4 w-4 mr-1.5" />
      Random prompt
    </Button>
  );
}
