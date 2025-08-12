import { ColorPalette } from '../types';

export const extractColorsFromImage = async (imageUrl: string): Promise<ColorPalette | null> => {
  try {
    // Simplified color extraction - in a real app you'd use react-native-image-colors
    // For now, return some default colors based on the image URL
    const colors: ColorPalette = {
      dominant: '#6200ea',
      vibrant: '#03dac6',
      darkVibrant: '#3700b3',
      lightVibrant: '#bb86fc',
      darkMuted: '#121212',
      lightMuted: '#f5f5f5',
      muted: '#757575',
      platform: 'android',
    };

    return colors;
  } catch (error) {
    console.error('Failed to extract colors from image:', error);
    return null;
  }
};

export const getGradientColors = (colors: ColorPalette | null): [string, string] => {
  if (!colors) {
    return ['#6200ea', '#03dac6']; // Material 3 default gradient
  }

  const primary = colors.vibrant || colors.dominant || '#6200ea';
  const secondary = colors.darkVibrant || colors.darkMuted || '#03dac6';

  return [primary, secondary];
};

export const getTextColor = (backgroundColor: string): string => {
  // Simple luminance calculation to determine text color
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const adjustColorOpacity = (color: string, opacity: number): string => {
  const hex = color.replace('#', '');
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `#${hex}${alpha}`;
};
