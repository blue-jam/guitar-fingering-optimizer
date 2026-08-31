import type { GuitarConfig, OptimizedNote } from '../types';

// Convert MIDI note number to step and octave for MusicXML
const midiToStepOctave = (midi: number): { step: string; octave: number; alter: number } => {
  const noteNames = ['C', 'D', 'D', 'E', 'E', 'F', 'G', 'G', 'A', 'A', 'B', 'B'];
  const semitones =  [ 0,  -1,  0,  -1,  0,  0, -1,  0, -1,  0, -1,  0];
  const noteIndex = midi % 12;
  const step = noteNames[noteIndex];
  const octave = Math.floor(midi / 12) - 1;
  const alter = semitones[noteIndex];
  return { step, octave, alter };
};

/**
 * Add fingering annotations and TAB staff to an existing MusicXML document
 */
export const createMusicXmlWithFingering = (
  originalXml: string,
  optimizedNotes: OptimizedNote[],
  config: GuitarConfig
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

  // Determine existing staff count
  const firstMeasure = doc.querySelector('measure');
  let existingStaffCount = 1;
  if (firstMeasure) {
    const attributesElement = firstMeasure.querySelector('attributes');
    if (attributesElement) {
      const stavesElement = attributesElement.querySelector('staves');
      if (stavesElement && stavesElement.textContent) {
        existingStaffCount = parseInt(stavesElement.textContent);
      }
    }
  }

  // TAB staff will be added as the next staff
  const tabStaffNumber = existingStaffCount + 1;

  // Add TAB staff configuration to first measure's attributes
  if (firstMeasure) {
    let attributesElement = firstMeasure.querySelector('attributes');
    if (!attributesElement) {
      attributesElement = doc.createElement('attributes');
      const firstChild = firstMeasure.firstChild;
      if (firstChild) {
        firstMeasure.insertBefore(attributesElement, firstChild);
      } else {
        firstMeasure.appendChild(attributesElement);
      }
    }

    // Update staves count
    let stavesElement = attributesElement.querySelector('staves');
    if (!stavesElement) {
      stavesElement = doc.createElement('staves');
      // Insert staves after divisions, or at the beginning if no divisions
      const divisionsEl = attributesElement.querySelector('divisions');
      if (divisionsEl) {
        // Insert after divisions element
        if (divisionsEl.nextSibling) {
          attributesElement.insertBefore(stavesElement, divisionsEl.nextSibling);
        } else {
          attributesElement.appendChild(stavesElement);
        }
      } else {
        // No divisions element, insert at the beginning
        const firstChild = attributesElement.firstChild;
        if (firstChild) {
          attributesElement.insertBefore(stavesElement, firstChild);
        } else {
          attributesElement.appendChild(stavesElement);
        }
      }
    }
    stavesElement.textContent = tabStaffNumber.toString();

    // Add clef for TAB staff
    const clefTab = doc.createElement('clef');
    clefTab.setAttribute('number', tabStaffNumber.toString());
    const signTab = doc.createElement('sign');
    signTab.textContent = 'TAB';
    const lineTab = doc.createElement('line');
    lineTab.textContent = '5';
    clefTab.appendChild(signTab);
    clefTab.appendChild(lineTab);
    attributesElement.appendChild(clefTab);

    // Add staff-details for TAB staff
    const staffDetails = doc.createElement('staff-details');
    staffDetails.setAttribute('number', tabStaffNumber.toString());
    const staffLines = doc.createElement('staff-lines');
    staffLines.textContent = '6';
    staffDetails.appendChild(staffLines);

    // Add staff-tuning for each string (line 1 = highest string = last in config.strings)
    const stringCount = config.strings.length;
    for (let line = 1; line <= stringCount; line++) {
      const stringIndex = stringCount - line; // line 1 = highest string (last in array)
      const openStringMidi = config.strings[stringIndex].tuning;
      const { step, octave, alter } = midiToStepOctave(openStringMidi);

      const staffTuning = doc.createElement('staff-tuning');
      staffTuning.setAttribute('line', line.toString());

      const tuningStep = doc.createElement('tuning-step');
      tuningStep.textContent = step;
      staffTuning.appendChild(tuningStep);

      if (alter !== 0) {
        const tuningAlter = doc.createElement('tuning-alter');
        tuningAlter.textContent = alter.toString();
        staffTuning.appendChild(tuningAlter);
      }

      const tuningOctave = doc.createElement('tuning-octave');
      tuningOctave.textContent = octave.toString();
      staffTuning.appendChild(tuningOctave);

      staffDetails.appendChild(staffTuning);
    }

    attributesElement.appendChild(staffDetails);
  }

  // Iterate through all measures
  const measures = doc.querySelectorAll('measure');
  measures.forEach((measure) => {
    // Get all existing notes in the measure (snapshot before we insert new nodes)
    const noteElements = Array.from(measure.querySelectorAll('note'));

    noteElements.forEach((noteElement) => {
      // Extract duration
      const durationElement = noteElement.querySelector('duration');
      const duration = durationElement ? parseInt(durationElement.textContent || '0') : 0;

      // Check if this is a chord (has <chord> element)
      const isChord = noteElement.querySelector('chord') !== null;

      // Calculate note time
      const noteTime = isChord ? currentTime - (duration * secondsPerDivision) : currentTime;
      const timeKey = Math.round(noteTime * 1000);

      // Check if this is a rest note
      const restElement = noteElement.querySelector('rest');
      if (restElement) {
        // Ensure original rest has staff number 1
        let staffElement = noteElement.querySelector('staff');
        if (!staffElement) {
          staffElement = doc.createElement('staff');
          noteElement.appendChild(staffElement);
          staffElement.textContent = '1';
        } else if (!staffElement.textContent || staffElement.textContent === '') {
          staffElement.textContent = '1';
        }
        const staffNumber = parseInt(staffElement.textContent || '1');

        // Only process rests from the first staff to avoid duplicates
        if (staffNumber === 1) {
          // Create TAB rest as a chord note immediately after the original rest
          const tabRest = noteElement.cloneNode(true) as Element;

          // Add <chord/> so it shares the same time position
          const chordEl = doc.createElement('chord');
          tabRest.insertBefore(chordEl, tabRest.firstChild);

          // Keep voice=1 (same voice as standard staff)
          // Set staff number to TAB staff
          let tabStaff = tabRest.querySelector('staff');
          if (!tabStaff) {
            tabStaff = doc.createElement('staff');
            tabRest.appendChild(tabStaff);
          }
          tabStaff.textContent = tabStaffNumber.toString();

          // Remove stem/beam
          const tabStem = tabRest.querySelector('stem');
          if (tabStem) tabRest.removeChild(tabStem);
          tabRest.querySelectorAll('beam').forEach((b) => tabRest.removeChild(b));

          // Remove tuplet from notations
          const tabNotations = tabRest.querySelector('notations');
          if (tabNotations) {
            tabNotations.querySelectorAll('tuplet').forEach((t) => tabNotations.removeChild(t));
          }

          noteElement.after(tabRest);
        }

        // Update time for rests
        if (!isChord) {
          currentTime += duration * secondsPerDivision;
        }
        return;
      }

      // Ensure original note has staff number 1
      let originalStaff = noteElement.querySelector('staff');
      if (!originalStaff) {
        originalStaff = doc.createElement('staff');
        noteElement.appendChild(originalStaff);
        originalStaff.textContent = '1';
      } else if (!originalStaff.textContent || originalStaff.textContent === '') {
        originalStaff.textContent = '1';
      }

      const fingering = fingeringMap.get(timeKey);

      if (fingering) {
        // Add fingering notation to existing note
        let notationsElement = noteElement.querySelector('notations');
        if (!notationsElement) {
          notationsElement = doc.createElement('notations');
          noteElement.appendChild(notationsElement);
        }

        let articulationsElement = notationsElement.querySelector('articulations');
        if (!articulationsElement) {
          articulationsElement = doc.createElement('articulations');
          notationsElement.appendChild(articulationsElement);
        }

        const fingeringElement = doc.createElement('fingering');
        fingeringElement.setAttribute('placement', 'above');
        fingeringElement.textContent = fingering.finger === 0 ? 'T' : fingering.finger.toString();
        articulationsElement.appendChild(fingeringElement);

        // Create TAB note as a chord note immediately after the standard note
        const tabNote = noteElement.cloneNode(true) as Element;

        // Add <chord/> as first child so it shares the same time position
        const chordEl = doc.createElement('chord');
        tabNote.insertBefore(chordEl, tabNote.firstChild);

        // Keep voice=1 (same voice as standard staff)
        // Set staff number to TAB staff
        let tabStaff = tabNote.querySelector('staff');
        if (!tabStaff) {
          tabStaff = doc.createElement('staff');
          tabNote.appendChild(tabStaff);
        }
        tabStaff.textContent = tabStaffNumber.toString();

        // Remove stem/beam
        const tabStem = tabNote.querySelector('stem');
        if (tabStem) tabNote.removeChild(tabStem);
        tabNote.querySelectorAll('beam').forEach((b) => tabNote.removeChild(b));

        // Update notations for TAB note
        let tabNotations = tabNote.querySelector('notations');
        if (!tabNotations) {
          tabNotations = doc.createElement('notations');
          tabNote.appendChild(tabNotations);
        }

        // Remove articulations (fingering) from TAB note
        const tabArticulations = tabNotations.querySelector('articulations');
        if (tabArticulations) tabNotations.removeChild(tabArticulations);

        // Remove tuplet from TAB note
        tabNotations.querySelectorAll('tuplet').forEach((t) => tabNotations!.removeChild(t));

        // Add technical notation for TAB (string and fret)
        let technicalElement = tabNotations.querySelector('technical');
        if (!technicalElement) {
          technicalElement = doc.createElement('technical');
          tabNotations.appendChild(technicalElement);
        }
        while (technicalElement.firstChild) {
          technicalElement.removeChild(technicalElement.firstChild);
        }

        // Add string (MusicXML string 1 = highest pitch = last in config.strings array)
        const stringElement = doc.createElement('string');
        stringElement.textContent = (config.strings.length - fingering.string).toString();
        technicalElement.appendChild(stringElement);

        const fretElement = doc.createElement('fret');
        fretElement.textContent = fingering.fret.toString();
        technicalElement.appendChild(fretElement);

        // Insert TAB note immediately after the standard note
        noteElement.after(tabNote);
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
