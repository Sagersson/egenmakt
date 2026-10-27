import { useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2 } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { WaveVisualizer } from '@/components/WaveVisualizer';

export function MusicTab() {
  const {
    playerState,
    track,
    playlist,
    currentIndex,
    currentTime,
    volume,
    loop,
    shuffle,
    toggle,
    next,
    prev,
    setVolume,
    setLoop,
    setShuffle,
    loadTrack,
    isReady,
  } = usePlayer();

  const isPlaying = playerState === 'playing';

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const ambientGradient = useMemo(
    () => `radial-gradient(ellipse at 50% 0%, rgba(78,108,84,0.15) 0%, transparent 70%)`,
    []
  );

  return (
    <div className="space-y-5 pb-4">
      <header className="pt-1">
        <p className="text-xs uppercase tracking-widest text-sage-700">Ljudlandskap</p>
        <h1 className="mt-1 font-serif text-3xl text-sage-100">Fokusljud</h1>
        <p className="mt-2 text-sm text-sage-700">
          Lugn musik för djup fokus och sinnesro. Välj ett spår och låt det spela i bakgrunden.
        </p>
      </header>

      {/* Main player card */}
      <section
        className="card-elevated animate-slide-up relative overflow-hidden"
        style={{ background: ambientGradient }}
      >
        <div className="relative z-10 space-y-5">
          {/* Track info + visualizer */}
          <div className="flex flex-col items-center gap-3 pt-2 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-sage-700/40 bg-ink-600/60">
              <WaveVisualizer active={isPlaying} bars={5} className="scale-125" />
            </div>
            <div>
              <h2 className="font-serif text-xl text-sage-100">{track.title}</h2>
              <p className="mt-0.5 text-sm text-sage-600">{track.artist}</p>
            </div>
          </div>

          {/* Time indicator — ambient streams are endless */}
          <div className="flex items-center justify-center text-xs text-sage-700">
            <span>{isPlaying ? `Spelar · ${fmt(currentTime)}` : 'Pausad'}</span>
          </div>

          {/* Main controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setShuffle(!shuffle)}
              aria-label="Shuffle"
              className={`transition-all active:scale-90 ${shuffle ? 'text-sage-300' : 'text-sage-700'}`}
            >
              <Shuffle size={18} />
            </button>
            <button
              onClick={prev}
              aria-label="Föregående"
              disabled={!isReady}
              className="text-sage-200 transition-all active:scale-90 disabled:opacity-30"
            >
              <SkipBack size={24} fill="currentColor" />
            </button>
            <button
              onClick={toggle}
              aria-label={isPlaying ? 'Pausa' : 'Spela'}
              disabled={!isReady}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-500 text-ink-900 shadow-glow transition-all active:scale-90 disabled:opacity-40"
            >
              {isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" className="ml-0.5" />}
            </button>
            <button
              onClick={next}
              aria-label="Nästa"
              disabled={!isReady}
              className="text-sage-200 transition-all active:scale-90 disabled:opacity-30"
            >
              <SkipForward size={24} fill="currentColor" />
            </button>
            <button
              onClick={() => setLoop()}
              aria-label="Loopa"
              className={`transition-all active:scale-90 ${loop ? 'text-sage-300' : 'text-sage-700'}`}
            >
              <Repeat size={18} />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <Volume2 size={16} className="shrink-0 text-sage-600" />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              style={{ ['--val' as string]: `${volume}%` }}
              className="volume-slider w-full"
            />
          </div>
        </div>
      </section>

      {/* Track list */}
      <section>
        <h2 className="mb-3 px-1 text-xs font-medium uppercase tracking-widest text-sage-500">
          Spellista
        </h2>
        <div className="space-y-2">
          {playlist.map((t, i) => {
            const isCurrent = i === currentIndex;
            return (
              <button
                key={t.videoId}
                onClick={() => loadTrack(i, true)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all active:scale-[0.98] ${
                  isCurrent
                    ? 'border-sage-600/40 bg-sage-500/10'
                    : 'border-white/5 bg-ink-700/60'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                    isCurrent ? 'bg-sage-500/20 text-sage-300' : 'bg-ink-600/60 text-sage-700'
                  }`}
                >
                  {isCurrent && isPlaying ? (
                    <WaveVisualizer active bars={3} className="scale-75" />
                  ) : (
                    i + 1
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${isCurrent ? 'text-sage-200' : 'text-sage-100'}`}>
                    {t.title}
                  </p>
                  <p className="truncate text-xs text-sage-700">{t.artist}</p>
                </div>
                {isCurrent && (
                  <span className="chip border border-sage-600/30 bg-sage-500/10 text-[10px] text-sage-400">
                    {isPlaying ? 'Spelar' : 'Pausad'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
