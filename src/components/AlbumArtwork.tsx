import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { Track, ColorPalette } from '../types';
import { getArtworkSize } from '../utils/responsive';
import { usePlayer } from '../context/PlayerContext';

interface AlbumArtworkProps {
  track: Track | null;
  isTablet: boolean;
  colors: ColorPalette | null;
}

const AlbumArtwork: React.FC<AlbumArtworkProps> = ({ track, isTablet, colors }) => {
  const { state } = usePlayer();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  const artworkSize = getArtworkSize(isTablet);

  useEffect(() => {
    // Animate when track changes
    if (track) {
      // Scale and fade out
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Scale and fade back in
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 150,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [track?.id]);

  useEffect(() => {
    // Subtle rotation when playing
    if (state.isPlaying) {
      const rotateAnimation = () => {
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        }).start(() => {
          rotationAnim.setValue(0);
          if (state.isPlaying) {
            rotateAnimation();
          }
        });
      };
      rotateAnimation();
    } else {
      Animated.timing(rotationAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [state.isPlaying]);

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!track) {
    return (
      <View style={[styles.container, { width: artworkSize, height: artworkSize }]}>
        <View style={[styles.placeholder, { width: artworkSize, height: artworkSize }]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: artworkSize, height: artworkSize }]}>
      <View style={styles.shadowContainer}>
        <Animated.View 
          style={{
            transform: [
              { scale: scaleAnim },
              { rotate: rotation },
            ],
            opacity: opacityAnim,
          }}
        >
          {track.artwork ? (
            <Image
              source={{ uri: track.artwork }}
              style={[styles.artwork, { width: artworkSize, height: artworkSize }]}
              resizeMode="cover"
            />
          ) : (
            <View 
              style={[
                styles.placeholder, 
                { 
                  width: artworkSize, 
                  height: artworkSize,
                  backgroundColor: colors?.muted || '#333333',
                }
              ]} 
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  shadowContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  artwork: {
    borderRadius: 16,
  },
  placeholder: {
    borderRadius: 16,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AlbumArtwork;
