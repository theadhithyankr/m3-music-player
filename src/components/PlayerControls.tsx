import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { getResponsiveFontSize, getResponsiveMargin } from '../utils/responsive';

interface PlayerControlsProps {
  track: Track | null;
  isTablet: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({ track, isTablet }) => {
  const { state, actions } = usePlayer();
  const playButtonScale = useRef(new Animated.Value(1)).current;
  const fontSize = getResponsiveFontSize(isTablet);
  const margin = getResponsiveMargin(isTablet);

  const handlePlayPause = async () => {
    Animated.sequence([
      Animated.timing(playButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(playButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (state.isPlaying) {
      await actions.pauseTrack();
    } else {
      await actions.resumeTrack();
    }
  };

  const getRepeatIcon = () => {
    switch (state.repeatMode) {
      case 'track':
        return 'repeat-outline';
      case 'queue':
        return 'repeat';
      default:
        return 'repeat-outline';
    }
  };

  const getRepeatIconColor = () => {
    return state.repeatMode !== 'off' ? '#6200ea' : '#ffffff';
  };

  const getShuffleIconColor = () => {
    return state.shuffleMode ? '#6200ea' : '#ffffff';
  };

  const IconButton = ({ icon, size, onPress, disabled = false, color = '#ffffff' }: any) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.iconButton, disabled && styles.disabledButton]}
    >
      <Ionicons name={icon} size={size} color={disabled ? '#666666' : color} />
    </TouchableOpacity>
  );

  const PlayButton = ({ icon, size, onPress }: any) => (
    <Animated.View style={{ transform: [{ scale: playButtonScale }] }}>
      <TouchableOpacity onPress={onPress} style={styles.playButton}>
        <Ionicons name={icon} size={size} color="#ffffff" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Track Info */}
      <View style={[styles.trackInfo, { marginBottom: margin.medium }]}>
        <Text style={[styles.title, { fontSize: fontSize.large }]} numberOfLines={1}>
          {track?.title || 'No track selected'}
        </Text>
        <Text style={[styles.artist, { fontSize: fontSize.medium }]} numberOfLines={1}>
          {track?.artist || 'Unknown artist'}
        </Text>
      </View>

      {/* Main Controls */}
      <View style={[styles.mainControls, { marginBottom: margin.medium }]}>
        <IconButton
          icon="play-skip-back"
          size={isTablet ? 36 : 32}
          onPress={actions.skipToPrevious}
          disabled={state.currentIndex === 0}
        />
        
        <PlayButton
          icon={state.isPlaying ? 'pause' : 'play'}
          size={isTablet ? 32 : 28}
          onPress={handlePlayPause}
        />
        
        <IconButton
          icon="play-skip-forward"
          size={isTablet ? 36 : 32}
          onPress={actions.skipToNext}
          disabled={state.currentIndex === state.queue.length - 1}
        />
      </View>

      {/* Secondary Controls */}
      <View style={styles.secondaryControls}>
        <IconButton
          icon={getRepeatIcon()}
          size={isTablet ? 28 : 24}
          onPress={actions.toggleRepeat}
          color={getRepeatIconColor()}
        />
        
        <IconButton
          icon="heart-outline"
          size={isTablet ? 28 : 24}
          onPress={() => {/* TODO: Implement favorite */}}
        />
        
        <IconButton
          icon="shuffle"
          size={isTablet ? 28 : 24}
          onPress={actions.toggleShuffle}
          color={getShuffleIconColor()}
        />
        
        <IconButton
          icon="list"
          size={isTablet ? 28 : 24}
          onPress={() => {/* TODO: Show queue */}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  trackInfo: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 4,
  },
  artist: {
    textAlign: 'center',
    color: '#ffffff',
    opacity: 0.8,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconButton: {
    padding: 12,
    borderRadius: 24,
  },
  disabledButton: {
    opacity: 0.5,
  },
  playButton: {
    backgroundColor: '#6200ea',
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    maxWidth: 300,
  },
});

export default PlayerControls;
