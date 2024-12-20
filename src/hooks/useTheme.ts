import { useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Theme } from '../types/finance';

export function useTheme() {
  const { userProfile } = useFinanceStore();
  const theme = userProfile?.theme || 'system';

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (theme === 'system') {
      // Watch system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Apply user selected theme
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  return theme;
}
