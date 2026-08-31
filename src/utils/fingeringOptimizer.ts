import type { GuitarConfig, Note, OptimizedNote, FingeringPosition } from '../types';

/**
 * Placeholder implementation for fingering optimization algorithm
 * This is a simplified version that assigns basic fingering positions
 * 
 * TODO: Implement proper optimization algorithm considering:
 * - Fret distances and physical constraints
 * - Finger difficulty values
 * - Finger span limitations
 * - Smooth transitions between positions
 * - Minimal hand position changes
 */
export const optimizeFingering = (
  notes: Note[],
  config: GuitarConfig
): OptimizedNote[] => {
  return notes.map(note => {
    // Skip fingering assignment for rests
    if (note.isRest) {
      return {
        ...note,
        fingering: undefined,
      };
    }

    const fingering = findBasicFingering(note.pitch, config);
    return {
      ...note,
      fingering,
    };
  });
};

/**
 * Find a basic fingering position for a given MIDI note
 * This is a simplified version that just finds the first available position
 */
const findBasicFingering = (
  pitch: number,
  config: GuitarConfig
): FingeringPosition | undefined => {
  // Search from the highest string (lowest index in standard order = thinnest string)
  // to find the position with the lowest fret number, preferring open strings and low frets.
  // Strings are ordered from lowest pitch (index 0) to highest pitch (last index).
  let best: { stringIndex: number; fret: number } | undefined;

  for (let stringIndex = 0; stringIndex < config.strings.length; stringIndex++) {
    const string = config.strings[stringIndex];
    const fret = pitch - string.tuning;

    // Check if this fret is within range
    if (fret >= 0 && fret <= config.fretCount) {
      // Prefer the string with the lowest fret number (easier to play)
      if (!best || fret < best.fret) {
        best = { stringIndex, fret };
      }
    }
  }

  if (best) {
    // Assign a finger (simplified logic)
    const finger = Math.min(4, Math.max(0, best.fret % 5));
    return {
      string: best.stringIndex,
      fret: best.fret,
      finger,
    };
  }
  
  return undefined;
};
