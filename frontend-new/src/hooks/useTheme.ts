import { useState, useEffect } from 'react';

const THEME_KEY = 'ram_theme';

function applyTheme(dark: boolean) {
  const root = document.documentElement;
  if (dark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
  localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  window.dispatchEvent(new CustomEvent('themechange', {
    detail: { isDark: dark }
  }));
}

export const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem(THEME_KEY) !== 'light';
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent;
      setIsDark(custom.detail.isDark);
    };
    window.addEventListener('themechange', handler);
    return () => window.removeEventListener('themechange', handler);
  }, []);

  useEffect(() => {
    applyTheme(isDark);
  }, []);

  const toggle = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    applyTheme(newDark);
  };

  return { isDark, toggle };
};