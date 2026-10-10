export const MIDI_MIN = 48;
export const MIDI_MAX = 84;
export const KEYBOARD_SPAN = 17;
export const OCTAVE_BASES = [48, 60, 72] as const;

const NOTE_NAMES = ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"] as const;
const NATURAL_PITCHES = new Set([0, 2, 4, 5, 7, 9, 11]);

const PITCH = 0.118;
const NATURAL_WIDTH = 0.068;
const ACCIDENTAL_WIDTH = 0.042;
const NATURAL_FRONT = 0.3;
const ACCIDENTAL_FRONT = -0.02;

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
    const length = 0.82 * Math.sqrt(lowFreq / freq);
    const width = accidental ? ACCIDENTAL_WIDTH : NATURAL_WIDTH;
    const front = accidental ? ACCIDENTAL_FRONT : NATURAL_FRONT;
    let x: number;
    if (accidental) {
      const below = naturals.indexOf(midi - 1);
      x = (below - center) * PITCH + PITCH / 2;
    } else {
      x = (naturals.indexOf(midi) - center) * PITCH;
    }
    return {
      midi,
      accidental,
      x,
      y: accidental ? 0.232 : 0.176,
      z: front - length / 2,
      width,
      height: 0.036,
      length,
      resonatorLength: Math.min(0.92, Math.max(0.1, 88 / freq)),
      resonatorRadius: accidental ? 0.016 : 0.02,
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
