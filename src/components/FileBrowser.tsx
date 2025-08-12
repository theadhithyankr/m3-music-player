import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../types';
import { usePlayer } from '../context/PlayerContext';
import {
  requestPermissions,
  getAudioFiles,
  pickAudioFile,
  pickMultipleAudioFiles,
  searchAudioFiles,
} from '../services/fileAccessService';
import { getResponsiveFontSize, getResponsiveMargin } from '../utils/responsive';
import { formatDuration } from '../utils/mockData';

interface FileBrowserProps {
  isTablet: boolean;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ isTablet }) => {
  const { actions } = usePlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const fontSize = getResponsiveFontSize(isTablet);
  const margin = getResponsiveMargin(isTablet);

  useEffect(() => {
    checkPermissionsAndLoadFiles();
  }, []);

  const checkPermissionsAndLoadFiles = async () => {
    setLoading(true);
    try {
      const permission = await requestPermissions();
      setHasPermission(permission);
      
      if (permission) {
        const audioFiles = await getAudioFiles();
        setTracks(audioFiles);
        
        if (audioFiles.length === 0) {
          Alert.alert(
            'No Music Found',
            'No audio files were found on your device. You can use the "Pick File" button to add music files.',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'Permission Required',
          'This app needs access to your media library to play music. Please grant permission to access your audio files.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Grant Permission', onPress: checkPermissionsAndLoadFiles }
          ]
        );
      }
    } catch (error) {
      console.error('Error loading files:', error);
      Alert.alert(
        'Error', 
        'Failed to load audio files. Using sample tracks instead.',
        [{ text: 'OK' }]
      );
      // Load mock tracks as fallback
      const mockTracks = await getAudioFiles();
      setTracks(mockTracks);
      setHasPermission(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkPermissionsAndLoadFiles();
    setRefreshing(false);
  };

  const handleTrackPress = async (track: Track, index: number) => {
    try {
      await actions.setQueue(tracks);
      await actions.playTrack(index);
    } catch (error) {
      console.error('Error playing track:', error);
      Alert.alert('Error', 'Failed to play track');
    }
  };

  const handlePickFile = async () => {
    try {
      const track = await pickAudioFile();
      if (track) {
        const newTracks = [...tracks, track];
        setTracks(newTracks);
        await actions.setQueue(newTracks);
        await actions.playTrack(newTracks.length - 1);
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  const handlePickMultipleFiles = async () => {
    try {
      const newTracks = await pickMultipleAudioFiles();
      if (newTracks.length > 0) {
        const allTracks = [...tracks, ...newTracks];
        setTracks(allTracks);
        await actions.setQueue(allTracks);
        Alert.alert('Success', `Added ${newTracks.length} tracks`);
      }
    } catch (error) {
      console.error('Error picking files:', error);
      Alert.alert('Error', 'Failed to pick audio files');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      await checkPermissionsAndLoadFiles();
    } else {
      setLoading(true);
      try {
        const searchResults = await searchAudioFiles(query);
        setTracks(searchResults);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderTrackItem = ({ item, index }: { item: Track; index: number }) => (
    <TouchableOpacity
      style={[styles.trackItem, { marginHorizontal: margin.medium }]}
      onPress={() => handleTrackPress(item, index)}
    >
      <View style={styles.trackIcon}>
        <Ionicons name="musical-notes" size={24} color="#6200ea" />
      </View>
      
      <View style={styles.trackInfo}>
        <Text
          style={[styles.trackTitle, { fontSize: fontSize.medium }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.trackSubtitle, { fontSize: fontSize.small }]}
          numberOfLines={1}
        >
          {item.artist} • {item.album}
        </Text>
        <Text
          style={[styles.trackDuration, { fontSize: fontSize.small }]}
        >
          {formatDuration(item.duration)}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-vertical" size={20} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={[styles.header, { padding: margin.medium }]}>
      <Text style={[styles.headerTitle, { fontSize: fontSize.large }]}>
        Music Library ({tracks.length})
      </Text>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { marginRight: margin.small }]}
          onPress={handlePickFile}
        >
          <Ionicons name="add-circle-outline" size={24} color="#6200ea" />
          <Text style={[styles.actionButtonText, { fontSize: fontSize.small }]}>
            Pick File
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePickMultipleFiles}
        >
          <Ionicons name="folder-open-outline" size={24} color="#6200ea" />
          <Text style={[styles.actionButtonText, { fontSize: fontSize.small }]}>
            Pick Multiple
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
        <Text style={styles.loadingText}>Checking permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="musical-note" size={64} color="#6200ea" />
        <Text style={[styles.permissionTitle, { fontSize: fontSize.large }]}>
          Music Access Required
        </Text>
        <Text style={[styles.permissionText, { fontSize: fontSize.medium }]}>
          To play your music files, we need permission to access your device's media library.
        </Text>
        <Text style={[styles.permissionSubText, { fontSize: fontSize.small }]}>
          Don't worry - we only access audio files and respect your privacy.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={checkPermissionsAndLoadFiles}
        >
          <Ionicons name="checkmark-circle" size={20} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={[styles.permissionButtonText, { fontSize: fontSize.medium }]}>
            Grant Permission
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.permissionButton, styles.secondaryButton]}
          onPress={handlePickFile}
        >
          <Ionicons name="folder-open" size={20} color="#6200ea" style={{ marginRight: 8 }} />
          <Text style={[styles.secondaryButtonText, { fontSize: fontSize.medium }]}>
            Pick Files Manually
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tracks}
        renderItem={renderTrackItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6200ea']}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#6200ea" />
              <Text style={styles.loadingText}>Loading music files...</Text>
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <Ionicons name="musical-notes" size={48} color="#666" />
              <Text style={styles.emptyText}>No music files found</Text>
              <Text style={styles.emptySubText}>
                Try adding some audio files to your device or use the "Pick File" button
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(98, 0, 234, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6200ea',
  },
  actionButtonText: {
    color: '#6200ea',
    marginLeft: 8,
    fontWeight: '600',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 4,
    borderRadius: 8,
  },
  trackIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(98, 0, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 2,
  },
  trackSubtitle: {
    color: '#ffffff',
    opacity: 0.7,
    marginBottom: 2,
  },
  trackDuration: {
    color: '#ffffff',
    opacity: 0.5,
  },
  moreButton: {
    padding: 8,
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
  permissionText: {
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 16,
    opacity: 0.8,
  },
  permissionTitle: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionSubText: {
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  permissionButton: {
    backgroundColor: '#6200ea',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6200ea',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#6200ea',
    fontWeight: '600',
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    color: '#ffffff',
    opacity: 0.6,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FileBrowser;
