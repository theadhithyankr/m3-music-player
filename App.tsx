import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PlayerProvider } from './src/context/PlayerContext';
import ThemeProvider from './src/components/ThemeProvider';
import PlayerScreen from './src/screens/PlayerScreen';
import FileBrowser from './src/components/FileBrowser';
import Playlists from './src/components/Playlists';
import BottomTabs from './src/components/BottomTabs';
import MiniPlayer from './src/components/MiniPlayer';
import { usePlayer } from './src/context/PlayerContext';
import { getDeviceInfo } from './src/utils/responsive';

type TabType = 'player' | 'library' | 'playlists';

const AppContent: React.FC = () => {
  const { state } = usePlayer();
  const [activeTab, setActiveTab] = useState<TabType>('player');
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const deviceInfo = getDeviceInfo();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Show mini player when not on player tab and there's a current track
    setShowMiniPlayer(tab !== 'player' && state.currentTrack !== null);
  };

  const handleMiniPlayerPress = () => {
    setActiveTab('player');
    setShowMiniPlayer(false);
  };

  const renderCurrentScreen = () => {
    switch (activeTab) {
      case 'library':
        return <FileBrowser isTablet={deviceInfo.isTablet} />;
      case 'playlists':
        return <Playlists isTablet={deviceInfo.isTablet} />;
      default:
        return <PlayerScreen />;
    }
  };

  return (
    <ThemeProvider colors={state.colors}>
      <View style={styles.container}>
        <View style={styles.content}>
          {renderCurrentScreen()}
        </View>
        
        {/* Mini Player - shown when not on player tab */}
        <MiniPlayer
          visible={showMiniPlayer}
          isTablet={deviceInfo.isTablet}
          onPress={handleMiniPlayerPress}
        />
        
        {/* Bottom Navigation */}
        <BottomTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </View>
    </ThemeProvider>
  );
};

export default function App() {
  return (
    <PlayerProvider>
      <AppContent />
      <StatusBar style="light" />
    </PlayerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
});
