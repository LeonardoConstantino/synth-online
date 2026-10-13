/**
 * MIDI note mapping and conversion utilities
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiToNoteName(midi: number): string {
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

export function noteNameToMidi(name: string): number {
  const match = name.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 60; // Default to C4
  const noteName = match[1];
  const octave = parseInt(match[2], 10);
  const noteIndex = NOTE_NAMES.indexOf(noteName);
  if (noteIndex === -1) return 60;
  return (octave + 1) * 12 + noteIndex;
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function isBlackKey(midi: number): boolean {
  const noteInOctave = ((midi % 12) + 12) % 12;
  return [1, 3, 6, 8, 10].includes(noteInOctave);
}

// Standard keyboard key mapping for a 2-octave physical keyboard
// Bottom row = natural notes, upper row = sharp/flat notes
export const KEYBOARD_MAP: Record<string, number> = {
  // Lower octave (C4 to B4 when base octave is 4)
  'a': 0,   // C
  'w': 1,   // C#
  's': 2,   // D
  'e': 3,   // D#
  'd': 4,   // E
  'f': 5,   // F
  't': 6,   // F#
  'g': 7,   // G
  'y': 8,   // G#
  'h': 9,   // A
  'u': 10,  // A#
  'j': 11,  // B
  // Upper octave (C5 to E5)
  'k': 12,  // C+1
  'o': 13,  // C#+1
  'l': 14,  // D+1
  'p': 15,  // D#+1
  ';': 16,  // E+1
  "'": 17,  // F+1
};

// Default 16-pad chromatic/pentatonic grid mapping starting at C3
export const DEFAULT_PAD_KEYS = [
  '1', '2', '3', '4',
  'q', 'w', 'e', 'r',
  'a', 's', 'd', 'f',
  'z', 'x', 'c', 'v'
];

export function getDefaultPads(baseOctave = 3) {
  const baseMidi = (baseOctave + 1) * 12; // C3 = 48
  return DEFAULT_PAD_KEYS.map((key, index) => {
    const midi = baseMidi + index;
    return {
      index,
      midi,
      noteName: midiToNoteName(midi),
      key,
    };
  });
}
