import { useCallback, useEffect, useRef, useState } from "react";
import {
  activeRangeLabel,
  assignBinding,
  defaultBindings,
  keyboardNotes,
  labelFromEvent,
  loadBindings,
  saveBindings,
  resolveKey,
  shiftOctave,
  type Bindings,
  type Slot,
} from "./marimba/bindings";
import { MIDI_MAX } from "./marimba/layout";
import { noteName } from "./marimba/layout";
import { MarimbaStage } from "./marimba/MarimbaStage";
import { MarimbaSynth } from "./marimba/synth";
import { markStrike } from "./marimba/strikes";
import type { Estudio } from "./marimba/pacifico";
import { Hud } from "./ui/Hud";
import { Pacifico } from "./ui/Pacifico";
import { Settings } from "./ui/Settings";

export function App() {
  const [bindings, setBindings] = useState<Bindings>(() => loadBindings());
  const [hoveredMidi, setHoveredMidi] = useState<number | null>(null);
  const [lastNote, setLastNote] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pacificoOpen, setPacificoOpen] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [listening, setListening] = useState<Slot | null>(null);
  const studyTimers = useRef<number[]>([]);
  const synth = useRef<MarimbaSynth | null>(null);
  const bindingsRef = useRef(bindings);
  const listeningRef = useRef(listening);
  const settingsRef = useRef(settingsOpen);
  bindingsRef.current = bindings;
  listeningRef.current = listening;
  settingsRef.current = settingsOpen;

  if (!synth.current) synth.current = new MarimbaSynth();

  useEffect(() => {
    saveBindings(bindings);
    const engine = synth.current;
    if (!engine) return;
    engine.hardness = bindings.hardness;
    engine.setVolume(bindings.volume);
  }, [bindings]);

  const play = useCallback((midi: number) => {
    synth.current?.play(midi);
    markStrike(midi);
    setLastNote(noteName(midi));
  }, []);

  const update = useCallback((recipe: (current: Bindings) => Bindings) => {
    setBindings((current) => recipe(current));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;

      if (listeningRef.current) {
        event.preventDefault();
        if (event.code === "Escape") {
          setListening(null);
          return;
        }
        const slot = listeningRef.current;
        setBindings((current) => assignBinding(current, slot, event.code, labelFromEvent(event)));
        setListening(null);
        return;
      }

      if (settingsRef.current && event.code === "Escape") {
        setSettingsOpen(false);
        return;
      }

      const action = resolveKey(bindingsRef.current, event.code);
      if (!action) return;
      event.preventDefault();
      if (action.type === "octave") {
        setBindings((current) => ({ ...current, baseMidi: shiftOctave(current.baseMidi, action.direction) }));
        return;
      }
      play(action.midi);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [play]);

  const playEstudio = useCallback(
    (estudio: Estudio) => {
      studyTimers.current.forEach((timer) => window.clearTimeout(timer));
      studyTimers.current = estudio.steps.map((chord, index) =>
        window.setTimeout(() => {
          chord.forEach((midi) => play(midi));
          if (index === estudio.steps.length - 1) setPlayingId(null);
        }, index * estudio.stepMs),
      );
      setPlayingId(estudio.id);
    },
    [play],
  );

  const playScale = useCallback(() => {
    const base = bindingsRef.current.baseMidi;
    const scale = [0, 2, 4, 5, 7, 9, 11, 12]
      .map((interval) => base + interval)
      .filter((midi) => midi <= MIDI_MAX);
    scale.forEach((midi, index) => {
      window.setTimeout(() => play(midi), index * 170);
    });
  }, [play]);

  const mappedMidis = keyboardNotes(bindings.baseMidi)
    .filter((note) => note.playable)
    .map((note) => note.midi);

  return (
    <main className="app">
      <div className="stage">
        <MarimbaStage onPlay={play} onHover={setHoveredMidi} mappedMidis={mappedMidis} />
      </div>
      <Hud
        bindings={bindings}
        hoveredMidi={hoveredMidi}
        lastNote={lastNote}
        onPlay={play}
        onOctave={(direction) => update((current) => ({ ...current, baseMidi: shiftOctave(current.baseMidi, direction) }))}
        onScale={playScale}
        onOpenPacifico={() => {
          setSettingsOpen(false);
          setPacificoOpen(true);
        }}
        onOpenSettings={() => {
          setListening(null);
          setPacificoOpen(false);
          setSettingsOpen(true);
        }}
      />
      {pacificoOpen && (
        <Pacifico
          playingId={playingId}
          onPlay={playEstudio}
          onClose={() => setPacificoOpen(false)}
        />
      )}
      {settingsOpen && (
        <Settings
          bindings={bindings}
          listening={listening}
          onListen={setListening}
          onVolume={(volume) => update((current) => ({ ...current, volume }))}
          onHardness={(hardness) => update((current) => ({ ...current, hardness }))}
          onReset={() => {
            const next = defaultBindings();
            setBindings(next);
            setListening(null);
          }}
          onClose={() => {
            setListening(null);
            setSettingsOpen(false);
          }}
        />
      )}
      <span className="sr-only" aria-live="polite">
        {lastNote ? `Sonó ${lastNote}` : "Listo para tocar"} {activeRangeLabel(bindings.baseMidi)}
      </span>
    </main>
  );
}
