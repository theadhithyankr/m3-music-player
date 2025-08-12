import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { PlayerState, Track, ColorPalette } from '../types';
import { mockTracks, shuffleArray } from '../utils/mockData';
import { extractColorsFromImage } from '../services/colorService';
import {
  setupTrackPlayer,
  addTracksToPlayer,
  playTrack,
  pauseTrack,
  resumeTrack,
  skipToNext,
  skipToPrevious,
  seekTo,
  setRepeatMode,
  getCurrentTrack,
  getPosition,
  getDuration,
  getIsPlaying,
} from '../services/trackPlayerService';

interface PlayerContextType {
  state: PlayerState;
  actions: {
    playTrack: (index: number) => Promise<void>;
    pauseTrack: () => Promise<void>;
    resumeTrack: () => Promise<void>;
    skipToNext: () => Promise<void>;
    skipToPrevious: () => Promise<void>;
    seekTo: (position: number) => Promise<void>;
    toggleRepeat: () => Promise<void>;
    toggleShuffle: () => void;
    setQueue: (tracks: Track[]) => Promise<void>;
    updateColors: (colors: ColorPalette) => void;
  };
}

type PlayerAction =
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_CURRENT_TRACK'; payload: Track | null }
  | { type: 'SET_POSITION'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_QUEUE'; payload: Track[] }
  | { type: 'SET_CURRENT_INDEX'; payload: number }
  | { type: 'SET_REPEAT_MODE'; payload: 'off' | 'track' | 'queue' }
  | { type: 'SET_SHUFFLE_MODE'; payload: boolean }
  | { type: 'SET_COLORS'; payload: ColorPalette | null };

const initialState: PlayerState = {
  isPlaying: false,
  currentTrack: null,
  position: 0,
  duration: 0,
  queue: [],
  currentIndex: 0,
  repeatMode: 'off',
  shuffleMode: false,
  colors: null,
};

const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_CURRENT_TRACK':
      return { ...state, currentTrack: action.payload };
    case 'SET_POSITION':
      return { ...state, position: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_QUEUE':
      return { ...state, queue: action.payload };
    case 'SET_CURRENT_INDEX':
      return { ...state, currentIndex: action.payload };
    case 'SET_REPEAT_MODE':
      return { ...state, repeatMode: action.payload };
    case 'SET_SHUFFLE_MODE':
      return { ...state, shuffleMode: action.payload };
    case 'SET_COLORS':
      return { ...state, colors: action.payload };
    default:
      return state;
  }
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  // Update position and duration periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      if (state.isPlaying) {
        const position = await getPosition();
        const duration = await getDuration();
        dispatch({ type: 'SET_POSITION', payload: position });
        dispatch({ type: 'SET_DURATION', payload: duration });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isPlaying]);

  useEffect(() => {
    const initializePlayer = async () => {
      const success = await setupTrackPlayer();
      if (success) {
        await setQueueAction(mockTracks);
      }
    };

    initializePlayer();
  }, []);

  const playTrackAction = async (index: number) => {
    if (index >= 0 && index < state.queue.length) {
      const success = await playTrack(index);
      if (success) {
        dispatch({ type: 'SET_CURRENT_INDEX', payload: index });
        dispatch({ type: 'SET_CURRENT_TRACK', payload: state.queue[index] });
        dispatch({ type: 'SET_PLAYING', payload: true });
        
        // Extract colors from new track
        if (state.queue[index].artwork) {
          extractColorsFromImage(state.queue[index].artwork!)
            .then(colors => {
              if (colors) {
                dispatch({ type: 'SET_COLORS', payload: colors });
              }
            })
            .catch(console.error);
        }
      }
    }
  };

  const pauseTrackAction = async () => {
    const success = await pauseTrack();
    if (success) {
      dispatch({ type: 'SET_PLAYING', payload: false });
    }
  };

  const resumeTrackAction = async () => {
    const success = await resumeTrack();
    if (success) {
      dispatch({ type: 'SET_PLAYING', payload: true });
    }
  };

  const skipToNextAction = async () => {
    const success = await skipToNext();
    if (success && state.currentIndex < state.queue.length - 1) {
      const nextIndex = state.currentIndex + 1;
      dispatch({ type: 'SET_CURRENT_INDEX', payload: nextIndex });
      dispatch({ type: 'SET_CURRENT_TRACK', payload: state.queue[nextIndex] });
    }
  };

  const skipToPreviousAction = async () => {
    const success = await skipToPrevious();
    if (success && state.currentIndex > 0) {
      const prevIndex = state.currentIndex - 1;
      dispatch({ type: 'SET_CURRENT_INDEX', payload: prevIndex });
      dispatch({ type: 'SET_CURRENT_TRACK', payload: state.queue[prevIndex] });
    }
  };

  const seekToAction = async (position: number) => {
    const success = await seekTo(position);
    if (success) {
      dispatch({ type: 'SET_POSITION', payload: position });
    }
  };

  const toggleRepeat = async () => {
    const modes: ('off' | 'track' | 'queue')[] = ['off', 'track', 'queue'];
    const currentIndex = modes.indexOf(state.repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    
    const success = await setRepeatMode(nextMode);
    if (success) {
      dispatch({ type: 'SET_REPEAT_MODE', payload: nextMode });
    }
  };

  const toggleShuffle = () => {
    const newShuffleMode = !state.shuffleMode;
    dispatch({ type: 'SET_SHUFFLE_MODE', payload: newShuffleMode });
    
    if (newShuffleMode) {
      const shuffledQueue = shuffleArray(state.queue);
      setQueueAction(shuffledQueue);
    } else {
      // Restore original order (you might want to store original order)
      setQueueAction(mockTracks);
    }
  };

  const setQueueAction = async (tracks: Track[]) => {
    const success = await addTracksToPlayer(tracks);
    if (success) {
      dispatch({ type: 'SET_QUEUE', payload: tracks });
      if (tracks.length > 0) {
        dispatch({ type: 'SET_CURRENT_TRACK', payload: tracks[0] });
        dispatch({ type: 'SET_CURRENT_INDEX', payload: 0 });
      }
    }
  };

  const updateColors = (colors: ColorPalette) => {
    dispatch({ type: 'SET_COLORS', payload: colors });
  };

  const contextValue: PlayerContextType = {
    state,
    actions: {
      playTrack: playTrackAction,
      pauseTrack: pauseTrackAction,
      resumeTrack: resumeTrackAction,
      skipToNext: skipToNextAction,
      skipToPrevious: skipToPreviousAction,
      seekTo: seekToAction,
      toggleRepeat,
      toggleShuffle,
      setQueue: setQueueAction,
      updateColors,
    },
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
