import type { GuitarConfig } from '../types';

// Default guitar configuration (standard 6-string guitar)
export const createDefaultGuitarConfig = (): GuitarConfig => {
  const fretCount = 22;
  const stringCount = 6;
  
  // Standard tuning: E2, A2, D3, G3, B3, E4
  const standardTuning = [40, 45, 50, 55, 59, 64];
  
  // Default fret distances (approximate, in mm)
  const defaultFretDistances = Array.from({ length: fretCount }, (_, i) => {
    // Fret distances decrease logarithmically
    return 650 / Math.pow(2, i / 12);
  });
  
  const strings = standardTuning.map(tuning => ({
    tuning,
    fretDistances: [...defaultFretDistances],
  }));
  
  // Default difficulty values in mm (per string)
  // These values are added to fretDistances to account for difficulty
  const difficulty = Array.from({ length: stringCount }, (_, i) => {
    // Lower strings (thicker) have slightly higher difficulty
    return 1 + (i * 0.5);
  });
  
  return {
    fretCount,
    stringCount,
    strings,
    difficulty,
    fingerSpan: [30, 30, 30], // Default finger spans in mm: [index-middle, middle-ring, ring-pinky]
  };
};
