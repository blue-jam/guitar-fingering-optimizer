import { Midi } from '@tonejs/midi';
import type { MidiTrack, Note, MidiMetadata } from '../types';

export const parseMidiFile = async (file: File): Promise<Midi> => {
  const arrayBuffer = await file.arrayBuffer();
  const midi = new Midi(arrayBuffer);
  return midi;
};

export const getMidiTracks = (midi: Midi): MidiTrack[] => {
  return midi.tracks.map((track, index) => ({
    index,
    name: track.name || `Track ${index + 1}`,
    noteCount: track.notes.length,
  }));
};

export const getTrackNotes = (midi: Midi, trackIndex: number): Note[] => {
  const track = midi.tracks[trackIndex];
  if (!track) return [];

  return track.notes.map(note => ({
    pitch: note.midi,
    time: note.time,
    duration: note.duration,
  }));
};

export const getMidiMetadata = (midi: Midi): MidiMetadata => {
  // Extract tempo (BPM) from MIDI header
  // @tonejs/midi provides tempo in BPM through the header.tempos array
  let bpm = 120; // Default BPM
  if (midi.header.tempos && midi.header.tempos.length > 0) {
    bpm = midi.header.tempos[0].bpm;
  }

  // Extract time signature from MIDI header
  let timeSignature = { numerator: 4, denominator: 4 }; // Default 4/4
  if (midi.header.timeSignatures && midi.header.timeSignatures.length > 0) {
    const ts = midi.header.timeSignatures[0];
    timeSignature = {
      numerator: ts.timeSignature[0],
      denominator: ts.timeSignature[1],
    };
  }

  return {
    bpm,
    timeSignature,
  };
};
