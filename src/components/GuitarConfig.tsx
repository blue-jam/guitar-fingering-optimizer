import React from 'react';
import type { GuitarConfig } from '../types';

interface GuitarConfigProps {
  config: GuitarConfig;
  onChange: (config: GuitarConfig) => void;
}

const GuitarConfigComponent: React.FC<GuitarConfigProps> = ({ config, onChange }) => {
  const handleFretCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fretCount = parseInt(e.target.value);
    const newStrings = config.strings.map(string => ({
      ...string,
      fretDistances: string.fretDistances.slice(0, fretCount),
      difficulty: string.difficulty.slice(0, fretCount),
    }));
    onChange({ ...config, fretCount, strings: newStrings });
  };

  const handleStringCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stringCount = parseInt(e.target.value);
    const newStrings = [...config.strings];
    
    // Add or remove strings as needed
    while (newStrings.length < stringCount) {
      // Add a new string with default values
      const lastString = newStrings[newStrings.length - 1];
      newStrings.push({
        tuning: lastString ? lastString.tuning - 5 : 40,
        fretDistances: lastString ? [...lastString.fretDistances] : Array(config.fretCount).fill(30),
        difficulty: lastString ? [...lastString.difficulty] : Array(config.fretCount).fill(0.5),
      });
    }
    
    while (newStrings.length > stringCount) {
      newStrings.pop();
    }
    
    onChange({ ...config, stringCount, strings: newStrings });
  };

  const handleFingerSpanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, fingerSpan: parseFloat(e.target.value) });
  };

  const handleTuningChange = (stringIndex: number, value: number) => {
    const newStrings = [...config.strings];
    newStrings[stringIndex] = { ...newStrings[stringIndex], tuning: value };
    onChange({ ...config, strings: newStrings });
  };

  const handleFretDistanceChange = (stringIndex: number, fretIndex: number, value: number) => {
    const newStrings = [...config.strings];
    const newDistances = [...newStrings[stringIndex].fretDistances];
    newDistances[fretIndex] = value;
    newStrings[stringIndex] = { ...newStrings[stringIndex], fretDistances: newDistances };
    onChange({ ...config, strings: newStrings });
  };

  const handleDifficultyChange = (stringIndex: number, fretIndex: number, value: number) => {
    const newStrings = [...config.strings];
    const newDifficulty = [...newStrings[stringIndex].difficulty];
    newDifficulty[fretIndex] = value;
    newStrings[stringIndex] = { ...newStrings[stringIndex], difficulty: newDifficulty };
    onChange({ ...config, strings: newStrings });
  };

  const copyFretDistances = (sourceStringIndex: number) => {
    const sourceDistances = config.strings[sourceStringIndex].fretDistances;
    const newStrings = config.strings.map(string => ({
      ...string,
      fretDistances: [...sourceDistances],
    }));
    onChange({ ...config, strings: newStrings });
  };

  return (
    <div className="guitar-config">
      <h2>Guitar Configuration</h2>
      
      <div className="config-section">
        <label>
          Fret Count:
          <select value={config.fretCount} onChange={handleFretCountChange}>
            {[19, 20, 21, 22, 23, 24].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="config-section">
        <label>
          String Count:
          <input
            type="number"
            min="4"
            max="12"
            value={config.stringCount}
            onChange={handleStringCountChange}
          />
        </label>
      </div>

      <div className="config-section">
        <label>
          Finger Span (mm):
          <input
            type="number"
            min="50"
            max="200"
            step="5"
            value={config.fingerSpan}
            onChange={handleFingerSpanChange}
          />
        </label>
      </div>

      <div className="strings-config">
        <h3>String Configuration</h3>
        {config.strings.map((string, stringIndex) => (
          <div key={stringIndex} className="string-config">
            <h4>String {stringIndex + 1}</h4>
            
            <label>
              Tuning (MIDI Note):
              <input
                type="number"
                min="0"
                max="127"
                value={string.tuning}
                onChange={(e) => handleTuningChange(stringIndex, parseInt(e.target.value))}
              />
            </label>

            <details>
              <summary>Fret Distances (mm)</summary>
              <button onClick={() => copyFretDistances(stringIndex)}>
                Copy to All Strings
              </button>
              <div className="fret-distances">
                {string.fretDistances.map((distance, fretIndex) => (
                  <label key={fretIndex}>
                    Fret {fretIndex + 1}:
                    <input
                      type="number"
                      min="10"
                      max="100"
                      step="0.1"
                      value={distance.toFixed(1)}
                      onChange={(e) => handleFretDistanceChange(stringIndex, fretIndex, parseFloat(e.target.value))}
                    />
                  </label>
                ))}
              </div>
            </details>

            <details>
              <summary>Fret Difficulty (0-1)</summary>
              <div className="fret-difficulty">
                {string.difficulty.map((diff, fretIndex) => (
                  <label key={fretIndex}>
                    Fret {fretIndex + 1}:
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.05"
                      value={diff.toFixed(2)}
                      onChange={(e) => handleDifficultyChange(stringIndex, fretIndex, parseFloat(e.target.value))}
                    />
                  </label>
                ))}
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuitarConfigComponent;
