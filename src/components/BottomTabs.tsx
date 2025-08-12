import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getResponsiveFontSize, getResponsiveMargin, getDeviceInfo } from '../utils/responsive';

interface BottomTabsProps {
  activeTab: 'player' | 'library' | 'playlists';
  onTabChange: (tab: 'player' | 'library' | 'playlists') => void;
}

const BottomTabs: React.FC<BottomTabsProps> = ({ activeTab, onTabChange }) => {
  const deviceInfo = getDeviceInfo();
  const fontSize = getResponsiveFontSize(deviceInfo.isTablet);
  const margin = getResponsiveMargin(deviceInfo.isTablet);

  const tabs = [
    {
      id: 'player' as const,
      label: 'Player',
      icon: 'play-circle-outline',
      activeIcon: 'play-circle',
    },
    {
      id: 'library' as const,
      label: 'Library',
      icon: 'library-outline',
      activeIcon: 'library',
    },
    {
      id: 'playlists' as const,
      label: 'Playlists',
      icon: 'list-outline',
      activeIcon: 'list',
    },
  ];

  const TabButton = ({ tab }: { tab: typeof tabs[0] }) => {
    const isActive = activeTab === tab.id;
    
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={() => onTabChange(tab.id)}
      >
        <Ionicons
          name={isActive ? tab.activeIcon as any : tab.icon as any}
          size={deviceInfo.isTablet ? 28 : 24}
          color={isActive ? '#6200ea' : '#ffffff'}
        />
        <Text
          style={[
            styles.tabLabel,
            { fontSize: fontSize.small },
            isActive && styles.activeTabLabel,
          ]}
        >
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: margin.medium }]}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TabButton key={tab.id} tab={tab} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTabButton: {
    // Add any active tab styling here
  },
  tabLabel: {
    color: '#ffffff',
    marginTop: 4,
    opacity: 0.7,
  },
  activeTabLabel: {
    color: '#6200ea',
    opacity: 1,
    fontWeight: '600',
  },
});

export default BottomTabs;
