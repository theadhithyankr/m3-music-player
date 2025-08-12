export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  artwork?: string;
  url: string;
  filename?: string;
}

export interface ColorPalette {
  dominant?: string;
  vibrant?: string;
  darkVibrant?: string;
  lightVibrant?: string;
  darkMuted?: string;
  lightMuted?: string;
  muted?: string;
  platform: 'android' | 'ios' | 'web';
}

export interface PlayerState {
  isPlaying: boolean;
  currentTrack: Track | null;
  position: number;
  duration: number;
  queue: Track[];
  currentIndex: number;
  repeatMode: 'off' | 'track' | 'queue';
  shuffleMode: boolean;
  colors: ColorPalette | null;
}

export interface DeviceInfo {
  isTablet: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}
