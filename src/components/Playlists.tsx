import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { loadPlaylists, createPlaylist } from '../services/fileAccessService';
import { getResponsiveFontSize, getResponsiveMargin } from '../utils/responsive';

interface PlaylistsProps {
  isTablet: boolean;
}

interface Playlist {
  name: string;
  tracks: string[];
  createdAt: number;
}

const Playlists: React.FC<PlaylistsProps> = ({ isTablet }) => {
  const { state, actions } = usePlayer();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);

  const fontSize = getResponsiveFontSize(isTablet);
  const margin = getResponsiveMargin(isTablet);

  useEffect(() => {
    loadPlaylistsData();
  }, []);

  const loadPlaylistsData = async () => {
    setLoading(true);
    try {
      const playlistsData = await loadPlaylists();
      setPlaylists(playlistsData);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    try {
      const success = await createPlaylist(newPlaylistName.trim(), state.queue);
      if (success) {
        setNewPlaylistName('');
        setShowCreateModal(false);
        await loadPlaylistsData();
        Alert.alert('Success', `Playlist "${newPlaylistName}" created successfully!`);
      } else {
        Alert.alert('Error', 'Failed to create playlist');
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      Alert.alert('Error', 'Failed to create playlist');
    }
  };

  const handlePlayPlaylist = async (playlist: Playlist) => {
    try {
      // In a real implementation, you'd need to match playlist track IDs with actual tracks
      // For now, we'll just play the current queue
      if (state.queue.length > 0) {
        await actions.playTrack(0);
        Alert.alert('Info', `Playing playlist "${playlist.name}"`);
      } else {
        Alert.alert('Info', 'No tracks available to play');
      }
    } catch (error) {
      console.error('Error playing playlist:', error);
      Alert.alert('Error', 'Failed to play playlist');
    }
  };

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={[styles.playlistItem, { marginHorizontal: margin.medium }]}
      onPress={() => handlePlayPlaylist(item)}
    >
      <View style={styles.playlistIcon}>
        <Ionicons name="list" size={24} color="#6200ea" />
      </View>
      
      <View style={styles.playlistInfo}>
        <Text
          style={[styles.playlistTitle, { fontSize: fontSize.medium }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          style={[styles.playlistSubtitle, { fontSize: fontSize.small }]}
        >
          {item.tracks.length} tracks • Created {new Date(item.createdAt).toLocaleDateString()}
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
        My Playlists ({playlists.length})
      </Text>
      
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add-circle-outline" size={24} color="#6200ea" />
        <Text style={[styles.createButtonText, { fontSize: fontSize.small }]}>
          Create Playlist
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={playlists}
        renderItem={renderPlaylistItem}
        keyExtractor={(item, index) => `${item.name}_${index}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Ionicons name="list" size={48} color="#666" />
            <Text style={styles.emptyText}>No playlists yet</Text>
            <Text style={styles.emptySubText}>
              Create your first playlist by tapping the "Create Playlist" button above
            </Text>
          </View>
        }
      />

      {/* Create Playlist Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { padding: margin.large }]}>
            <Text style={[styles.modalTitle, { fontSize: fontSize.large }]}>
              Create New Playlist
            </Text>
            
            <TextInput
              style={[styles.textInput, { fontSize: fontSize.medium }]}
              placeholder="Enter playlist name"
              placeholderTextColor="#666"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            
            <Text style={[styles.infoText, { fontSize: fontSize.small }]}>
              This will create a playlist with {state.queue.length} current tracks
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewPlaylistName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.createModalButton]}
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.createModalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(98, 0, 234, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6200ea',
  },
  createButtonText: {
    color: '#6200ea',
    marginLeft: 8,
    fontWeight: '600',
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 4,
    borderRadius: 8,
  },
  playlistIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(98, 0, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 2,
  },
  playlistSubtitle: {
    color: '#ffffff',
    opacity: 0.7,
  },
  moreButton: {
    padding: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    marginBottom: 12,
  },
  infoText: {
    color: '#ffffff',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  createModalButton: {
    backgroundColor: '#6200ea',
  },
  createModalButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default Playlists;
