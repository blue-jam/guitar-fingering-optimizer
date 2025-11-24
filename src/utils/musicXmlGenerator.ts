import type { OptimizedNote } from '../types';

/**
 * Add fingering annotations to an existing MusicXML document
 */
export const createMusicXmlWithFingering = (
  originalXml: string,
  optimizedNotes: OptimizedNote[]
): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(originalXml, 'text/xml');

  // Create a map from note time to fingering information
  const fingeringMap = new Map<number, { string: number; fret: number; finger: number }>();
  optimizedNotes.forEach((optNote) => {
    if (optNote.fingering) {
      // Use time as key (rounded to avoid floating point issues)
      const timeKey = Math.round(optNote.time * 1000);
      fingeringMap.set(timeKey, optNote.fingering);
    }
  });

  // Track current time in seconds
  let currentTime = 0;

  // Get divisions (used for timing calculations)
  const divisionsElement = doc.querySelector('divisions');
  const divisions = divisionsElement ? parseInt(divisionsElement.textContent || '480') : 480;

  // Get BPM
  let bpm = 120;
  const soundElement = doc.querySelector('sound[tempo]');
  if (soundElement) {
    const tempoAttr = soundElement.getAttribute('tempo');
    if (tempoAttr) {
      bpm = parseFloat(tempoAttr);
    }
  }

  // Calculate seconds per division
  const beatsPerMinute = bpm;
  const secondsPerBeat = 60 / beatsPerMinute;
  const secondsPerDivision = secondsPerBeat / divisions;

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
          currentTime += duration * secondsPerDivision;
        }
        return;
      }

      // Extract duration
      const durationElement = noteElement.querySelector('duration');
      const duration = durationElement ? parseInt(durationElement.textContent || '0') : 0;

      // Check if this is a chord (has <chord> element)
      const isChord = noteElement.querySelector('chord') !== null;

      // Calculate note time
      const noteTime = isChord ? currentTime - (duration * secondsPerDivision) : currentTime;
      const timeKey = Math.round(noteTime * 1000);
      const fingering = fingeringMap.get(timeKey);

      if (fingering) {
        // Add fingering notation
        let notationsElement = noteElement.querySelector('notations');
        if (!notationsElement) {
          notationsElement = doc.createElement('notations');
          noteElement.appendChild(notationsElement);
        }

        // Add technical notation for TAB (string and fret)
        let technicalElement = notationsElement.querySelector('technical');
        if (!technicalElement) {
          technicalElement = doc.createElement('technical');
          notationsElement.appendChild(technicalElement);
        }

        // Add string
        const stringElement = doc.createElement('string');
        stringElement.textContent = (fingering.string + 1).toString();
        technicalElement.appendChild(stringElement);

        // Add fret
        const fretElement = doc.createElement('fret');
        fretElement.textContent = fingering.fret.toString();
        technicalElement.appendChild(fretElement);

        // Add fingering for standard notation
        let articulationsElement = notationsElement.querySelector('articulations');
        if (!articulationsElement) {
          articulationsElement = doc.createElement('articulations');
          notationsElement.appendChild(articulationsElement);
        }

        const fingeringElement = doc.createElement('fingering');
        fingeringElement.setAttribute('placement', 'above');
        fingeringElement.textContent = fingering.finger === 0 ? 'T' : fingering.finger.toString();
        articulationsElement.appendChild(fingeringElement);
      }

      // Update time
      if (!isChord) {
        currentTime += duration * secondsPerDivision;
      }
    });
  });

  // Serialize back to string
  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
};
