export type Track = {
  videoId: string;
  title: string;
  artist: string;
};

// Each profile describes a meditative sound space
export type MusicProfile = {
  id: string;
  title: string;
  artist: string;
  // Drone notes (MIDI) — sustained throughout
  drones: number[];
  // Bowl tones (MIDI) — struck occasionally, like singing bowls
  bowls: number[];
  // How often a bowl is struck, in seconds (random within +/- 30%)
  bowlInterval: number;
  // Bowl decay time in seconds (long = resonant)
  bowlDecay: number;
  // Drone waveform
  droneWave: OscillatorType;
  // Bowl waveform (sine = cleanest ring)
  bowlWave: OscillatorType;
  // Drone filter cutoff
  droneCutoff: number;
  // Reverb amount 0-1
  reverb: number;
  // Volume of drone layer 0-1
  droneVolume: number;
  // Volume of bowl layer 0-1
  bowlVolume: number;
  // Optional gentle shimmer — high harmonic that fades in/out slowly
  shimmer: number | null; // MIDI note, or null
};

// A minor pentatonic / natural minor collections that sound calming
export const MUSIC_PROFILES: MusicProfile[] = [
  {
    id: 'singing-bowls',
    title: 'Sjungande skålar',
    artist: 'Meditation',
    drones: [45, 57], // A2 + A3
    bowls: [69, 72, 76, 79], // A4, C5, E5, G5
    bowlInterval: 6,
    bowlDecay: 8,
    droneWave: 'sine',
    bowlWave: 'sine',
    droneCutoff: 500,
    reverb: 0.8,
    droneVolume: 0.15,
    bowlVolume: 0.25,
    shimmer: null,
  },
  {
    id: 'deep-meditation',
    title: 'Djup meditation',
    artist: 'Mindfulness',
    drones: [43, 55], // G2 + G3
    bowls: [62, 67, 70, 74], // D4, G4, Bb4, D5
    bowlInterval: 8,
    bowlDecay: 10,
    droneWave: 'sine',
    bowlWave: 'sine',
    droneCutoff: 400,
    reverb: 0.85,
    droneVolume: 0.18,
    bowlVolume: 0.22,
    shimmer: 86, // D6 gentle shimmer
  },
  {
    id: 'forest-stillness',
    title: 'Skogens stillhet',
    artist: 'Naturmeditation',
    drones: [40, 52], // E2 + E3
    bowls: [64, 67, 71, 74], // E4, G4, B4, D5
    bowlInterval: 7,
    bowlDecay: 9,
    droneWave: 'triangle',
    bowlWave: 'sine',
    droneCutoff: 350,
    reverb: 0.78,
    droneVolume: 0.14,
    bowlVolume: 0.2,
    shimmer: null,
  },
  {
    id: 'ocean-breath',
    title: 'Havets andning',
    artist: 'Andningsmeditation',
    drones: [41, 53], // F2 + F3
    bowls: [65, 68, 72, 77], // F4, Ab4, C5, F5
    bowlInterval: 5,
    bowlDecay: 7,
    droneWave: 'sine',
    bowlWave: 'sine',
    droneCutoff: 450,
    reverb: 0.82,
    droneVolume: 0.16,
    bowlVolume: 0.24,
    shimmer: 89, // F6
  },
  {
    id: 'twilight-calm',
    title: 'Skymningsro',
    artist: 'Avslutning',
    drones: [38, 50], // D2 + D3
    bowls: [62, 65, 69, 72], // D4, F4, A4, C5
    bowlInterval: 9,
    bowlDecay: 11,
    droneWave: 'triangle',
    bowlWave: 'sine',
    droneCutoff: 320,
    reverb: 0.88,
    droneVolume: 0.17,
    bowlVolume: 0.21,
    shimmer: null,
  },
  {
    id: 'morning-serenity',
    title: 'Morgonfrid',
    artist: 'Morgonritual',
    drones: [44, 56], // G#2 + G#3
    bowls: [68, 71, 75, 80], // G#4, B4, D#5, G#5
    bowlInterval: 6,
    bowlDecay: 8,
    droneWave: 'sine',
    bowlWave: 'sine',
    droneCutoff: 480,
    reverb: 0.8,
    droneVolume: 0.15,
    bowlVolume: 0.23,
    shimmer: 92, // G#6
  },
];

export function mtof(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export const PLAYLIST: Track[] = MUSIC_PROFILES.map((p) => ({
  videoId: p.id,
  title: p.title,
  artist: p.artist,
}));
