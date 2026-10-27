// Minimal YouTube IFrame API typings (ambient global declarations)

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getVolume(): number;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  loadVideoById(videoId: string): void;
  cueVideoById(videoId: string): void;
  nextVideo(): void;
  previousVideo(): void;
  setLoop(loopPlaylists: boolean): void;
  setShuffle(shufflePlaylist: boolean): void;
  destroy(): void;
}

interface YTPlayerOptions {
  videoId?: string;
  width?: string | number;
  height?: string | number;
  playerVars?: {
    autoplay?: 0 | 1;
    controls?: 0 | 1;
    disablekb?: 0 | 1;
    fs?: 0 | 1;
    loop?: 0 | 1;
    playlist?: string;
    modestbranding?: 1;
    rel?: 0 | 1;
    showinfo?: 0 | 1;
    playsinline?: 0 | 1;
    origin?: string;
  };
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
    onStateChange?: (event: { data: number; target: YTPlayer }) => void;
    onError?: (event: { data: number }) => void;
  };
}

interface YTPlayerConstructor {
  new (elementId: string | HTMLElement, options: YTPlayerOptions): YTPlayer;
  PlayerState: {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
}

interface YTNamespace {
  Player: YTPlayerConstructor;
}

interface Window {
  YT?: YTNamespace;
  onYouTubeIframeAPIReady?: () => void;
}
