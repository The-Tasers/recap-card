'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Activity, ChevronDown, X, Menu, Globe, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { translations, type Language, LANGUAGES } from '@/lib/i18n/translations';

// Logo component
const LETTER_COLORS = {
  R: '#ef4444',
  E: '#f97316',
  C: '#eab308',
  A: '#22c55e',
  P: '#3b82f6',
};

function Logo({
  size = 'md',
  animated = false,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animated?: boolean;
}) {
  const sizeConfig = {
    sm: { text: 'text-xl', icon: 'h-5 w-5' },
    md: { text: 'text-2xl', icon: 'h-6 w-6' },
    lg: { text: 'text-3xl', icon: 'h-7 w-7' },
    xl: { text: 'text-4xl', icon: 'h-8 w-8' },
    '2xl': { text: 'text-5xl', icon: 'h-10 w-10' },
  };

  const { text: textSize, icon: iconSize } = sizeConfig[size];

  return (
    <span
      className={cn(textSize, 'font-bold tracking-wide uppercase flex items-center')}
    >
      {Object.entries(LETTER_COLORS).map(([letter, color]) => (
        <span key={letter} style={{ color }}>
          {letter}
        </span>
      ))}
      {animated ? (
        <motion.span
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center"
        >
          <Activity className={cn(iconSize, 'text-primary rotate-45')} strokeWidth={3} />
        </motion.span>
      ) : (
        <Activity className={cn(iconSize, 'text-primary rotate-45')} strokeWidth={3} />
      )}
    </span>
  );
}

// Helper to get translation
function t(lang: Language, key: string): string {
  const langTranslations = translations[lang] as unknown as Record<string, string> | undefined;
  const enTranslations = translations.en as unknown as Record<string, string>;
  return langTranslations?.[key] || enTranslations[key] || key;
}

// Language selector dropdown
function LanguageSelector({ currentLang }: { currentLang: Language }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getLanguagePath = (lang: Language) => {
    return lang === 'en' ? '/' : `/${lang}`;
  };

  const currentLanguage = LANGUAGES.find((l) => l.value === currentLang);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-lg">{currentLanguage?.flag}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 bg-background border border-border rounded-xl shadow-lg overflow-hidden min-w-[160px]"
          >
            {LANGUAGES.map((lang) => (
              <a
                key={lang.value}
                href={getLanguagePath(lang.value)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors',
                  currentLang === lang.value && 'bg-primary/10'
                )}
                onClick={() => setIsOpen(false)}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm">{lang.label}</span>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Features dropdown that shows on hover
function FeaturesDropdown({ lang, getLocalizedPath }: { lang: Language; getLocalizedPath: (path: string) => string }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
      >
        {t(lang, 'footer.features')}
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1 z-50 bg-background border border-border rounded-xl shadow-lg overflow-hidden min-w-[200px]"
          >
            <Link
              href={getLocalizedPath('/features/mood-tracking')}
              className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {t(lang, 'footer.moodTracking')}
            </Link>
            <Link
              href={getLocalizedPath('/features/daily-reflection')}
              className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {t(lang, 'footer.dailyReflection')}
            </Link>
            <Link
              href={getLocalizedPath('/features/mental-wellness')}
              className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {t(lang, 'footer.mentalWellness')}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SharedHeaderProps {
  lang: Language;
  variant?: 'fixed' | 'sticky';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '6xl';
}

export function SharedHeader({ lang, variant = 'fixed', maxWidth = '6xl' }: SharedHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getLocalizedPath = (path: string) => {
    return lang === 'en' ? path : `/${lang}${path}`;
  };

  const homePath = lang === 'en' ? '/' : `/${lang}`;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '6xl': 'max-w-6xl',
  };

  return (
    <header
      className={cn(
        'top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50',
        variant === 'fixed' ? 'fixed' : 'sticky'
      )}
    >
      <div className={cn(maxWidthClasses[maxWidth], 'mx-auto px-4 sm:px-6 py-3 flex items-center justify-between')}>
        {/* Left side: Logo + Navigation */}
        <div className="flex items-center gap-6">
          <Link href={homePath}>
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation - next to logo */}
          <nav className="hidden md:flex items-center gap-4">
            <FeaturesDropdown lang={lang} getLocalizedPath={getLocalizedPath} />
            <a
              href="https://sponom.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t(lang, 'header.otherProducts')}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </nav>
        </div>

        {/* Right side: Language selector + Get App button */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSelector currentLang={lang} />
          <a
            href="https://apps.apple.com/app/recapz-daily-reflection/id6757631286"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t(lang, 'header.getApp')}
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSelector currentLang={lang} />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {t(lang, 'footer.features')}
              </div>
              <Link
                href={getLocalizedPath('/features/mood-tracking')}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2 pl-2"
              >
                {t(lang, 'footer.moodTracking')}
              </Link>
              <Link
                href={getLocalizedPath('/features/daily-reflection')}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2 pl-2"
              >
                {t(lang, 'footer.dailyReflection')}
              </Link>
              <Link
                href={getLocalizedPath('/features/mental-wellness')}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2 pl-2"
              >
                {t(lang, 'footer.mentalWellness')}
              </Link>
              <div className="pt-2 border-t border-border/50">
                <a
                  href="https://sponom.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {t(lang, 'header.otherProducts')}
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

// Export Logo for use in footer
export { Logo };
