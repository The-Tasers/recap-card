import { toPng } from 'html-to-image';

export const exportCardImage = async (
  element: HTMLElement
): Promise<string> => {
  const dataUrl = await toPng(element, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
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
    const file = new File([blob], `${title}.png`, { type: 'image/png' });

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
