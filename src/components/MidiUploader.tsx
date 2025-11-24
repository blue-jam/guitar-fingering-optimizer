import React, { useState } from 'react';
import type { ParsedMusicXml } from '../utils/musicXmlParser';
import { parseMusicXmlFile } from '../utils/musicXmlParser';

interface MusicXmlUploaderProps {
  onMusicXmlLoaded: (musicXml: ParsedMusicXml) => void;
}

const MusicXmlUploader: React.FC<MusicXmlUploaderProps> = ({ onMusicXmlLoaded }) => {
  const [musicXml, setMusicXml] = useState<ParsedMusicXml | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const parsedMusicXml = await parseMusicXmlFile(file);

      setMusicXml(parsedMusicXml);
      onMusicXmlLoaded(parsedMusicXml);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse MusicXML file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="midi-uploader">
      <h2>MusicXML File</h2>

      <div className="file-input">
        <label>
          Select MusicXML File:
          <input
            type="file"
            accept=".xml,.musicxml"
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>
      </div>

      {loading && <p>Loading MusicXML file...</p>}
      {error && <p className="error">{error}</p>}

      {musicXml && (
        <div className="midi-info">
          <p>Notes: {musicXml.notes.length}</p>
          {musicXml.metadata.title && <p>Title: {musicXml.metadata.title}</p>}
          {musicXml.metadata.composer && <p>Composer: {musicXml.metadata.composer}</p>}
          <p>Tempo: {musicXml.metadata.bpm} BPM</p>
          <p>Time Signature: {musicXml.metadata.timeSignature.numerator}/{musicXml.metadata.timeSignature.denominator}</p>
        </div>
      )}
    </div>
  );
};

export default MusicXmlUploader;
