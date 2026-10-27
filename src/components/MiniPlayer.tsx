import { Play, Pause } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { WaveVisualizer } from '@/components/WaveVisualizer';

type Props = {
  onOpenPlayer: () => void;
};

export function MiniPlayer({ onOpenPlayer }: Props) {
  const { playerState, track, toggle, isReady } = usePlayer();
  if (!isReady) return null;

  const isPlaying = playerState === 'playing';

  return (
    <div className="fixed inset-x-0 bottom-[57px] z-20 px-3 pb-1">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-sage-800/40 bg-ink-800/95 px-3 py-2.5 shadow-glow backdrop-blur-xl animate-slide-up">
        <button
          onClick={toggle}
          aria-label={isPlaying ? 'Pausa' : 'Spela'}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-500/15 text-sage-300 transition-all active:scale-90"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        <button onClick={onOpenPlayer} className="flex flex-1 items-center gap-3 overflow-hidden text-left">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sage-100">{track.title}</p>
            <p className="truncate text-xs text-sage-600">{track.artist}</p>
          </div>
          <WaveVisualizer active={isPlaying} bars={5} className="shrink-0" />
        </button>
      </div>
    </div>
  );
}
