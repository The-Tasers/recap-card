import { toJpeg } from 'html-to-image';
import { DailyCard } from './types';

// Story dimensions for Instagram/TikTok (9:16)
export const STORY_EXPORT_CONFIG = {
  width: 1080,
  height: 1920,
  pixelRatio: 1, // Since we're rendering at full size
  quality: 0.95,
};

export const exportCardImage = async (
  element: HTMLElement
): Promise<string> => {
  const dataUrl = await toJpeg(element, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  });
  return dataUrl;
};

// Export story at full 1080x1920 resolution
export const exportStoryImage = async (
  element: HTMLElement
): Promise<string> => {
  const dataUrl = await toJpeg(element, {
    quality: STORY_EXPORT_CONFIG.quality,
    pixelRatio: STORY_EXPORT_CONFIG.pixelRatio,
    width: STORY_EXPORT_CONFIG.width,
    height: STORY_EXPORT_CONFIG.height,
    backgroundColor: undefined, // Use element's background
  });
  return dataUrl;
};

export const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

export const shareImage = async (dataUrl: string, title: string) => {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `${title}.jpg`, { type: 'image/jpeg' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        files: [file],
      });
      return true;
    }
  } catch (error) {
    console.error('Share failed:', error);
  }
  return false;
};

// Export cards as JSON for backup
export const exportCardsAsJson = (cards: DailyCard[]): string => {
  return JSON.stringify(cards, null, 2);
};

// Download JSON backup
export const downloadJson = (cards: DailyCard[], filename: string) => {
  const json = exportCardsAsJson(cards);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

// Export multiple cards as a ZIP file with images
export const exportCardsAsZip = async (
  cards: DailyCard[],
  getCardElement: (cardId: string) => HTMLElement | null
): Promise<void> => {
  // Dynamically import JSZip to avoid SSR issues
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  // Add JSON data
  zip.file('cards.json', exportCardsAsJson(cards));

  // Add card images
  const imagesFolder = zip.folder('images');
  if (imagesFolder) {
    for (const card of cards) {
      const element = getCardElement(card.id);
      if (element) {
        try {
          const dataUrl = await exportCardImage(element);
          const base64Data = dataUrl.split(',')[1];
          const filename = `${formatFullDate(card.createdAt).replace(
            /\s/g,
            '-'
          )}.jpg`;
          imagesFolder.file(filename, base64Data, { base64: true });
        } catch (error) {
          console.error(`Failed to export card ${card.id}:`, error);
        }
      }
    }
  }

  // Generate and download ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.download = `recap-cards-${new Date().toISOString().split('T')[0]}.zip`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

// Generate a shareable URL-safe ID
export const generateShareId = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Compress card data for URL sharing (basic implementation)
export const compressCardForUrl = (card: DailyCard): string => {
  const minimalCard = {
    t: card.text,
    m: card.mood,
    d: card.createdAt,
    b: card.blocks?.map((b) => ({ l: b.label, v: b.value })),
  };
  return btoa(encodeURIComponent(JSON.stringify(minimalCard)));
};

// Decompress card data from URL
export const decompressCardFromUrl = (
  compressed: string
): Partial<DailyCard> | null => {
  try {
    const decoded = JSON.parse(decodeURIComponent(atob(compressed)));
    return {
      text: decoded.t,
      mood: decoded.m,
      createdAt: decoded.d,
      blocks: decoded.b?.map(
        (b: { l: string; v: string | number }, i: number) => ({
          id: `shared-${i}`,
          type: 'text',
          blockId: 'custom',
          label: b.l,
          value: b.v,
          order: i,
        })
      ),
    };
  } catch {
    return null;
  }
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const isSameDay = (date1: string, date2: string): boolean => {
  return new Date(date1).toDateString() === new Date(date2).toDateString();
};

export const isToday = (dateString: string): boolean => {
  return isSameDay(dateString, new Date().toISOString());
};
