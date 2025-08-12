import { Dimensions } from 'react-native';
import { DeviceInfo } from '../types';

export const getDeviceInfo = (): DeviceInfo => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;
  
  // Consider devices with aspect ratio < 1.6 as tablets
  const isTablet = aspectRatio < 1.6 && Math.min(width, height) > 600;
  
  return {
    isTablet,
    screenWidth: width,
    screenHeight: height,
    orientation: width > height ? 'landscape' : 'portrait',
  };
};

export const getResponsiveValue = (
  phoneValue: number,
  tabletValue: number,
  isTablet: boolean
): number => {
  return isTablet ? tabletValue : phoneValue;
};

export const getResponsiveMargin = (isTablet: boolean) => ({
  small: isTablet ? 12 : 8,
  medium: isTablet ? 24 : 16,
  large: isTablet ? 36 : 24,
  xlarge: isTablet ? 48 : 32,
});

export const getResponsiveFontSize = (isTablet: boolean) => ({
  small: isTablet ? 14 : 12,
  medium: isTablet ? 18 : 16,
  large: isTablet ? 24 : 20,
  xlarge: isTablet ? 32 : 28,
  xxlarge: isTablet ? 48 : 40,
});

export const getArtworkSize = (isTablet: boolean): number => {
  const { screenWidth } = getDeviceInfo();
  const baseSize = Math.min(screenWidth * 0.8, 400);
  return isTablet ? Math.min(baseSize * 1.2, 500) : baseSize;
};
