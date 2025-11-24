import { useState } from 'react';
import './App.css';
import GuitarConfigComponent from './components/GuitarConfig';
import MusicXmlUploader from './components/MidiUploader';
import SheetMusicDisplay from './components/SheetMusicDisplay';
import ConfigExporter from './components/ConfigExporter';
import type { OptimizationSettings, OptimizedNote, Note } from './types';
import { createDefaultGuitarConfig } from './utils/defaultConfig';
import { optimizeFingering } from './utils/fingeringOptimizer';
import type { ParsedMusicXml } from './utils/musicXmlParser';
import { createMusicXmlWithFingering } from './utils/musicXmlGenerator';

function App() {
  const [settings, setSettings] = useState<OptimizationSettings>({
    guitarConfig: createDefaultGuitarConfig(),
  });

  const [parsedMusicXml, setParsedMusicXml] = useState<ParsedMusicXml | null>(null);
  const [musicXml, setMusicXml] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [optimizedNotes, setOptimizedNotes] = useState<OptimizedNote[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleMusicXmlLoaded = (loadedMusicXml: ParsedMusicXml) => {
    setParsedMusicXml(loadedMusicXml);
    setMusicXml(loadedMusicXml.rawXml);
    setNotes(loadedMusicXml.notes);

    // Clear previous optimization
    setOptimizedNotes([]);
  };

  const handleOptimize = () => {
    if (!parsedMusicXml || notes.length === 0) return;

    setIsOptimizing(true);

    // Perform optimization (runs in the frontend)
    setTimeout(() => {
      const optimized = optimizeFingering(notes, settings.guitarConfig);
      setOptimizedNotes(optimized);

      // Add fingering annotations to MusicXML
      const xmlWithFingering = createMusicXmlWithFingering(parsedMusicXml.rawXml, optimized);
      setMusicXml(xmlWithFingering);

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
        <p>Upload MusicXML files and optimize guitar fingering positions</p>
      </header>

      <main>
        <div className="left-panel">
          <MusicXmlUploader onMusicXmlLoaded={handleMusicXmlLoaded} />

          {parsedMusicXml && (
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
