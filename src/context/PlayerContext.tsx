import { createContext, useContext, type ReactNode } from 'react';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';

type PlayerContextValue = ReturnType<typeof useYouTubePlayer>;

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const player = useYouTubePlayer();
  return <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
