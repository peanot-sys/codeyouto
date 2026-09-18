import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return getSystemTheme();
  return theme;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    return saved || 'system';
  });

  const effectiveTheme = getEffectiveTheme(theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    root.setAttribute('data-theme', effectiveTheme);
    localStorage.setItem('theme', theme);
  }, [theme, effectiveTheme]);

  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const effective = getEffectiveTheme('system');
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(effective);
      document.documentElement.setAttribute('data-theme', effective);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      return getSystemTheme() === 'dark' ? 'light' : 'dark';
    });
  }, []);

  return { theme, effectiveTheme, setTheme, toggleTheme };
}
