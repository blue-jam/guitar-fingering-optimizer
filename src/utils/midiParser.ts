import { Midi } from '@tonejs/midi';
import type { MidiTrack, Note } from '../types';

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
