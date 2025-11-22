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
    }));
    onChange({ ...config, fretCount, strings: newStrings });
  };

  const handleStringCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stringCount = parseInt(e.target.value);
    const newStrings = [...config.strings];
    const newDifficulty = [...config.difficulty];
    
    // Add or remove strings as needed
    while (newStrings.length < stringCount) {
      // Add a new string with default values
      const lastString = newStrings[newStrings.length - 1];
      newStrings.push({
        tuning: lastString ? lastString.tuning - 5 : 40,
        fretDistances: lastString ? [...lastString.fretDistances] : Array(config.fretCount).fill(30),
      });
      // Add default difficulty for new string (per string value)
      newDifficulty.push(2);
    }
    
    while (newStrings.length > stringCount) {
      newStrings.pop();
      newDifficulty.pop();
    }
    
    onChange({ ...config, stringCount, strings: newStrings, difficulty: newDifficulty });
  };

  const handleFingerSpanChange = (index: number, value: number) => {
    const newFingerSpan = [...config.fingerSpan];
    newFingerSpan[index] = value;
    onChange({ ...config, fingerSpan: newFingerSpan });
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

  const handleDifficultyChange = (stringIndex: number, value: number) => {
    const newDifficulty = [...config.difficulty];
    newDifficulty[stringIndex] = value;
    onChange({ ...config, difficulty: newDifficulty });
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
        <h3>Finger Span (mm)</h3>
        <label>
          Index to Middle Finger:
          <input
            type="number"
            min="10"
            max="100"
            step="1"
            value={config.fingerSpan[0]}
            onChange={(e) => handleFingerSpanChange(0, parseFloat(e.target.value))}
          />
        </label>
        <label>
          Middle to Ring Finger:
          <input
            type="number"
            min="10"
            max="100"
            step="1"
            value={config.fingerSpan[1]}
            onChange={(e) => handleFingerSpanChange(1, parseFloat(e.target.value))}
          />
        </label>
        <label>
          Ring to Pinky Finger:
          <input
            type="number"
            min="10"
            max="100"
            step="1"
            value={config.fingerSpan[2]}
            onChange={(e) => handleFingerSpanChange(2, parseFloat(e.target.value))}
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

            <label>
              Difficulty (mm penalty):
              <input
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={config.difficulty[stringIndex]?.toFixed(1) || '0.0'}
                onChange={(e) => handleDifficultyChange(stringIndex, parseFloat(e.target.value))}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuitarConfigComponent;
