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
  naturalFrontNode: 0.3,
  accidentalFrontNode: -0.02,
  deckY: 0.98,
  barHeight: 0.024,
  nodeInset: 0.224,
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
  frontNodeZ: number;
  backNodeZ: number;
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
    const length = (accidental ? 0.36 : 0.52) * Math.sqrt(lowFreq / freq);
    const width = accidental ? LAYOUT.accidentalWidth : LAYOUT.naturalWidth;
    const below = accidental ? naturals.indexOf(midi - 1) : naturals.indexOf(midi);
    const x = (below - center) * LAYOUT.pitch + (accidental ? LAYOUT.pitch / 2 : 0);
    const frontNodeZ = accidental ? LAYOUT.accidentalFrontNode : LAYOUT.naturalFrontNode;
    const nodeSpan = length * (1 - 2 * LAYOUT.nodeInset);
    const backNodeZ = frontNodeZ - nodeSpan;
    const acoustic = 343 / (4 * freq);
    const resonatorLength = Math.min(0.74, Math.max(0.12, acoustic));
    return {
      midi,
      accidental,
      x,
      y: LAYOUT.deckY + (accidental ? 0.04 : 0),
      z: (frontNodeZ + backNodeZ) / 2,
      width,
      height: LAYOUT.barHeight,
      length,
      frontNodeZ,
      backNodeZ,
      resonatorLength,
      resonatorRadius: accidental ? 0.015 : 0.02 + (MIDI_MAX - midi) * 0.0004,
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
