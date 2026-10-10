import { KEYBOARD_SPAN, MIDI_MAX, MIDI_MIN, OCTAVE_BASES, noteName } from "./layout";

const STORAGE_KEY = "music-playground.marimba.controls";

export const DEFAULT_NOTE_CODES = [
  "KeyA",
  "KeyW",
  "KeyS",
  "KeyE",
  "KeyD",
  "KeyF",
  "KeyT",
  "KeyG",
  "KeyY",
  "KeyH",
  "KeyU",
  "KeyJ",
  "KeyK",
  "KeyO",
  "KeyL",
  "KeyP",
  "Semicolon",
] as const;

const CODE_LABELS: Record<string, string> = {
  Semicolon: ";",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Backslash: "\\",
  BracketLeft: "[",
  BracketRight: "]",
  Minus: "-",
  Equal: "=",
  Backquote: "`",
  Space: "Espacio",
  Enter: "Enter",
  ShiftLeft: "Shift",
  ShiftRight: "Shift",
  IntlBackslash: "<",
};

export type Slot =
  | { kind: "note"; index: number }
  | { kind: "octaveDown" }
  | { kind: "octaveUp" };

export type Bindings = {
  noteCodes: string[];
  noteLabels: string[];
  octaveDown: string;
  octaveDownLabel: string;
  octaveUp: string;
  octaveUpLabel: string;
  baseMidi: number;
  volume: number;
  hardness: number;
};

export function codeLabel(code: string): string {
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  return CODE_LABELS[code] ?? code;
}

export function labelFromEvent(event: KeyboardEvent): string {
  if (event.key && event.key !== "Dead" && event.key.length === 1) {
    return event.key.toUpperCase();
  }
  return codeLabel(event.code);
}

export function defaultBindings(): Bindings {
  return {
    noteCodes: [...DEFAULT_NOTE_CODES],
    noteLabels: DEFAULT_NOTE_CODES.map((code) => codeLabel(code)),
    octaveDown: "KeyZ",
    octaveDownLabel: "Z",
    octaveUp: "KeyX",
    octaveUpLabel: "X",
    baseMidi: 60,
    volume: 0.82,
    hardness: 0.55,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function loadBindings(): Bindings {
  const fallback = defaultBindings();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Bindings>;
    if (!Array.isArray(parsed.noteCodes) || parsed.noteCodes.length !== KEYBOARD_SPAN) return fallback;
    if (!parsed.noteCodes.every((code) => typeof code === "string" && code.length > 0)) return fallback;
    const noteLabels = Array.isArray(parsed.noteLabels)
      ? parsed.noteCodes.map((code, index) => {
          const label = parsed.noteLabels?.[index];
          return typeof label === "string" && label.length > 0 ? label : codeLabel(code);
        })
      : parsed.noteCodes.map((code) => codeLabel(code));
    const baseMidi = OCTAVE_BASES.includes(parsed.baseMidi as (typeof OCTAVE_BASES)[number])
      ? (parsed.baseMidi as number)
      : fallback.baseMidi;
    return {
      noteCodes: [...parsed.noteCodes],
      noteLabels,
      octaveDown: typeof parsed.octaveDown === "string" ? parsed.octaveDown : fallback.octaveDown,
      octaveDownLabel:
        typeof parsed.octaveDownLabel === "string" ? parsed.octaveDownLabel : fallback.octaveDownLabel,
      octaveUp: typeof parsed.octaveUp === "string" ? parsed.octaveUp : fallback.octaveUp,
      octaveUpLabel: typeof parsed.octaveUpLabel === "string" ? parsed.octaveUpLabel : fallback.octaveUpLabel,
      baseMidi,
      volume: typeof parsed.volume === "number" ? clamp(parsed.volume, 0, 1) : fallback.volume,
      hardness: typeof parsed.hardness === "number" ? clamp(parsed.hardness, 0, 1) : fallback.hardness,
    };
  } catch {
    return fallback;
  }
}

export function saveBindings(bindings: Bindings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
}

function sameSlot(a: Slot, b: Slot): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "note" && b.kind === "note") return a.index === b.index;
  return true;
}

function readSlot(bindings: Bindings, slot: Slot): { code: string; label: string } {
  if (slot.kind === "note") {
    return { code: bindings.noteCodes[slot.index], label: bindings.noteLabels[slot.index] };
  }
  if (slot.kind === "octaveDown") return { code: bindings.octaveDown, label: bindings.octaveDownLabel };
  return { code: bindings.octaveUp, label: bindings.octaveUpLabel };
}

function writeSlot(bindings: Bindings, slot: Slot, code: string, label: string): void {
  if (slot.kind === "note") {
    bindings.noteCodes[slot.index] = code;
    bindings.noteLabels[slot.index] = label;
    return;
  }
  if (slot.kind === "octaveDown") {
    bindings.octaveDown = code;
    bindings.octaveDownLabel = label;
    return;
  }
  bindings.octaveUp = code;
  bindings.octaveUpLabel = label;
}

function findSlot(bindings: Bindings, code: string): Slot | null {
  if (bindings.octaveDown === code) return { kind: "octaveDown" };
  if (bindings.octaveUp === code) return { kind: "octaveUp" };
  const index = bindings.noteCodes.indexOf(code);
  if (index >= 0) return { kind: "note", index };
  return null;
}

export function assignBinding(bindings: Bindings, slot: Slot, code: string, label: string): Bindings {
  const next: Bindings = {
    ...bindings,
    noteCodes: [...bindings.noteCodes],
    noteLabels: [...bindings.noteLabels],
  };
  const previous = readSlot(next, slot);
  if (previous.code === code) return next;
  const other = findSlot(next, code);
  writeSlot(next, slot, code, label);
  if (other && !sameSlot(other, slot)) writeSlot(next, other, previous.code, previous.label);
  return next;
}

export function resolveKey(
  bindings: Bindings,
  code: string,
): { type: "note"; midi: number } | { type: "octave"; direction: -1 | 1 } | null {
  if (code === bindings.octaveDown) return { type: "octave", direction: -1 };
  if (code === bindings.octaveUp) return { type: "octave", direction: 1 };
  const index = bindings.noteCodes.indexOf(code);
  if (index < 0) return null;
  const midi = bindings.baseMidi + index;
  if (midi < MIDI_MIN || midi > MIDI_MAX) return null;
  return { type: "note", midi };
}

export function shiftOctave(baseMidi: number, direction: -1 | 1): number {
  const index = OCTAVE_BASES.indexOf(baseMidi as (typeof OCTAVE_BASES)[number]);
  const next = index < 0 ? 1 : index + direction;
  return OCTAVE_BASES[Math.min(OCTAVE_BASES.length - 1, Math.max(0, next))];
}

export function keyboardNotes(baseMidi: number): { midi: number; playable: boolean; name: string }[] {
  return Array.from({ length: KEYBOARD_SPAN }, (_, index) => {
    const midi = baseMidi + index;
    const playable = midi >= MIDI_MIN && midi <= MIDI_MAX;
    return { midi, playable, name: playable ? noteName(midi) : "—" };
  });
}

export function activeRangeLabel(baseMidi: number): string {
  const notes = keyboardNotes(baseMidi).filter((note) => note.playable);
  if (notes.length === 0) return "";
  return `${notes[0].name} – ${notes[notes.length - 1].name}`;
}
