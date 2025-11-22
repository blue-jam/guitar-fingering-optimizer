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
  
  // Default difficulty (increases with fret number)
  const defaultDifficulty = Array.from({ length: fretCount }, (_, i) => {
    return Math.min(1, i / fretCount + 0.1);
  });
  
  const strings = standardTuning.map(tuning => ({
    tuning,
    fretDistances: [...defaultFretDistances],
    difficulty: [...defaultDifficulty],
  }));
  
  return {
    fretCount,
    stringCount,
    strings,
    fingerSpan: 100, // Default finger span in mm
  };
};
