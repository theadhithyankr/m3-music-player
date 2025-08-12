import React, { ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { ColorPalette } from '../types';

interface ThemeProviderProps {
  children: ReactNode;
  colors: ColorPalette | null;
}

interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
  };
}

const createDynamicTheme = (colors: ColorPalette | null, isDark: boolean): Theme => {
  const primary = colors?.vibrant || colors?.dominant || '#6200ea';
  const secondary = colors?.darkVibrant || colors?.darkMuted || '#03dac6';
  
  return {
    colors: {
      primary,
      secondary,
      background: isDark ? '#000000' : '#ffffff',
      surface: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
      text: isDark ? '#ffffff' : '#000000',
    },
  };
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, colors }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark' || true; // Force dark theme for now
  
  const theme = createDynamicTheme(colors, isDark);

  // For now, just pass through children since we're not using a theme library
  return <>{children}</>;
};

export default ThemeProvider;
