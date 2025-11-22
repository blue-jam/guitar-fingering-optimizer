import { Midi } from '@tonejs/midi';

/**
 * Convert MIDI to MusicXML format
 * This is a simplified conversion for basic note display
 */
export const midiToMusicXml = (midi: Midi, trackIndex: number): string => {
  const track = midi.tracks[trackIndex];
  if (!track || track.notes.length === 0) {
    return createEmptyMusicXml();
  }

  const notes = track.notes;
  const divisions = 480; // Standard MIDI divisions per quarter note

  // Group notes by time to create measures
  const notesXml = notes.map((note) => {
    const pitch = noteToPitch(note.midi);
    const duration = Math.round(note.duration * divisions * 2); // Convert to divisions
    const noteType = getNoteType(note.duration);
    
    return `
      <note>
        <pitch>
          <step>${pitch.step}</step>
          ${pitch.alter !== 0 ? `<alter>${pitch.alter}</alter>` : ''}
          <octave>${pitch.octave}</octave>
        </pitch>
        <duration>${duration}</duration>
        <type>${noteType}</type>
      </note>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>${track.name || 'Guitar'}</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>${divisions}</divisions>
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
      ${notesXml}
    </measure>
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
