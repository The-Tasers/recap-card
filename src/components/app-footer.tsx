'use client';

import Link from 'next/link';
import { Activity, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useI18n, LANGUAGES } from '@/lib/i18n';

const LETTER_COLORS = {
  R: '#22c55e',
  E: '#84cc16',
  C: '#eab308',
  A: '#f97316',
  P: '#ef4444',
};

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  muted?: boolean;
  animated?: boolean;
}

export function AppLogo({
  className,
  size = 'sm',
  href,
  muted = false,
  animated = false,
}: AppLogoProps) {
  const sizeConfig = {
    sm: { text: 'text-xs', icon: 'h-3 w-3' },
    md: { text: 'text-base', icon: 'h-4 w-4' },
    lg: { text: 'text-lg', icon: 'h-5 w-5' },
    xl: { text: 'text-2xl', icon: 'h-6 w-6' },
  };

  const { text: textSize, icon: iconSize } = sizeConfig[size];

  const content = (
    <span
      className={cn(
        textSize,
        'font-bold tracking-wide uppercase flex items-center'
      )}
    >
      {Object.entries(LETTER_COLORS).map(([letter, color]) => (
        <span
          key={letter}
          className={muted ? 'transition-colors' : ''}
          style={{ color: muted ? `${color}80` : color }}
        >
          {letter}
        </span>
      ))}
      {animated ? (
        <motion.span
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center"
        >
          <Activity
            className={cn(
              iconSize,
              'rotate-45 text-primary',
              muted && 'opacity-50 group-hover:opacity-80 transition-opacity'
            )}
            strokeWidth={3}
          />
        </motion.span>
      ) : (
        <Activity
          className={cn(
            iconSize,
            'rotate-45 text-primary',
            muted && 'opacity-50 group-hover:opacity-80 transition-opacity'
          )}
          strokeWidth={3}
        />
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={cn('cursor-pointer', className)}>
        {content}
      </Link>
    );
  }

  return <span className={className}>{content}</span>;
}

interface AppFooterProps {
  className?: string;
  showLogo?: boolean;
}

function LanguageSelector() {
  const { language, setLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const currentLang = LANGUAGES.find((l) => l.value === language);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer"
        aria-label={t('settings.language')}
      >
        <Globe className="h-3 w-3" />
        <span>{currentLang?.flag}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-popover border border-border rounded-lg shadow-lg overflow-hidden min-w-24 z-50"
          >
            <div className="py-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => {
                    setLanguage(lang.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer',
                    language === lang.value
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted/50'
                  )}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AppFooter({ className, showLogo = true }: AppFooterProps) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        'shrink-0 py-6 group flex flex-col items-center gap-2',
        className
      )}
    >
      {showLogo && <AppLogo size="sm" href="/" muted />}
      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors">
        <Link
          href="/privacy"
          className="hover:text-muted-foreground transition-colors"
        >
          {t('footer.privacy')}
        </Link>
        <span>·</span>
        <Link
          href="/terms"
          className="hover:text-muted-foreground transition-colors"
        >
          {t('footer.terms')}
        </Link>
        <span>·</span>
        <LanguageSelector />
      </div>
    </div>
  );
}
