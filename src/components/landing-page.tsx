'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Activity,
  Globe,
  ChevronDown,
  Sparkles,
  Lock,
  Bell,
  Moon,
  Languages,
  Calendar,
  MessageCircle,
  Mail,
  ChevronLeft,
  ChevronRight,
  Heart,
  Palette,
  CloudOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';
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
  size = 'lg',
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

// Language selector for landing page - dropdown
function LandingLanguageSelector({ currentLang }: { currentLang: Language }) {
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

// Feature card component
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-6 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

// FAQ item component
function FAQItem({
  question,
  answer,
  delay = 0,
}: {
  question: string;
  answer: string;
  delay?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="border-b border-border/50 last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left cursor-pointer"
      >
        <span className="font-medium pr-4">{question}</span>
        <ChevronDown
          className={cn('h-5 w-5 text-muted-foreground transition-transform shrink-0', isOpen && 'rotate-180')}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-muted-foreground text-sm leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Helper to get translation
function t(lang: Language, key: string): string {
  const langTranslations = translations[lang] as Record<string, string> | undefined;
  const enTranslations = translations.en as Record<string, string>;
  return langTranslations?.[key] || enTranslations[key] || key;
}

// App Store button component
const APP_STORE_URL = 'https://apps.apple.com/app/recapz-daily-reflection/id6757631286';

function AppStoreButton({ lang }: { lang: Language }) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block hover:opacity-80 transition-opacity"
    >
      <Image
        src={`/app-store-buttons/${lang}.svg`}
        alt="Download on the App Store"
        width={160}
        height={54}
        className="h-[54px] w-auto"
      />
    </a>
  );
}

// Screenshots data
const SCREENSHOTS = [
  { src: '/screenshots/1.png', alt: 'Main app screen' },
  { src: '/screenshots/2.png', alt: 'Discover patterns' },
  { src: '/screenshots/3.png', alt: 'How are you feeling' },
  { src: '/screenshots/4.png', alt: 'Daily check-in' },
  { src: '/screenshots/5.png', alt: 'Insights view' },
  { src: '/screenshots/6.png', alt: 'Settings' },
];

// Screenshot slider component
function ScreenshotSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SCREENSHOTS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SCREENSHOTS.length) % SCREENSHOTS.length);
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center justify-center gap-4 md:gap-8">
        <button
          onClick={prevSlide}
          className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
          aria-label="Previous screenshot"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="relative w-[240px] h-[522px] md:w-[280px] md:h-[608px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={SCREENSHOTS[currentIndex].src}
                alt={SCREENSHOTS[currentIndex].alt}
                fill
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={nextSlide}
          className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
          aria-label="Next screenshot"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {SCREENSHOTS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all cursor-pointer',
              index === currentIndex
                ? 'bg-primary w-6'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            )}
            aria-label={`Go to screenshot ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

interface LandingPageProps {
  lang: Language;
}

export function LandingPage({ lang }: LandingPageProps) {
  // Get privacy/terms paths based on language
  const getLocalizedPath = (path: string) => {
    return lang === 'en' ? path : `/${lang}${path}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <a
              href="https://sponom.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t(lang, 'header.otherProducts')}
            </a>
            <LandingLanguageSelector currentLang={lang} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                {t(lang, 'landing.heroTitle')}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t(lang, 'landing.heroSubtitle')}
              </p>
              <div className="mb-12">
                <AppStoreButton lang={lang} />
              </div>
            </motion.div>

            {/* 3 Screenshots in Hero */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex items-end justify-center gap-3 md:gap-6"
            >
              {/* Left phone - smaller and dimmed */}
              <div className="relative w-[120px] h-[260px] md:w-[160px] md:h-[348px] opacity-60 transform -translate-y-4 rounded-xl md:rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/screenshots/3.png"
                  alt="Check-in screen"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Center phone - main and larger */}
              <div className="relative w-[180px] h-[390px] md:w-[240px] md:h-[522px] z-10 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/screenshots/1.png"
                  alt="Main app screen"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Right phone - smaller and dimmed */}
              <div className="relative w-[120px] h-[260px] md:w-[160px] md:h-[348px] opacity-60 transform -translate-y-4 rounded-xl md:rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/screenshots/2.png"
                  alt="Discover patterns"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 rounded-2xl bg-background border border-border/50 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t(lang, 'landing.about1Title')}</h3>
              <p className="text-muted-foreground text-sm">{t(lang, 'landing.about1Desc')}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 rounded-2xl bg-background border border-border/50 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t(lang, 'landing.about2Title')}</h3>
              <p className="text-muted-foreground text-sm">{t(lang, 'landing.about2Desc')}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 rounded-2xl bg-background border border-border/50 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CloudOff className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t(lang, 'landing.about3Title')}</h3>
              <p className="text-muted-foreground text-sm">{t(lang, 'landing.about3Desc')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Screenshots Gallery */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t(lang, 'landing.screenshotsTitle')}</h2>
            <p className="text-muted-foreground">{t(lang, 'landing.screenshotsSubtitle')}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ScreenshotSlider />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t(lang, 'landing.featuresTitle')}</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Sparkles}
              title={t(lang, 'landing.feature1Title')}
              description={t(lang, 'landing.feature1Desc')}
              delay={0}
            />
            <FeatureCard
              icon={Moon}
              title={t(lang, 'landing.feature2Title')}
              description={t(lang, 'landing.feature2Desc')}
              delay={0.1}
            />
            <FeatureCard
              icon={Bell}
              title={t(lang, 'landing.feature3Title')}
              description={t(lang, 'landing.feature3Desc')}
              delay={0.2}
            />
            <FeatureCard
              icon={Calendar}
              title={t(lang, 'landing.feature4Title')}
              description={t(lang, 'landing.feature4Desc')}
              delay={0.3}
            />
            <FeatureCard
              icon={Languages}
              title={t(lang, 'landing.feature5Title')}
              description={t(lang, 'landing.feature5Desc')}
              delay={0.4}
            />
            <FeatureCard
              icon={Lock}
              title={t(lang, 'landing.feature6Title')}
              description={t(lang, 'landing.feature6Desc')}
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold">{t(lang, 'landing.faqTitle')}</h2>
          </motion.div>
          <div className="bg-muted/30 rounded-2xl border border-border/50 p-6 md:p-8">
            <FAQItem
              question={t(lang, 'landing.faq1Q')}
              answer={t(lang, 'landing.faq1A')}
              delay={0}
            />
            <FAQItem
              question={t(lang, 'landing.faq2Q')}
              answer={t(lang, 'landing.faq2A')}
              delay={0.1}
            />
            <FAQItem
              question={t(lang, 'landing.faq3Q')}
              answer={t(lang, 'landing.faq3A')}
              delay={0.2}
            />
            <FAQItem
              question={t(lang, 'landing.faq4Q')}
              answer={t(lang, 'landing.faq4A')}
              delay={0.3}
            />
            <FAQItem
              question={t(lang, 'landing.faq5Q')}
              answer={t(lang, 'landing.faq5A')}
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Download CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t(lang, 'landing.ctaTitle')}</h2>
            <p className="text-muted-foreground mb-8">{t(lang, 'landing.ctaSubtitle')}</p>
            <AppStoreButton lang={lang} />
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t(lang, 'landing.contactTitle')}</h2>
            <p className="text-muted-foreground mb-6">{t(lang, 'landing.contactText')}</p>
            <a
              href="mailto:support@recapz.app"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-5 w-5" />
              support@recapz.app
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href={getLocalizedPath('/privacy')} className="hover:text-foreground transition-colors">
                {t(lang, 'footer.privacy')}
              </Link>
              <Link href={getLocalizedPath('/terms')} className="hover:text-foreground transition-colors">
                {t(lang, 'footer.terms')}
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              {t(lang, 'landing.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
