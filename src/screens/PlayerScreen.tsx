import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import AlbumArtwork from '../components/AlbumArtwork';
import PlayerControls from '../components/PlayerControls';
import ProgressBar from '../components/ProgressBar';
import { usePlayer } from '../context/PlayerContext';
import { getDeviceInfo } from '../utils/responsive';
import { getGradientColors } from '../services/colorService';
import { extractColorsFromImage } from '../services/colorService';

const PlayerScreen: React.FC = () => {
  const { state, actions } = usePlayer();
  const [isScrolled, setIsScrolled] = useState(false);
  const deviceInfo = getDeviceInfo();

  const gradientColors = getGradientColors(state.colors);

  // Update colors when track changes
  useEffect(() => {
    if (state.currentTrack?.artwork) {
      extractColorsFromImage(state.currentTrack.artwork)
        .then((colors) => {
          if (colors) {
            actions.updateColors(colors);
          }
        })
        .catch(console.error);
    }
  }, [state.currentTrack?.id]);

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const newIsScrolled = scrollY > 100;
    setIsScrolled(newIsScrolled);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={[gradientColors[0], gradientColors[1], '#000000']}
        style={styles.gradient}
        locations={[0, 0.6, 1]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            deviceInfo.isTablet && styles.tabletScrollContent,
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Album Artwork */}
          <View style={[styles.artworkSection, deviceInfo.isTablet && styles.tabletArtworkSection]}>
            <AlbumArtwork
              track={state.currentTrack}
              isTablet={deviceInfo.isTablet}
              colors={state.colors}
            />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <ProgressBar isTablet={deviceInfo.isTablet} />
          </View>

          {/* Player Controls */}
          <View style={styles.controlsSection}>
            <PlayerControls
              track={state.currentTrack}
              isTablet={deviceInfo.isTablet}
            />
          </View>

          {/* Additional Content for Scrolling */}
          <View style={styles.additionalContent}>
            <View style={{ height: 200 }} />
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  tabletScrollContent: {
    paddingHorizontal: 60,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  artworkSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  tabletArtworkSection: {
    paddingTop: 60,
  },
  progressSection: {
    paddingVertical: 20,
  },
  controlsSection: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  additionalContent: {
    // Empty space for scrolling
  },
});

export default PlayerScreen;
