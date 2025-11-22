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
    
    return `
      <note>
        <pitch>
          <step>${pitch.step}</step>
          ${pitch.alter !== 0 ? `<alter>${pitch.alter}</alter>` : ''}
          <octave>${pitch.octave}</octave>
        </pitch>
        <duration>${duration}</duration>
        <type>quarter</type>
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

const noteToPitch = (midi: number): Pitch => {
  const noteNames = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'];
  const alterations = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
  
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  
  return {
    step: noteNames[noteIndex],
    alter: alterations[noteIndex],
    octave,
  };
};
