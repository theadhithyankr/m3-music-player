import TrackPlayer from 'react-native-track-player';

module.exports = async function() {
  TrackPlayer.addEventListener('remote-play', () => TrackPlayer.play());

  TrackPlayer.addEventListener('remote-pause', () => TrackPlayer.pause());

  TrackPlayer.addEventListener('remote-stop', () => TrackPlayer.destroy());

  TrackPlayer.addEventListener('remote-next', () => TrackPlayer.skipToNext());

  TrackPlayer.addEventListener('remote-previous', () => TrackPlayer.skipToPrevious());

  TrackPlayer.addEventListener('remote-seek', (event) => TrackPlayer.seekTo(event.position));

  TrackPlayer.addEventListener('remote-jump-forward', async (event) => {
    const position = await TrackPlayer.getPosition();
    TrackPlayer.seekTo(position + (event.interval || 10));
  });

  TrackPlayer.addEventListener('remote-jump-backward', async (event) => {
    const position = await TrackPlayer.getPosition();
    TrackPlayer.seekTo(Math.max(0, position - (event.interval || 10)));
  });
};
