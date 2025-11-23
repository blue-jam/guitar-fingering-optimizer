import { Midi } from '@tonejs/midi';
import type { OptimizedNote } from '../types';

/**
 * Convert MIDI to MusicXML format with optional fingering annotations
 * This is a simplified conversion for basic note display
 */
export const midiToMusicXml = (
  midi: Midi,
  trackIndex: number,
  optimizedNotes?: OptimizedNote[]
): string => {
  const track = midi.tracks[trackIndex];
  if (!track || track.notes.length === 0) {
    return createEmptyMusicXml();
  }

  const notes = track.notes;
  const divisions = 480; // Standard MIDI divisions per quarter note
  const measureDuration = divisions * 4; // 4 beats per measure in 4/4 time

  // Group notes into measures based on their timing
  interface MeasureNote {
    pitch: Pitch;
    duration: number;
    noteType: string;
    time: number;
  }

  const processedNotes: MeasureNote[] = notes.map((note) => ({
    pitch: noteToPitch(note.midi),
    duration: Math.round(note.duration * divisions * 2),
    noteType: getNoteType(note.duration),
    time: note.time * divisions * 2,
  }));

  // Group notes by measure
  const measures: MeasureNote[][] = [];
  let currentMeasure: MeasureNote[] = [];
  let currentMeasureStartTime = 0;

  processedNotes.forEach((note) => {
    const measureNumber = Math.floor(note.time / measureDuration);

    while (measures.length < measureNumber) {
      if (currentMeasure.length > 0) {
        measures.push(currentMeasure);
      } else {
        measures.push([]); // Empty measure
      }
      currentMeasure = [];
      currentMeasureStartTime = measures.length * measureDuration;
    }

    if (measures.length === measureNumber) {
      currentMeasure.push(note);
    }
  });

  if (currentMeasure.length > 0) {
    measures.push(currentMeasure);
  }

  // Ensure at least one measure exists
  if (measures.length === 0) {
    measures.push([]);
  }

  // Create a map from note time to fingering information
  const fingeringMap = new Map<number, { string: number; fret: number; finger: number }>();
  if (optimizedNotes) {
    optimizedNotes.forEach((optNote) => {
      if (optNote.fingering) {
        // Use time as key (rounded to avoid floating point issues)
        const timeKey = Math.round(optNote.time * 1000);
        fingeringMap.set(timeKey, optNote.fingering);
      }
    });
  }

  // Generate MusicXML for each measure
  const measuresXml = measures.map((measureNotes, index) => {
    const measureNumber = index + 1;
    const isFirstMeasure = measureNumber === 1;

    const notesXml = measureNotes.flatMap((note) => {
      // Find fingering for this note based on time
      const timeKey = Math.round(note.time / (divisions * 2) * 1000);
      const fingering = fingeringMap.get(timeKey);

      // Standard notation (staff 1)
      const standardNote = `
      <note>
        <pitch>
          <step>${note.pitch.step}</step>
          ${note.pitch.alter !== 0 ? `<alter>${note.pitch.alter}</alter>` : ''}
          <octave>${note.pitch.octave}</octave>
        </pitch>
        <duration>${note.duration}</duration>
        <type>${note.noteType}</type>
        <staff>1</staff>${
          fingering
            ? `
        <notations>
          <articulations>
            <fingering placement="above">${fingering.finger === 0 ? 'T' : fingering.finger}</fingering>
          </articulations>
        </notations>`
            : ''
        }
      </note>`;

      // TAB notation (staff 2)
      const tabNote = fingering
        ? `
      <note>
        <pitch>
          <step>${note.pitch.step}</step>
          ${note.pitch.alter !== 0 ? `<alter>${note.pitch.alter}</alter>` : ''}
          <octave>${note.pitch.octave}</octave>
        </pitch>
        <duration>${note.duration}</duration>
        <type>${note.noteType}</type>
        <staff>2</staff>
        <notations>
          <technical>
            <string>${fingering.string + 1}</string>
            <fret>${fingering.fret}</fret>
          </technical>
        </notations>
      </note>`
        : `
      <note>
        <pitch>
          <step>${note.pitch.step}</step>
          ${note.pitch.alter !== 0 ? `<alter>${note.pitch.alter}</alter>` : ''}
          <octave>${note.pitch.octave}</octave>
        </pitch>
        <duration>${note.duration}</duration>
        <type>${note.noteType}</type>
        <staff>2</staff>
      </note>`;

      return [standardNote, tabNote];
    }).join('\n');

    return `
    <measure number="${measureNumber}">
      ${isFirstMeasure ? `<attributes>
        <divisions>${divisions}</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <staves>2</staves>
        <clef number="1">
          <sign>G</sign>
          <line>2</line>
        </clef>
        <clef number="2">
          <sign>TAB</sign>
          <line>5</line>
        </clef>
        <staff-details number="2">
          <staff-lines>6</staff-lines>
        </staff-details>
      </attributes>` : ''}
      <print new-system="yes"/>
      ${
        notesXml ||
        `<note><rest/><duration>${measureDuration}</duration><type>whole</type><staff>1</staff></note>
      <note><rest/><duration>${measureDuration}</duration><type>whole</type><staff>2</staff></note>`
      }
    </measure>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Guitar</part-name>
      <part-abbreviation>Gtr.</part-abbreviation>
    </score-part>
  </part-list>
  <part id="P1">
    ${measuresXml}
  </part>
</score-partwise>`;
};

const createEmptyMusicXml = (): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Guitar</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>480</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
    </measure>
  </part>
</score-partwise>`;
};

interface Pitch {
  step: string;
  alter: number;
  octave: number;
}

/**
 * Determine note type based on duration in seconds
 * Assumes 120 BPM (0.5 seconds per beat) as default
 */
const getNoteType = (durationSeconds: number): string => {
  const beatDuration = 0.5; // seconds per quarter note at 120 BPM
  const ratio = durationSeconds / beatDuration;
  
  if (ratio >= 3.5) return 'whole';
  if (ratio >= 1.5) return 'half';
  if (ratio >= 0.75) return 'quarter';
  if (ratio >= 0.375) return 'eighth';
  if (ratio >= 0.1875) return '16th';
  return '32nd';
};

const noteToPitch = (midi: number): Pitch => {
  // Map MIDI notes to note names and alterations (sharps)
  const noteInfo = [
    { step: 'C', alter: 0 },  // C
    { step: 'C', alter: 1 },  // C#
    { step: 'D', alter: 0 },  // D
    { step: 'D', alter: 1 },  // D# (Eb)
    { step: 'E', alter: 0 },  // E
    { step: 'F', alter: 0 },  // F
    { step: 'F', alter: 1 },  // F#
    { step: 'G', alter: 0 },  // G
    { step: 'G', alter: 1 },  // G#
    { step: 'A', alter: 0 },  // A
    { step: 'A', alter: 1 },  // A# (Bb)
    { step: 'B', alter: 0 },  // B
  ];
  
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  
  return {
    step: noteInfo[noteIndex].step,
    alter: noteInfo[noteIndex].alter,
    octave,
  };
};
