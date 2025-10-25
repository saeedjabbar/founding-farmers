import { useEffect, useRef, useState } from 'react';
import type { Theme } from './themes';

const LIGHT_THEME: Theme = 'editorialRedLight';
const DARK_THEME: Theme = 'editorialRedDark';

type EditorialThemeState = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

export function useEditorialTheme(): EditorialThemeState {
  const [theme, setTheme] = useState<Theme>(LIGHT_THEME);
  const [isManual, setIsManual] = useState(false);
  const isManualRef = useRef(isManual);

  useEffect(() => {
    isManualRef.current = isManual;
  }, [isManual]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyPreference = (matches: boolean) => {
      setTheme(matches ? DARK_THEME : LIGHT_THEME);
      setIsManual(false);
      isManualRef.current = false;
    };

    applyPreference(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      if (!isManualRef.current) {
        applyPreference(event.matches);
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
    setTheme((current) => (current === LIGHT_THEME ? DARK_THEME : LIGHT_THEME));
    setIsManual(true);
    isManualRef.current = true;
  };

  return {
    theme,
    isDark: theme === DARK_THEME,
    toggleTheme,
  };
}
