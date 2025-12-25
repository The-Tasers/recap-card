'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Angry, Frown, Meh, Smile, Laugh } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Rating options with mood icons and colors (matching app's mood palette)
const RATING_OPTIONS: {
  value: number;
  icon: LucideIcon;
  key: string;
  color: string;
  bgColor: string;
  selectedBg: string;
}[] = [
  {
    value: 5,
    icon: Laugh,
    key: 'feedback.rating.5',
    color: 'text-[#22c55e]',
    bgColor: 'bg-[#22c55e]/10 border-[#22c55e]/30 hover:bg-[#22c55e]/20',
    selectedBg: 'bg-[#22c55e] border-[#22c55e]',
  },
  {
    value: 4,
    icon: Smile,
    key: 'feedback.rating.4',
    color: 'text-[#84cc16]',
    bgColor: 'bg-[#84cc16]/10 border-[#84cc16]/30 hover:bg-[#84cc16]/20',
    selectedBg: 'bg-[#84cc16] border-[#84cc16]',
  },
  {
    value: 3,
    icon: Meh,
    key: 'feedback.rating.3',
    color: 'text-[#eab308]',
    bgColor: 'bg-[#eab308]/10 border-[#eab308]/30 hover:bg-[#eab308]/20',
    selectedBg: 'bg-[#eab308] border-[#eab308]',
  },
  {
    value: 2,
    icon: Frown,
    key: 'feedback.rating.2',
    color: 'text-[#f97316]',
    bgColor: 'bg-[#f97316]/10 border-[#f97316]/30 hover:bg-[#f97316]/20',
    selectedBg: 'bg-[#f97316] border-[#f97316]',
  },
  {
    value: 1,
    icon: Angry,
    key: 'feedback.rating.1',
    color: 'text-[#ef4444]',
    bgColor: 'bg-[#ef4444]/10 border-[#ef4444]/30 hover:bg-[#ef4444]/20',
    selectedBg: 'bg-[#ef4444] border-[#ef4444]',
  },
];

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: user?.id || null,
        rating,
        message: message.trim() || null,
      });

      if (error) {
        console.error('Error submitting feedback:', error);
        toast.error(t('feedback.error'));
      } else {
        toast.success(t('feedback.thanks'));
        handleClose();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(t('feedback.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed left-4 right-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-background rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-medium">{t('feedback.title')}</h2>
              <button
                onClick={handleClose}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {t('feedback.description')}
              </p>

              {/* Rating options as chips */}
              <div className="flex flex-wrap justify-center gap-2">
                {RATING_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = rating === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRating(option.value)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-full transition-all cursor-pointer text-sm',
                        isSelected
                          ? `${option.selectedBg} text-white`
                          : option.bgColor
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          isSelected ? 'text-white' : option.color
                        )}
                      />
                      <span className={cn(isSelected ? 'text-white' : '')}>
                        {t(option.key as Parameters<typeof t>[0])}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Optional message */}
              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('feedback.messagePlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-muted/30 border border-border/50 focus:border-primary focus:outline-none transition-colors text-sm resize-none"
                />
              </div>

              {/* Submit button */}
              <Button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t('feedback.submit')
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
