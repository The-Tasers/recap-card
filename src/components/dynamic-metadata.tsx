'use client';

import { useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

export function DynamicMetadata() {
  const { t, language } = useI18n();

  useEffect(() => {
    // Update document title
    document.title = t('meta.title');

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('meta.description'));
    }

    // Update html lang attribute
    document.documentElement.lang = language;
  }, [t, language]);

  return null;
}
