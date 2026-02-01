import React, { createContext, useContext } from 'react';
import { colors as lightColors } from '@/theme';
import { darkColors } from '@/theme/darkColors';
import { useThemeStore } from '@/store/themeStore';

type Colors = typeof lightColors;

interface ThemeContextValue {
  colors: Colors;
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const value: ThemeContextValue = {
    colors: isDarkMode ? (darkColors as Colors) : lightColors,
    isDark: isDarkMode,
    toggle: toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
