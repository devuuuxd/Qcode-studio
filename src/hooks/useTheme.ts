import { useState, useEffect, useCallback } from 'react';
import type { ThemeMode } from '../types/qr';
import { loadTheme, saveTheme } from '../utils/storage';

export interface UseThemeReturn {
  theme: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  cycleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<ThemeMode>(() => loadTheme());
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const effectiveTheme = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }, [effectiveTheme]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    saveTheme(mode);
  }, []);

  const cycleTheme = useCallback(() => {
    const next: ThemeMode = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
  }, [theme, setTheme]);

  return {
    theme,
    effectiveTheme,
    cycleTheme,
    setTheme,
  };
}
