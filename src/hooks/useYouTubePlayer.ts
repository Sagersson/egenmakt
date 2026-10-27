import { useCallback, useEffect, useRef, useState } from 'react';
import type { Track } from '@/data/playlist';
import { PLAYLIST, MUSIC_PROFILES, mtof, type MusicProfile } from '@/data/playlist';
import { useLocalStorage } from '@/hooks/useStorage';

export type PlayerState = 'idle' | 'playing' | 'paused';

type Engine = {
  ctx: AudioContext;
  masterGain: GainNode;
  reverb: ConvolverNode;
  reverbGain: GainNode;
  droneOscs: OscillatorNode[];
  droneGain: GainNode;
  droneFilter: BiquadFilterNode;
  shimmerOsc: OscillatorNode | null;
  shimmerGain: GainNode | null;
  bowlSchedulerId: number | null;
  startTime: number;
};

function createReverbBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const decay = Math.pow(1 - i / length, 3);
      data[i] = (Math.random() * 2 - 1) * decay;
    }
  }
  return buffer;
}

export function useYouTubePlayer() {
  const [isReady] = useState(true);
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [currentIndex, setCurrentIndex] = useLocalStorage('egenmakt.player.index', 0);
  const [volume, setVolumeState] = useLocalStorage('egenmakt.player.volume', 60);
  const [loop] = useState(true);
  const [shuffle, setShuffle] = useLocalStorage('egenmakt.player.shuffle', false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(0);

  const track: Track = PLAYLIST[currentIndex] ?? PLAYLIST[0];
  const profile: MusicProfile = MUSIC_PROFILES[currentIndex] ?? MUSIC_PROFILES[0];

  const engineRef = useRef<Engine | null>(null);
  const startTimeRef = useRef(0);
  const volumeRef = useRef(volume);
  const profileRef = useRef(profile);
  const indexRef = useRef(currentIndex);
  const shuffleRef = useRef(shuffle);

  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => { indexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { shuffleRef.current = shuffle; }, [shuffle]);

  // ---- Strike a singing bowl ----
  // A bowl has a strong fundamental plus a faint perfect-fifth overtone,
  // and a long exponential decay — the hallmark of a struck bowl.
  function strikeBowl(ctx: AudioContext, dest: AudioNode, freq: number, decay: number, velocity: number, time: number) {
    // Fundamental
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(velocity, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + decay + 0.5);

    // Perfect fifth overtone (3/2) — much quieter, adds the metallic ring
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 1.5;
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0, time);
    gain2.gain.linearRampToValueAtTime(velocity * 0.15, time + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.0001, time + decay * 0.7);
    osc2.connect(gain2);
    gain2.connect(dest);
    osc2.start(time);
    osc2.stop(time + decay * 0.7 + 0.3);

    // Octave overtone — very faint, adds brightness
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = freq * 2;
    const gain3 = ctx.createGain();
    gain3.gain.setValueAtTime(0, time);
    gain3.gain.linearRampToValueAtTime(velocity * 0.08, time + 0.03);
    gain3.gain.exponentialRampToValueAtTime(0.0001, time + decay * 0.5);
    osc3.connect(gain3);
    gain3.connect(dest);
    osc3.start(time);
    osc3.stop(time + decay * 0.5 + 0.2);
  }

  // ---- Build the engine for a profile ----
  function createEngine(prof: MusicProfile, vol: number): Engine {
    const ctx = new AudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);

    // Reverb — long, lush
    const reverb = ctx.createConvolver();
    reverb.buffer = createReverbBuffer(ctx, 4);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = prof.reverb;
    reverb.connect(reverbGain);
    reverbGain.connect(masterGain);

    // Drone layer: low-passed oscillators, very slow fade-in
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = prof.droneCutoff;
    droneFilter.Q.value = 0.5;

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0;
    droneFilter.connect(droneGain);
    droneGain.connect(masterGain);
    // Send drone to reverb too
    droneGain.connect(reverb);

    const droneOscs: OscillatorNode[] = [];
    prof.drones.forEach((midi) => {
      const osc = ctx.createOscillator();
      osc.type = prof.droneWave;
      osc.frequency.value = mtof(midi);
      // Slight detune for warmth
      osc.detune.value = (Math.random() - 0.5) * 6;
      osc.connect(droneFilter);
      osc.start();
      droneOscs.push(osc);
    });

    // Slow fade-in for drone
    droneGain.gain.setValueAtTime(0, ctx.currentTime);
    droneGain.gain.linearRampToValueAtTime(prof.droneVolume * (vol / 100), ctx.currentTime + 4);

    // Master fade-in
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);

    // Shimmer — a high note that slowly swells and fades
    let shimmerOsc: OscillatorNode | null = null;
    let shimmerGain: GainNode | null = null;
    if (prof.shimmer) {
      shimmerOsc = ctx.createOscillator();
      shimmerOsc.type = 'sine';
      shimmerOsc.frequency.value = mtof(prof.shimmer);
      shimmerGain = ctx.createGain();
      shimmerGain.gain.value = 0;
      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(reverb);
      shimmerOsc.start();

      // Slow LFO-like swell via scheduled gain changes
      const shimmerEnv = () => {
        if (!shimmerGain || !shimmerOsc) return;
        const t = ctx.currentTime;
        const peak = 0.015 * (vol / 100);
        shimmerGain.gain.cancelScheduledValues(t);
        shimmerGain.gain.setValueAtTime(0.001, t);
        shimmerGain.gain.linearRampToValueAtTime(peak, t + 8);
        shimmerGain.gain.linearRampToValueAtTime(0.001, t + 16);
        const nextId = window.setTimeout(shimmerEnv, 16000);
        // store on the engine later
        (shimmerGain as unknown as { _schedId: number })._schedId = nextId;
      };
      window.setTimeout(shimmerEnv, 3000);
    }

    return {
      ctx,
      masterGain,
      reverb,
      reverbGain,
      droneOscs,
      droneGain,
      droneFilter,
      shimmerOsc,
      shimmerGain,
      bowlSchedulerId: null,
      startTime: ctx.currentTime,
    };
  }

  // ---- Bowl scheduler — strikes a random bowl at intervals ----
  function startBowlScheduler(engine: Engine, prof: MusicProfile, vol: number) {
    let elapsed = 0;

    const strike = () => {
      if (!engineRef.current) return;
      const e = engineRef.current;
      const bowlMidi = prof.bowls[Math.floor(Math.random() * prof.bowls.length)];
      const freq = mtof(bowlMidi);
      // Random velocity for natural variation
      const velocity = (0.12 + Math.random() * 0.1) * (vol / 100);
      strikeBowl(e.ctx, e.masterGain, freq, prof.bowlDecay, velocity, e.ctx.currentTime + 0.02);
      // Also send bowl to reverb
      strikeBowl(e.ctx, e.reverb, freq, prof.bowlDecay, velocity * 0.5, e.ctx.currentTime + 0.02);

      // Schedule next strike with variation
      const interval = prof.bowlInterval * (0.7 + Math.random() * 0.6);
      elapsed += interval;
      engine.bowlSchedulerId = window.setTimeout(strike, interval * 1000);
    };

    // First strike after 2 seconds
    engine.bowlSchedulerId = window.setTimeout(strike, 2000);
  }

  function stopEngine(engine: Engine) {
    if (engine.bowlSchedulerId !== null) {
      clearTimeout(engine.bowlSchedulerId);
      engine.bowlSchedulerId = null;
    }
    // Cancel shimmer scheduler if present
    const sg = engine.shimmerGain as unknown as { _schedId?: number } | null;
    if (sg?._schedId) clearTimeout(sg._schedId);

    const now = engine.ctx.currentTime;
    engine.masterGain.gain.cancelScheduledValues(now);
    engine.masterGain.gain.setValueAtTime(engine.masterGain.gain.value, now);
    engine.masterGain.gain.linearRampToValueAtTime(0, now + 1.5);
    setTimeout(() => {
      try {
        engine.droneOscs.forEach((o) => o.stop());
        engine.shimmerOsc?.stop();
        engine.ctx.close();
      } catch { /* */ }
    }, 1800);
  }

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        stopEngine(engineRef.current);
        engineRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (playerState !== 'playing') return;
    const interval = setInterval(() => {
      if (engineRef.current) {
        setCurrentTime(engineRef.current.ctx.currentTime - startTimeRef.current);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [playerState]);

  const play = useCallback(() => {
    if (engineRef.current) {
      const engine = engineRef.current;
      if (engine.ctx.state === 'suspended') engine.ctx.resume();
      engine.masterGain.gain.cancelScheduledValues(engine.ctx.currentTime);
      engine.masterGain.gain.linearRampToValueAtTime(1, engine.ctx.currentTime + 1.5);
      engine.droneGain.gain.linearRampToValueAtTime(
        profileRef.current.droneVolume * (volumeRef.current / 100),
        engine.ctx.currentTime + 2,
      );
      if (engine.bowlSchedulerId === null) {
        startBowlScheduler(engine, profileRef.current, volumeRef.current);
      }
      setPlayerState('playing');
      startTimeRef.current = engine.ctx.currentTime;
      return;
    }

    const engine = createEngine(profileRef.current, volumeRef.current);
    engineRef.current = engine;
    startBowlScheduler(engine, profileRef.current, volumeRef.current);
    startTimeRef.current = engine.ctx.currentTime;
    setPlayerState('playing');
  }, []);

  const pause = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.masterGain.gain.cancelScheduledValues(engine.ctx.currentTime);
    engine.masterGain.gain.setValueAtTime(engine.masterGain.gain.value, engine.ctx.currentTime);
    engine.masterGain.gain.linearRampToValueAtTime(0, engine.ctx.currentTime + 1.5);
    if (engine.bowlSchedulerId !== null) {
      clearTimeout(engine.bowlSchedulerId);
      engine.bowlSchedulerId = null;
    }
    setPlayerState('paused');
  }, []);

  const toggle = useCallback(() => {
    if (playerState === 'playing') pause();
    else play();
  }, [playerState, play, pause]);

  const loadTrack = useCallback((index: number, autoplay = true) => {
    const prof = MUSIC_PROFILES[index];
    if (!prof) return;
    setCurrentIndex(index);
    setCurrentTime(0);
    profileRef.current = prof;
    indexRef.current = index;

    if (engineRef.current) {
      stopEngine(engineRef.current);
      engineRef.current = null;
    }

    if (autoplay) {
      const engine = createEngine(prof, volumeRef.current);
      engineRef.current = engine;
      startBowlScheduler(engine, prof, volumeRef.current);
      startTimeRef.current = engine.ctx.currentTime;
      setPlayerState('playing');
    } else {
      setPlayerState('paused');
    }
  }, [ setCurrentIndex]);

  const next = useCallback(() => {
    let idx = currentIndex + 1;
    if (shuffle) {
      idx = Math.floor(Math.random() * PLAYLIST.length);
      if (idx === currentIndex && PLAYLIST.length > 1) idx = (idx + 1) % PLAYLIST.length;
    }
    if (idx >= PLAYLIST.length) idx = 0;
    loadTrack(idx);
  }, [currentIndex, shuffle, loadTrack]);

  const prev = useCallback(() => {
    let idx = currentIndex - 1;
    if (idx < 0) idx = PLAYLIST.length - 1;
    loadTrack(idx);
  }, [currentIndex, loadTrack]);

  const seek = useCallback((_seconds: number) => { /* no-op */ }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    volumeRef.current = vol;
    const engine = engineRef.current;
    if (engine && playerState === 'playing') {
      engine.droneGain.gain.cancelScheduledValues(engine.ctx.currentTime);
      engine.droneGain.gain.linearRampToValueAtTime(
        profileRef.current.droneVolume * (vol / 100),
        engine.ctx.currentTime + 0.5,
      );
    }
  }, [setVolumeState, playerState]);

  const setLoop = useCallback(() => { /* always looping */ }, []);

  return {
    isReady,
    playerState,
    track,
    playlist: PLAYLIST,
    currentIndex,
    currentTime,
    duration,
    volume,
    loop,
    shuffle,
    play,
    pause,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    setLoop,
    setShuffle,
    loadTrack,
  };
}
