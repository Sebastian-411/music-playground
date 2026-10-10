export const MIDI_MIN = 48;
export const MIDI_MAX = 84;
export const KEYBOARD_SPAN = 17;
export const OCTAVE_BASES = [48, 60, 72] as const;

const NOTE_NAMES = ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"] as const;
const NATURAL_PITCHES = new Set([0, 2, 4, 5, 7, 9, 11]);

export const LAYOUT = {
  pitch: 0.14,
  naturalWidth: 0.086,
  accidentalWidth: 0.044,
  naturalFront: 0.34,
  accidentalFront: -0.015,
  deckY: 0.98,
  barHeight: 0.024,
} as const;

export type BarSpec = {
  midi: number;
  accidental: boolean;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  length: number;
  resonatorLength: number;
  resonatorRadius: number;
};

export function midiToFreq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function isNatural(midi: number): boolean {
  return NATURAL_PITCHES.has(midi % 12);
}

export function noteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[midi % 12]}${octave}`;
}

export function buildBars(): BarSpec[] {
  const midis: number[] = [];
  for (let midi = MIDI_MIN; midi <= MIDI_MAX; midi += 1) midis.push(midi);
  const naturals = midis.filter(isNatural);
  const center = (naturals.length - 1) / 2;
  const lowFreq = midiToFreq(MIDI_MIN);

  return midis.map((midi) => {
    const accidental = !isNatural(midi);
    const freq = midiToFreq(midi);
    const length = (accidental ? 0.34 : 0.5) * Math.sqrt(lowFreq / freq);
    const width = accidental ? LAYOUT.accidentalWidth : LAYOUT.naturalWidth;
    const front = accidental ? LAYOUT.accidentalFront : LAYOUT.naturalFront;
    const below = accidental ? naturals.indexOf(midi - 1) : naturals.indexOf(midi);
    const x = (below - center) * LAYOUT.pitch + (accidental ? LAYOUT.pitch / 2 : 0);
    const resonatorLength = Math.min(0.82, Math.max(0.15, 62 / freq + 0.1));
    return {
      midi,
      accidental,
      x,
      y: LAYOUT.deckY + (accidental ? 0.038 : 0),
      z: front - length / 2,
      width,
      height: LAYOUT.barHeight,
      length,
      resonatorLength,
      resonatorRadius: accidental ? 0.016 : 0.027,
    };
  });
}

export const BARS = buildBars();

export function marimbaExtents(bars: BarSpec[] = BARS) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const bar of bars) {
    minX = Math.min(minX, bar.x - bar.width / 2);
    maxX = Math.max(maxX, bar.x + bar.width / 2);
    minZ = Math.min(minZ, bar.z - bar.length / 2);
    maxZ = Math.max(maxZ, bar.z + bar.length / 2);
  }
  return { minX, maxX, minZ, maxZ };
}
