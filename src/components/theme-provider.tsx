'use client';

import { useEffect } from 'react';
import { useCardStore } from '@/lib/store';
import { ColorTheme, COLOR_THEMES } from '@/lib/types';

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Utility function to apply color theme
export function applyColorTheme(theme: ColorTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-color-theme', theme);

  // Handle dark/light mode based on theme
  const themeConfig = COLOR_THEMES.find((t) => t.value === theme);
  if (themeConfig?.isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { hydrated, colorTheme } = useCardStore();

  useEffect(() => {
    if (!hydrated) return;

    // Apply color theme
    applyColorTheme(colorTheme);
  }, [hydrated, colorTheme]);

  return <>{children}</>;
}
