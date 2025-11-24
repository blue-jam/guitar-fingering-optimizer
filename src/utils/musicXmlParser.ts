import type { Note } from '../types';

export interface MusicXmlMetadata {
  title?: string;
  composer?: string;
  bpm: number;
  timeSignature: {
    numerator: number;
    denominator: number;
  };
}

export interface ParsedMusicXml {
  notes: Note[];
  metadata: MusicXmlMetadata;
  rawXml: string;
}

/**
 * Parse a MusicXML file and extract notes
 */
export const parseMusicXmlFile = async (file: File): Promise<ParsedMusicXml> => {
  const text = await file.text();
  return parseMusicXmlString(text);
};

/**
 * Parse a MusicXML string and extract notes
 */
export const parseMusicXmlString = (xml: string): ParsedMusicXml => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  // Check for parsing errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Failed to parse MusicXML: ' + parserError.textContent);
  }

  const metadata = extractMetadata(doc);
  const notes = extractNotes(doc, metadata);

  return {
    notes,
    metadata,
    rawXml: xml,
  };
};

/**
 * Extract metadata from MusicXML document
 */
const extractMetadata = (doc: Document): MusicXmlMetadata => {
  // Extract title
  const titleElement = doc.querySelector('work > work-title');
  const title = titleElement?.textContent || undefined;

  // Extract composer
  const composerElement = doc.querySelector('identification > creator[type="composer"]');
  const composer = composerElement?.textContent || undefined;

  // Extract tempo (default to 120 BPM if not specified)
  let bpm = 120;
  const soundElement = doc.querySelector('sound[tempo]');
  if (soundElement) {
    const tempoAttr = soundElement.getAttribute('tempo');
    if (tempoAttr) {
      bpm = parseFloat(tempoAttr);
    }
  }

  // Extract time signature (default to 4/4)
  let numerator = 4;
  let denominator = 4;
  const timeElement = doc.querySelector('time');
  if (timeElement) {
    const beatsElement = timeElement.querySelector('beats');
    const beatTypeElement = timeElement.querySelector('beat-type');
    if (beatsElement && beatTypeElement) {
      numerator = parseInt(beatsElement.textContent || '4');
      denominator = parseInt(beatTypeElement.textContent || '4');
    }
  }

  return {
    title,
    composer,
    bpm,
    timeSignature: { numerator, denominator },
  };
};

/**
 * Extract notes from MusicXML document
 */
const extractNotes = (doc: Document, metadata: MusicXmlMetadata): Note[] => {
  const notes: Note[] = [];

  // Get divisions (used for timing calculations)
  const divisionsElement = doc.querySelector('divisions');
  const divisions = divisionsElement ? parseInt(divisionsElement.textContent || '480') : 480;

  // Calculate seconds per division
  const beatsPerMinute = metadata.bpm;
  const secondsPerBeat = 60 / beatsPerMinute;
  const secondsPerDivision = secondsPerBeat / divisions;

  // Current time in divisions
  let currentTime = 0;

  // Iterate through all measures
  const measures = doc.querySelectorAll('measure');
  measures.forEach((measure) => {
    // Iterate through all notes in the measure
    const noteElements = measure.querySelectorAll('note');

    noteElements.forEach((noteElement) => {
      // Skip rest notes
      const restElement = noteElement.querySelector('rest');
      if (restElement) {
        // Update time for rests
        const durationElement = noteElement.querySelector('duration');
        if (durationElement) {
          const duration = parseInt(durationElement.textContent || '0');
          currentTime += duration;
        }
        return;
      }

      // Extract pitch
      const pitchElement = noteElement.querySelector('pitch');
      if (!pitchElement) return;

      const stepElement = pitchElement.querySelector('step');
      const octaveElement = pitchElement.querySelector('octave');
      const alterElement = pitchElement.querySelector('alter');

      if (!stepElement || !octaveElement) return;

      const step = stepElement.textContent || 'C';
      const octave = parseInt(octaveElement.textContent || '4');
      const alter = alterElement ? parseInt(alterElement.textContent || '0') : 0;

      // Convert to MIDI note number
      const midiNote = pitchToMidi(step, octave, alter);

      // Extract duration
      const durationElement = noteElement.querySelector('duration');
      const duration = durationElement ? parseInt(durationElement.textContent || '0') : 0;

      // Check if this is a chord (has <chord> element)
      const isChord = noteElement.querySelector('chord') !== null;

      // If it's a chord, don't advance the time
      if (!isChord) {
        // Add note
        notes.push({
          pitch: midiNote,
          time: currentTime * secondsPerDivision,
          duration: duration * secondsPerDivision,
        });

        currentTime += duration;
      } else {
        // For chord notes, use the same time as the previous note
        notes.push({
          pitch: midiNote,
          time: (currentTime - duration) * secondsPerDivision,
          duration: duration * secondsPerDivision,
        });
      }
    });
  });

  return notes;
};

/**
 * Convert pitch notation to MIDI note number
 */
const pitchToMidi = (step: string, octave: number, alter: number): number => {
  const noteMap: { [key: string]: number } = {
    'C': 0,
    'D': 2,
    'E': 4,
    'F': 5,
    'G': 7,
    'A': 9,
    'B': 11,
  };

  const baseNote = noteMap[step.toUpperCase()] || 0;
  return (octave + 1) * 12 + baseNote + alter;
};
