import { useEffect, useRef, useState } from 'react';
import type { Theme } from './themes';

const LIGHT_THEME: Theme = 'editorialRedLight';
const DARK_THEME: Theme = 'editorialRedDark';
const THEME_STORAGE_KEY = 'editorial-theme-preference';

type EditorialThemeState = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === LIGHT_THEME || stored === DARK_THEME) {
      return stored as Theme;
    }
  } catch {
    // localStorage may be unavailable
  }
  return null;
}

function setStoredTheme(theme: Theme): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage may be unavailable
  }
}

export function useEditorialTheme(): EditorialThemeState {
  const [theme, setTheme] = useState<Theme>(LIGHT_THEME);
  const [isManual, setIsManual] = useState(false);
  const isManualRef = useRef(isManual);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    isManualRef.current = isManual;
  }, [isManual]);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (typeof window === 'undefined' || isInitializedRef.current) {
      return;
    }

    const storedTheme = getStoredTheme();
    if (storedTheme) {
      setTheme(storedTheme);
      setIsManual(true);
      isManualRef.current = true;
      isInitializedRef.current = true;
      return;
    }

    if (!window.matchMedia) {
      isInitializedRef.current = true;
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? DARK_THEME : LIGHT_THEME);
    setIsManual(false);
    isManualRef.current = false;
    isInitializedRef.current = true;
  }, []);

  // Sync theme class on HTML element
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const lightClass = 'theme-editorial-red-light';
    const darkClass = 'theme-editorial-red-dark';

    // Remove both classes first
    document.documentElement.classList.remove(lightClass, darkClass);

    // Add the current theme class
    const themeClass = theme === DARK_THEME ? darkClass : lightClass;
    document.documentElement.classList.add(themeClass);
  }, [theme]);

  // Listen to system preference changes (only if not manually set)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      if (!isManualRef.current) {
        const newTheme = event.matches ? DARK_THEME : LIGHT_THEME;
        setTheme(newTheme);
        setStoredTheme(newTheme);
      }
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const newTheme = current === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
      setStoredTheme(newTheme);
      return newTheme;
    });
    setIsManual(true);
    isManualRef.current = true;
  };

  return {
    theme,
    isDark: theme === DARK_THEME,
    toggleTheme,
  };
}
