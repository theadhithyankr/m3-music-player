import React from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../utils/mockData';
import { getResponsiveFontSize, getResponsiveMargin } from '../utils/responsive';

interface ProgressBarProps {
  isTablet: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ isTablet }) => {
  const { state, actions } = usePlayer();
  const fontSize = getResponsiveFontSize(isTablet);
  const margin = getResponsiveMargin(isTablet);
  const { width } = Dimensions.get('window');

  const sliderWidth = width - (margin.large * 2);
  const progress = state.duration > 0 ? (state.position / state.duration) : 0;
  const progressWidth = sliderWidth * progress;

  const handleSliderPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const newProgress = locationX / sliderWidth;
    const newPosition = newProgress * state.duration;
    actions.seekTo(Math.max(0, Math.min(state.duration, newPosition)));
  };

  return (
    <View style={[styles.container, { marginHorizontal: margin.large }]}>
      {/* Progress Slider */}
      <TouchableOpacity 
        style={[styles.sliderContainer, { width: sliderWidth }]}
        onPress={handleSliderPress}
        activeOpacity={0.8}
      >
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderProgress, { width: progressWidth }]} />
          <View style={[styles.sliderThumb, { left: Math.max(0, progressWidth - 10) }]} />
        </View>
      </TouchableOpacity>
      
      {/* Time Labels */}
      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, { fontSize: fontSize.small }]}>
          {formatDuration(state.position * 1000)} {/* Convert back to milliseconds for formatting */}
        </Text>
        <Text style={[styles.timeText, { fontSize: fontSize.small }]}>
          {formatDuration(state.duration * 1000)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  sliderProgress: {
    height: 4,
    backgroundColor: '#6200ea',
    borderRadius: 2,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#6200ea',
    borderRadius: 10,
    position: 'absolute',
    top: -8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: '#ffffff',
    opacity: 0.8,
    fontWeight: '500',
  },
});

export default ProgressBar;
