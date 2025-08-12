import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Track } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../utils/mockData';
import { getResponsiveFontSize, getResponsiveMargin } from '../utils/responsive';

interface TrackQueueProps {
  visible: boolean;
  isTablet: boolean;
}

const TrackQueue: React.FC<TrackQueueProps> = ({ visible, isTablet }) => {
  const { state, actions } = usePlayer();
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);
  const fontSize = getResponsiveFontSize(isTablet);
  const margin = getResponsiveMargin(isTablet);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(300, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const renderTrackItem = ({ item, index }: { item: Track; index: number }) => {
    const isCurrentTrack = state.currentIndex === index;

    const handleTrackPress = async () => {
      await actions.playTrack(index);
    };

    return (
      <TouchableOpacity onPress={handleTrackPress}>
        <Card style={[
          styles.trackCard,
          { marginHorizontal: margin.medium, marginVertical: margin.small / 2 },
          isCurrentTrack && styles.currentTrackCard
        ]}>
          <Card.Content style={styles.trackContent}>
            <View style={styles.trackInfo}>
              {item.artwork && (
                <Image
                  source={{ uri: item.artwork }}
                  style={[styles.trackArtwork, { width: isTablet ? 60 : 50, height: isTablet ? 60 : 50 }]}
                />
              )}
              <View style={styles.trackDetails}>
                <Text 
                  variant="bodyLarge" 
                  style={[
                    styles.trackTitle, 
                    { fontSize: fontSize.medium },
                    isCurrentTrack && styles.currentTrackText
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text 
                  variant="bodyMedium" 
                  style={[
                    styles.trackArtist, 
                    { fontSize: fontSize.small },
                    isCurrentTrack && styles.currentTrackSubtext
                  ]}
                  numberOfLines={1}
                >
                  {item.artist}
                </Text>
              </View>
            </View>
            
            <View style={styles.trackActions}>
              <Text style={[styles.duration, { fontSize: fontSize.small }]}>
                {formatDuration(item.duration)}
              </Text>
              {isCurrentTrack && (
                <IconButton
                  icon={state.isPlaying ? 'pause' : 'play'}
                  size={isTablet ? 24 : 20}
                  onPress={state.isPlaying ? actions.pauseTrack : actions.resumeTrack}
                />
              )}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.header, { paddingHorizontal: margin.medium }]}>
        <Text variant="headlineSmall" style={[styles.headerTitle, { fontSize: fontSize.large }]}>
          Queue ({state.queue.length})
        </Text>
      </View>
      
      <FlatList
        data={state.queue}
        renderItem={renderTrackItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        getItemLayout={(data, index) => ({
          length: isTablet ? 80 : 70,
          offset: (isTablet ? 80 : 70) * index,
          index,
        })}
        initialScrollIndex={Math.max(0, state.currentIndex - 1)}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  list: {
    flex: 1,
    paddingVertical: 10,
  },
  trackCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  currentTrackCard: {
    backgroundColor: 'rgba(98, 0, 234, 0.2)',
    borderColor: '#6200ea',
    borderWidth: 1,
  },
  trackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trackArtwork: {
    borderRadius: 8,
    marginRight: 12,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    color: '#ffffff',
    fontWeight: '600',
  },
  trackArtist: {
    color: '#ffffff',
    opacity: 0.7,
    marginTop: 2,
  },
  currentTrackText: {
    color: '#6200ea',
  },
  currentTrackSubtext: {
    color: '#6200ea',
    opacity: 0.8,
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    color: '#ffffff',
    opacity: 0.6,
    marginRight: 8,
  },
});

export default TrackQueue;
