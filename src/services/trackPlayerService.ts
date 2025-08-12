import { Track } from '../types';
import { Audio } from 'expo-av';

// Audio state management
let sound: Audio.Sound | null = null;
let currentTrackIndex = 0;
let tracks: Track[] = [];
let isPlaying = false;
let position = 0;
let duration = 0;
let repeatMode: 'off' | 'track' | 'queue' = 'off';
let isShuffleOn = false;

// Event listeners for track changes and playback state
type EventCallback = (data: any) => void;
const eventCallbacks: { [key: string]: EventCallback[] } = {};

export const addEventListener = (event: string, callback: EventCallback) => {
  if (!eventCallbacks[event]) {
    eventCallbacks[event] = [];
  }
  eventCallbacks[event].push(callback);
};

export const removeEventListener = (event: string, callback: EventCallback) => {
  if (eventCallbacks[event]) {
    eventCallbacks[event] = eventCallbacks[event].filter(cb => cb !== callback);
  }
};

const emitEvent = (event: string, data: any) => {
  if (eventCallbacks[event]) {
    eventCallbacks[event].forEach(callback => callback(data));
  }
};

export const setupTrackPlayer = async () => {
  try {
    // Set audio mode for playback
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    return true;
  } catch (error) {
    console.error('Failed to setup audio:', error);
    return false;
  }
};

const unloadCurrentSound = async () => {
  if (sound) {
    try {
      await sound.unloadAsync();
      sound = null;
    } catch (error) {
      console.error('Error unloading sound:', error);
    }
  }
};

export const addTracksToPlayer = async (newTracks: Track[]) => {
  try {
    tracks = newTracks;
    currentTrackIndex = 0;
    return true;
  } catch (error) {
    console.error('Failed to add tracks:', error);
    return false;
  }
};

export const playTrack = async (index: number) => {
  try {
    if (index >= 0 && index < tracks.length) {
      // Unload previous sound
      await unloadCurrentSound();
      
      currentTrackIndex = index;
      const track = tracks[index];
      
      // Create and load new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.url },
        { 
          shouldPlay: true,
          progressUpdateIntervalMillis: 1000, // Update every second
        }
      );
      
      sound = newSound;
      
      // Set up playback status update listener
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          position = status.positionMillis / 1000; // Convert to seconds
          duration = (status.durationMillis || 0) / 1000;
          isPlaying = status.isPlaying;
          
          emitEvent('PlaybackPositionChanged', { position, duration });
          
          // Handle track completion
          if (status.didJustFinish) {
            handleTrackEnd();
          }
        } else if (status.error) {
          console.error('Playback error:', status.error);
          emitEvent('PlaybackError', { error: status.error });
        }
      });
      
      isPlaying = true;
      emitEvent('PlaybackTrackChanged', { track });
      emitEvent('PlaybackState', { state: 'playing' });
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to play track:', error);
    emitEvent('PlaybackError', { error: error instanceof Error ? error.message : 'Unknown playback error' });
    return false;
  }
};

const handleTrackEnd = async () => {
  if (repeatMode === 'track') {
    // Repeat current track
    await playTrack(currentTrackIndex);
  } else if (repeatMode === 'queue') {
    // Go to next track, or start from beginning if at end
    const nextIndex = currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0;
    await playTrack(nextIndex);
  } else {
    // Normal mode - go to next track if available
    if (currentTrackIndex < tracks.length - 1) {
      await skipToNext();
    } else {
      // End of queue
      isPlaying = false;
      emitEvent('PlaybackState', { state: 'stopped' });
    }
  }
};

export const pauseTrack = async () => {
  try {
    if (sound) {
      await sound.pauseAsync();
      isPlaying = false;
      emitEvent('PlaybackState', { state: 'paused' });
    }
    return true;
  } catch (error) {
    console.error('Failed to pause track:', error);
    return false;
  }
};

export const resumeTrack = async () => {
  try {
    if (sound) {
      await sound.playAsync();
      isPlaying = true;
      emitEvent('PlaybackState', { state: 'playing' });
    }
    return true;
  } catch (error) {
    console.error('Failed to resume track:', error);
    return false;
  }
};

export const skipToNext = async () => {
  try {
    let nextIndex;
    
    if (isShuffleOn) {
      // Random next track
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0;
    }
    
    await playTrack(nextIndex);
    return true;
  } catch (error) {
    console.error('Failed to skip to next track:', error);
    return false;
  }
};

export const skipToPrevious = async () => {
  try {
    let prevIndex;
    
    if (isShuffleOn) {
      // Random previous track
      prevIndex = Math.floor(Math.random() * tracks.length);
    } else {
      prevIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
    }
    
    await playTrack(prevIndex);
    return true;
  } catch (error) {
    console.error('Failed to skip to previous track:', error);
    return false;
  }
};

export const seekTo = async (positionSeconds: number) => {
  try {
    if (sound) {
      const positionMillis = positionSeconds * 1000;
      await sound.setPositionAsync(positionMillis);
      position = positionSeconds;
      emitEvent('PlaybackPositionChanged', { position, duration });
    }
    return true;
  } catch (error) {
    console.error('Failed to seek:', error);
    return false;
  }
};

export const setRepeatMode = async (mode: 'off' | 'track' | 'queue') => {
  try {
    repeatMode = mode;
    emitEvent('RepeatModeChanged', { mode });
    return true;
  } catch (error) {
    console.error('Failed to set repeat mode:', error);
    return false;
  }
};

export const setShuffle = async (shuffle: boolean) => {
  try {
    isShuffleOn = shuffle;
    emitEvent('ShuffleModeChanged', { shuffle });
    return true;
  } catch (error) {
    console.error('Failed to set shuffle mode:', error);
    return false;
  }
};

export const getCurrentTrack = () => {
  return tracks[currentTrackIndex] || null;
};

export const getPosition = async () => {
  if (sound) {
    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        return (status.positionMillis || 0) / 1000;
      }
    } catch (error) {
      console.error('Error getting position:', error);
    }
  }
  return position;
};

export const getDuration = async () => {
  if (sound) {
    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        return status.durationMillis / 1000;
      }
    } catch (error) {
      console.error('Error getting duration:', error);
    }
  }
  return duration;
};

export const getIsPlaying = () => {
  return isPlaying;
};

export const getRepeatMode = () => {
  return repeatMode;
};

export const getIsShuffleOn = () => {
  return isShuffleOn;
};

// Clean up when app closes
export const cleanup = async () => {
  await unloadCurrentSound();
};
