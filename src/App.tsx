import { useState } from 'react';
import { Midi } from '@tonejs/midi';
import './App.css';
import GuitarConfigComponent from './components/GuitarConfig';
import MidiUploader from './components/MidiUploader';
import SheetMusicDisplay from './components/SheetMusicDisplay';
import ConfigExporter from './components/ConfigExporter';
import type { OptimizationSettings, OptimizedNote } from './types';
import { createDefaultGuitarConfig } from './utils/defaultConfig';
import { getTrackNotes } from './utils/midiParser';
import { optimizeFingering } from './utils/fingeringOptimizer';
import { midiToMusicXml } from './utils/midiToMusicXml';

function App() {
  const [settings, setSettings] = useState<OptimizationSettings>({
    guitarConfig: createDefaultGuitarConfig(),
  });
  
  const [midi, setMidi] = useState<Midi | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<number>(0);
  const [musicXml, setMusicXml] = useState<string | null>(null);
  const [optimizedNotes, setOptimizedNotes] = useState<OptimizedNote[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleMidiLoaded = (loadedMidi: Midi, trackIndex: number) => {
    setMidi(loadedMidi);
    setSelectedTrack(trackIndex);
    
    // Convert MIDI to MusicXML for display
    const xml = midiToMusicXml(loadedMidi, trackIndex);
    setMusicXml(xml);
    
    // Clear previous optimization
    setOptimizedNotes([]);
  };

  const handleOptimize = () => {
    if (!midi) return;
    
    setIsOptimizing(true);
    
    // Get notes from selected track
    const notes = getTrackNotes(midi, selectedTrack);
    
    // Perform optimization (runs in the frontend)
    setTimeout(() => {
      const optimized = optimizeFingering(notes, settings.guitarConfig);
      setOptimizedNotes(optimized);
      setIsOptimizing(false);
    }, 100);
  };

  const handleConfigImport = (importedSettings: OptimizationSettings) => {
    setSettings(importedSettings);
  };

  return (
    <div className="app">
      <header>
        <h1>Guitar Fingering Optimization</h1>
        <p>Upload MIDI files and optimize guitar fingering positions</p>
      </header>

      <main>
        <div className="left-panel">
          <MidiUploader onMidiLoaded={handleMidiLoaded} />
          
          {midi && (
            <div className="optimization-controls">
              <button 
                onClick={handleOptimize} 
                disabled={isOptimizing}
                className="optimize-button"
              >
                {isOptimizing ? 'Optimizing...' : 'Optimize Fingering'}
              </button>
              
              {optimizedNotes.length > 0 && (
                <div className="optimization-results">
                  <h3>Optimization Results</h3>
                  <p>Processed {optimizedNotes.length} notes</p>
                  <p>
                    Fingered: {optimizedNotes.filter(n => n.fingering).length} / {optimizedNotes.length}
                  </p>
                </div>
              )}
            </div>
          )}

          <ConfigExporter 
            settings={settings}
            onImport={handleConfigImport}
          />
        </div>

        <div className="center-panel">
          <SheetMusicDisplay musicXml={musicXml} />
        </div>

        <div className="right-panel">
          <GuitarConfigComponent
            config={settings.guitarConfig}
            onChange={(config) => setSettings({ ...settings, guitarConfig: config })}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
