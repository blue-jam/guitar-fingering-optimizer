import React, { useEffect, useRef } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

interface SheetMusicDisplayProps {
  musicXml: string | null;
}

const SheetMusicDisplay: React.FC<SheetMusicDisplayProps> = ({ musicXml }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize OpenSheetMusicDisplay
    if (!osmdRef.current) {
      osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
        autoResize: true,
        backend: 'svg',
        drawTitle: true,
        drawingParameters: 'compacttight',
      });
    }

    // Load and render MusicXML
    if (musicXml) {
      osmdRef.current
        .load(musicXml)
        .then(() => {
          osmdRef.current?.render();
        })
        .catch((error) => {
          console.error('Error rendering sheet music:', error);
        });
    }

    return () => {
      // Cleanup is handled by OSMD internally
    };
  }, [musicXml]);

  return (
    <div className="sheet-music-display">
      <h2>Sheet Music</h2>
      <div ref={containerRef} className="sheet-music-container">
        {!musicXml && <p>Upload a MIDI file to display sheet music</p>}
      </div>
    </div>
  );
};

export default SheetMusicDisplay;
