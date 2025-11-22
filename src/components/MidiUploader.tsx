import React, { useState } from 'react';
import { Midi } from '@tonejs/midi';
import type { MidiTrack } from '../types';
import { parseMidiFile, getMidiTracks } from '../utils/midiParser';

interface MidiUploaderProps {
  onMidiLoaded: (midi: Midi, selectedTrack: number) => void;
}

const MidiUploader: React.FC<MidiUploaderProps> = ({ onMidiLoaded }) => {
  const [midi, setMidi] = useState<Midi | null>(null);
  const [tracks, setTracks] = useState<MidiTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const parsedMidi = await parseMidiFile(file);
      const midiTracks = getMidiTracks(parsedMidi);
      
      setMidi(parsedMidi);
      setTracks(midiTracks);
      
      // Auto-select first track with notes
      const firstTrackWithNotes = midiTracks.findIndex(t => t.noteCount > 0);
      const trackIndex = firstTrackWithNotes >= 0 ? firstTrackWithNotes : 0;
      setSelectedTrack(trackIndex);
      
      onMidiLoaded(parsedMidi, trackIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse MIDI file');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const trackIndex = parseInt(e.target.value);
    setSelectedTrack(trackIndex);
    if (midi) {
      onMidiLoaded(midi, trackIndex);
    }
  };

  return (
    <div className="midi-uploader">
      <h2>MIDI File</h2>
      
      <div className="file-input">
        <label>
          Select MIDI File:
          <input
            type="file"
            accept=".mid,.midi"
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>
      </div>

      {loading && <p>Loading MIDI file...</p>}
      {error && <p className="error">{error}</p>}

      {tracks.length > 0 && (
        <div className="track-selection">
          <label>
            Select Track:
            <select value={selectedTrack} onChange={handleTrackChange}>
              {tracks.map((track) => (
                <option key={track.index} value={track.index}>
                  {track.name} ({track.noteCount} notes)
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {midi && (
        <div className="midi-info">
          <p>Duration: {midi.duration.toFixed(2)}s</p>
          <p>Tracks: {tracks.length}</p>
          <p>Selected track notes: {tracks[selectedTrack]?.noteCount || 0}</p>
        </div>
      )}
    </div>
  );
};

export default MidiUploader;
