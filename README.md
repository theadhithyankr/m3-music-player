# M3 Music Player

A modern React Native music player built with Expo, featuring Material 3 design principles and responsive UI.

## Features

### Current Implementation
- ✅ Material 3 design language
- ✅ Dynamic gradient backgrounds
- ✅ Responsive design for tablets and phones
- ✅ Play/pause/skip controls
- ✅ Progress bar with seeking
- ✅ Album artwork display with animations
- ✅ Mock track data for testing
- ✅ Repeat and shuffle modes
- ✅ Clean component architecture

### Planned Enhancements (Ready to implement)
- 🔄 Real-time color palette extraction from album artwork (react-native-image-colors)
- 🔄 Background audio and lock-screen controls (react-native-track-player or expo-av)
- 🔄 Mini-player view for scrollable queue
- 🔄 Track queue management
- 🔄 Advanced Material 3 theming with dynamic colors
- 🔄 Gesture-based controls

## Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── AlbumArtwork.tsx    # Animated album art display
│   ├── PlayerControls.tsx  # Main playback controls
│   ├── ProgressBar.tsx     # Seek bar with time display
│   ├── TrackQueue.tsx      # Queue management (placeholder)
│   └── MiniPlayer.tsx      # Mini player overlay (placeholder)
├── context/             # React Context for state management
│   └── PlayerContext.tsx   # Global player state
├── screens/             # Screen components
│   └── PlayerScreen.tsx    # Main player interface
├── services/            # Business logic and external integrations
│   ├── colorService.ts     # Color extraction utilities
│   └── trackPlayerService.ts # Audio playback (mock implementation)
├── types/               # TypeScript definitions
│   └── index.ts            # App-wide type definitions
└── utils/               # Helper functions
    ├── mockData.ts         # Test data and formatters
    └── responsive.ts       # Responsive design utilities
```

### Key Components

#### PlayerContext
Central state management using React Context and useReducer:
- Manages playback state, current track, queue, and UI settings
- Handles color extraction and dynamic theming
- Provides actions for all player operations

#### Responsive Design
- Automatic tablet/phone detection
- Dynamic sizing for artwork, fonts, and spacing
- Tablet-optimized layouts with larger controls

#### Material 3 Design
- Dynamic color schemes based on album artwork
- Smooth gradient backgrounds that adapt to content
- Modern UI components with proper elevation and shadows

## Getting Started

### Prerequisites
- Node.js 16+
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation
```bash
# Clone the repository
git clone [your-repo-url]
cd m3-music-player-new

# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Device/Emulator
```bash
# iOS
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

## Next Steps for Full Implementation

### 1. Add Real Audio Playback
```bash
# Install audio packages
expo install expo-av expo-media-library

# Or for advanced features
npm install react-native-track-player
```

### 2. Enable Color Extraction
```bash
npm install react-native-image-colors
```

### 3. Add Gesture Support and Animations
```bash
expo install react-native-reanimated react-native-gesture-handler
```

### 4. Material 3 Theming
```bash
npm install react-native-paper
```

### Code Organization Principles

#### Clean Architecture
- **Separation of Concerns**: UI components, business logic, and data management are clearly separated
- **Component Composition**: Small, focused components that can be easily tested and reused
- **Dependency Injection**: Services are injected through context, making testing easier

#### State Management
- **Centralized State**: All player state is managed in PlayerContext
- **Immutable Updates**: Using useReducer for predictable state changes
- **Action-Based**: All state changes go through well-defined actions

#### Responsive Design
- **Mobile-First**: Designed for phones, enhanced for tablets
- **Flexible Layouts**: Components adapt to screen size and orientation
- **Consistent Spacing**: Responsive margin/padding system

## Mock Implementation Details

The current implementation uses mock services to demonstrate the UI and architecture without requiring complex audio libraries. This allows for:

1. **Quick Development**: Test UI interactions without audio setup complexity
2. **Cross-Platform Compatibility**: Works on web, iOS, and Android immediately
3. **Easy Enhancement**: Real services can be swapped in without changing the UI code

## Contributing

When adding new features:

1. Follow the established component structure
2. Add TypeScript types for new interfaces
3. Use the responsive utilities for consistent sizing
4. Update the PlayerContext for any new state requirements
5. Maintain separation between UI and business logic

## Performance Considerations

- Image caching for album artwork
- Efficient re-renders using React.memo where appropriate
- Lazy loading for large track lists
- Background task management for audio playback

## License

MIT License - Feel free to use this as a foundation for your own music player projects!
