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

  // Default difficulty values in mm (per fret)
  // These values are added to fretDistances to account for difficulty
  const defaultDifficulty = Array.from({ length: fretCount }, (_, i) => {
    // Higher frets have slightly higher difficulty
    return 1 + (i * 0.05);
  });

  const strings = standardTuning.map(tuning => ({
    tuning,
    fretDistances: [...defaultFretDistances],
    difficulty: [...defaultDifficulty],
  }));
  
  // Default string spacing (approximate, in mm) - distance between adjacent strings
  const stringSpacings = Array.from({ length: stringCount - 1 }, () => 10);

  return {
    fretCount,
    stringCount,
    strings,
    fingerSpans: [30, 30, 30], // Default finger spans in mm: [index-middle, middle-ring, ring-pinky]
    stringSpacings,
  };
};
