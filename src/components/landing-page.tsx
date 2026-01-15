'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  ChevronDown,
  Sparkles,
  Lock,
  Bell,
  Moon,
  Languages,
  Calendar,
  Heart,
  Palette,
  CloudOff,
  X,
  WifiOff,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';
import { translations, type Language } from '@/lib/i18n/translations';
import { SharedHeader, Logo } from './shared-header';

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
  const langTranslations = translations[lang] as unknown as Record<string, string> | undefined;
  const enTranslations = translations.en as unknown as Record<string, string>;
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

// Screenshot grid component with modal
function ScreenshotGrid() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
        {SCREENSHOTS.map((screenshot, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            onClick={() => setSelectedImage(index)}
            className="relative aspect-[9/19.5] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Image
              src={screenshot.src}
              alt={screenshot.alt}
              fill
              className="object-cover"
            />
          </motion.button>
        ))}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center p-4"
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
            >
              <X className="h-8 w-8" />
            </motion.button>

            {/* Navigation arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((prev) => (prev !== null && prev > 0 ? prev - 1 : SCREENSHOTS.length - 1));
              }}
              className="absolute left-4 p-3 text-white/80 hover:text-white transition-colors"
            >
              <ChevronDown className="h-8 w-8 rotate-90" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((prev) => (prev !== null && prev < SCREENSHOTS.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-4 p-3 text-white/80 hover:text-white transition-colors"
            >
              <ChevronDown className="h-8 w-8 -rotate-90" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm aspect-[9/19.5] rounded-3xl overflow-hidden shadow-2xl"
            >
              <Image
                src={SCREENSHOTS[selectedImage].src}
                alt={SCREENSHOTS[selectedImage].alt}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
      <SharedHeader lang={lang} variant="fixed" maxWidth="6xl" />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-8 items-center">
            {/* Left column - Text content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-left"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                {t(lang, 'landing.heroTitle')}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-lg">
                {t(lang, 'landing.heroSubtitle')}
              </p>
              <p className="text-primary font-medium mb-8">
                {t(lang, 'landing.heroPrivacy')}
              </p>

              {/* Learn More button */}
              <div className="mb-8">
                <a
                  href="#features"
                  className="inline-flex items-center px-6 py-3 border-2 border-primary text-primary rounded-full font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {t(lang, 'landing.learnMore')}
                </a>
              </div>

              {/* Feature badges */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 text-primary text-sm font-medium">
                  <WifiOff className="h-4 w-4" />
                  {t(lang, 'landing.badge100Offline')}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-muted-foreground text-sm">
                  <Smartphone className="h-4 w-4" />
                  {t(lang, 'landing.badgeDataOnDevice')}
                </span>
              </div>

              {/* App Store button */}
              <AppStoreButton lang={lang} />
            </motion.div>

            {/* Right column - Screenshots */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex items-end justify-center gap-2 md:gap-4"
            >
              {/* Left phone */}
              <div className="relative w-[100px] h-[217px] md:w-[140px] md:h-[304px] opacity-80 rounded-xl md:rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/screenshots/3.png"
                  alt="Check-in screen"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Center phone - main and larger */}
              <div className="relative w-[140px] h-[304px] md:w-[180px] md:h-[391px] z-10 rounded-xl md:rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/screenshots/1.png"
                  alt="Main app screen"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Right phone */}
              <div className="relative w-[100px] h-[217px] md:w-[140px] md:h-[304px] opacity-80 rounded-xl md:rounded-2xl overflow-hidden shadow-xl">
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
            <ScreenshotGrid />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 md:py-24 scroll-mt-20">
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

      {/* Footer */}
      <footer className="py-16 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Logo & Description */}
            <div className="md:col-span-1">
              <Logo size="md" />
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {t(lang, 'footer.tagline')}
              </p>
            </div>
            {/* Features */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">{t(lang, 'footer.features')}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href={getLocalizedPath('/features/mood-tracking')} className="hover:text-foreground transition-colors">
                    {t(lang, 'footer.moodTracking')}
                  </Link>
                </li>
                <li>
                  <Link href={getLocalizedPath('/features/daily-reflection')} className="hover:text-foreground transition-colors">
                    {t(lang, 'footer.dailyReflection')}
                  </Link>
                </li>
                <li>
                  <Link href={getLocalizedPath('/features/mental-wellness')} className="hover:text-foreground transition-colors">
                    {t(lang, 'footer.mentalWellness')}
                  </Link>
                </li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">{t(lang, 'footer.legal')}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href={getLocalizedPath('/privacy')} className="hover:text-foreground transition-colors">
                    {t(lang, 'footer.privacy')}
                  </Link>
                </li>
                <li>
                  <Link href={getLocalizedPath('/terms')} className="hover:text-foreground transition-colors">
                    {t(lang, 'footer.terms')}
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@recapz.app" className="hover:text-foreground transition-colors">
                    {t(lang, 'footer.contact')}
                  </a>
                </li>
              </ul>
            </div>
            {/* Get the App */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">{t(lang, 'footer.download')}</h4>
              <AppStoreButton lang={lang} />
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {t(lang, 'landing.copyright')}
            </p>
            <p className="text-xs text-muted-foreground/60">
              Made with care for your wellbeing
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
