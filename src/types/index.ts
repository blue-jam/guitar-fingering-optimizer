// Configuration types for guitar fingering optimization

export interface StringConfig {
  tuning: number; // MIDI note number
  fretDistances: number[]; // Distance in mm for each fret
  difficulty: number[]; // Difficulty value for each fret (0-1)
}

export interface GuitarConfig {
  fretCount: number; // 19-24
  stringCount: number;
  strings: StringConfig[];
  fingerSpan: number; // Maximum finger span in mm
}

export interface OptimizationSettings {
  guitarConfig: GuitarConfig;
}

export interface MidiTrack {
  index: number;
  name: string;
  noteCount: number;
}

export interface Note {
  pitch: number; // MIDI note number
  time: number; // Start time in seconds
  duration: number; // Duration in seconds
}

export interface FingeringPosition {
  string: number; // String index (0-based)
  fret: number; // Fret number (0 = open string)
  finger: number; // Finger number (0=thumb, 1=index, 2=middle, 3=ring, 4=pinky)
}

export interface OptimizedNote extends Note {
  fingering?: FingeringPosition;
}
