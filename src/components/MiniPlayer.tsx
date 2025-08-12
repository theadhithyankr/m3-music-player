import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { getResponsiveFontSize } from '../utils/responsive';

interface MiniPlayerProps {
  visible: boolean;
  isTablet: boolean;
  onPress: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ visible, isTablet, onPress }) => {
  const { state, actions } = usePlayer();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const fontSize = getResponsiveFontSize(isTablet);

  useEffect(() => {
    if (visible && state.currentTrack) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, state.currentTrack]);

  useEffect(() => {
    const progress = state.duration > 0 ? (state.position / state.duration) : 0;
    Animated.timing(progressWidth, {
      toValue: progress * 100,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [state.position, state.duration]);

  const handlePlayPause = async () => {
    if (state.isPlaying) {
      await actions.pauseTrack();
    } else {
      await actions.resumeTrack();
    }
  };

  if (!state.currentTrack) return null;

  return (
    <Animated.View style={[
      styles.container,
      {
        transform: [{ translateY }],
        opacity,
      }
    ]}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar, 
            { 
              width: progressWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              })
            }
          ]} 
        />
      </View>
      
      <TouchableOpacity style={styles.content} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.trackInfo}>
          {state.currentTrack.artwork && (
            <Image
              source={{ uri: state.currentTrack.artwork }}
              style={[styles.artwork, { width: isTablet ? 50 : 40, height: isTablet ? 50 : 40 }]}
            />
          )}
          
          <View style={styles.textInfo}>
            <Text 
              style={[styles.title, { fontSize: fontSize.medium }]}
              numberOfLines={1}
            >
              {state.currentTrack.title}
            </Text>
            <Text 
              style={[styles.artist, { fontSize: fontSize.small }]}
              numberOfLines={1}
            >
              {state.currentTrack.artist}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePlayPause}
          >
            <Ionicons
              name={state.isPlaying ? 'pause' : 'play'}
              size={isTablet ? 28 : 24}
              color="#ffffff"
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={actions.skipToNext}
            disabled={state.currentIndex === state.queue.length - 1}
          >
            <Ionicons
              name="play-skip-forward"
              size={isTablet ? 28 : 24}
              color={state.currentIndex === state.queue.length - 1 ? "#666666" : "#ffffff"}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressContainer: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6200ea',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 70,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  artwork: {
    borderRadius: 6,
    marginRight: 12,
  },
  textInfo: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 2,
  },
  artist: {
    color: '#ffffff',
    opacity: 0.7,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default MiniPlayer;
