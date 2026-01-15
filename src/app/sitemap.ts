import type { MetadataRoute } from 'next';

const baseUrl = 'https://recapz.app';

const languages = ['es', 'fr', 'de', 'zh', 'ja', 'ko', 'ru'];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];

  // Main pages (English)
  routes.push(
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }
  );

  // Feature pages (SEO) - English
  const features = ['mood-tracking', 'daily-reflection', 'mental-wellness'];
  for (const feature of features) {
    routes.push({
      url: `${baseUrl}/features/${feature}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  // Localized pages
  for (const lang of languages) {
    routes.push(
      {
        url: `${baseUrl}/${lang}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/${lang}/privacy`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${baseUrl}/${lang}/terms`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.4,
      }
    );

    // Localized feature pages
    for (const feature of features) {
      routes.push({
        url: `${baseUrl}/${lang}/features/${feature}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return routes;
}
