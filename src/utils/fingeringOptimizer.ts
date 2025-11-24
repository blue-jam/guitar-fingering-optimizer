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
  // Try to find a position on any string
  for (let stringIndex = 0; stringIndex < config.strings.length; stringIndex++) {
    const string = config.strings[stringIndex];
    const fret = pitch - string.tuning;
    
    // Check if this fret is within range
    if (fret >= 0 && fret <= config.fretCount) {
      // Assign a finger (simplified logic)
      const finger = Math.min(4, Math.max(0, fret % 5));
      
      return {
        string: stringIndex,
        fret,
        finger,
      };
    }
  }
  
  return undefined;
};
