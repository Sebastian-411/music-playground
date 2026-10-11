const NOTE_NAMES = ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"] as const;
const NATURAL_PITCHES = new Set([0, 2, 4, 5, 7, 9, 11]);

/** Exemplar de la colección del Banco de la República: 23 láminas diatónicas. */
export const KEY_COUNT = 23;
export const KEYBOARD_SPAN = 8;
export const MIDI_MIN = 48;
export const OCTAVE_BASES = [48, 60, 72] as const;

export const LAYOUT = {
  gap: 0.015,
  frontEdge: 0.42,
  deckY: 1.02,
  nodeInset: 0.224,
  barFlatten: 0.48,
} as const;

export type BarSpec = {
  midi: number;
  index: number;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  length: number;
  frontNodeZ: number;
  backNodeZ: number;
  resonatorLength: number;
  resonatorRadius: number;
};

export function midiToFreq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function isNatural(midi: number): boolean {
  return NATURAL_PITCHES.has(((midi % 12) + 12) % 12);
}

export function noteName(midi: number): string {
  const pitch = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[pitch]}${octave}`;
}

function buildScale(start: number, count: number): number[] {
  const notes: number[] = [];
  let midi = start;
  while (notes.length < count) {
    if (isNatural(midi)) notes.push(midi);
    midi += 1;
  }
  return notes;
}

/** Do3 a Re6, la hilera única de la marimba tradicional. */
export const SCALE = buildScale(MIDI_MIN, KEY_COUNT);
export const MIDI_MAX = SCALE[SCALE.length - 1];

export function scaleIndex(midi: number): number {
  return SCALE.indexOf(midi);
}

export function buildBars(): BarSpec[] {
  const lowFreq = midiToFreq(SCALE[0]);
  const drafted = SCALE.map((midi, index) => {
    const t = (lowFreq / midiToFreq(midi)) ** 0.72;
    const width = 0.046 + 0.052 * t;
    const length = 0.18 + 0.56 * t;
    const height = width * LAYOUT.barFlatten;
    const acoustic = 343 / (4 * midiToFreq(midi));
    return {
      midi,
      index,
      width,
      height,
      length,
      resonatorLength: 0.16 + Math.min(acoustic, 0.66) * 0.92,
      resonatorRadius: width * 0.33,
      y: LAYOUT.deckY,
    };
  });

  let cursor = 0;
  const placed = drafted.map((bar) => {
    const x = cursor + bar.width / 2;
    cursor += bar.width + LAYOUT.gap;
    const front = LAYOUT.frontEdge;
    const z = front - bar.length / 2;
    const frontNodeZ = front - bar.length * LAYOUT.nodeInset;
    const backNodeZ = front - bar.length * (1 - LAYOUT.nodeInset);
    return { ...bar, x, z, frontNodeZ, backNodeZ };
  });
  const shift = (cursor - LAYOUT.gap) / 2;
  return placed.map((bar) => ({ ...bar, x: bar.x - shift }));
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
