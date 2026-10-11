import type { Bindings } from "../marimba/bindings";
import { activeRangeLabel, keyboardNotes, labelForMidi } from "../marimba/bindings";
import { KEY_COUNT, noteName } from "../marimba/layout";

type HudProps = {
  bindings: Bindings;
  hoveredMidi: number | null;
  lastNote: string;
  onPlay: (midi: number) => void;
  onOctave: (direction: -1 | 1) => void;
  onScale: () => void;
  onOpenPacifico: () => void;
  onOpenSettings: () => void;
};

export function Hud({
  bindings,
  hoveredMidi,
  lastNote,
  onPlay,
  onOctave,
  onScale,
  onOpenPacifico,
  onOpenSettings,
}: HudProps) {
  const notes = keyboardNotes(bindings.baseMidi);
  const hoveredLabel = hoveredMidi === null ? "Pasa el cursor sobre una lámina" : noteName(hoveredMidi);
  const hoveredKey = hoveredMidi === null ? "" : labelForMidi(bindings, hoveredMidi);

  return (
    <div className="hud">
      <header className="topbar">
        <div className="brand interactive">
          <span className="mark" aria-hidden="true">
            <svg viewBox="0 0 36 36">
              <rect x="3" y="22" width="30" height="3.2" rx="1.2" fill="#e4a15c" />
              <rect x="6" y="15" width="4.2" height="7" rx="0.6" fill="#f3d7b0" />
              <rect x="12.2" y="12" width="4.2" height="10" rx="0.6" fill="#f6e2c4" />
              <rect x="18.4" y="14" width="4.2" height="8" rx="0.6" fill="#efd0a4" />
              <rect x="24.6" y="16" width="4.2" height="6" rx="0.6" fill="#f3d7b0" />
            </svg>
          </span>
          <div>
            <p className="eyebrow">Pacífico colombiano · {KEY_COUNT} láminas</p>
            <h1>Marimba de chonta</h1>
            <p className="subtitle">Una hilera, guadua y burro</p>
          </div>
        </div>
        <div className="top-actions interactive">
          <button type="button" className="ghost" onClick={onOpenPacifico}>
            Pacífico
          </button>
          <button type="button" className="ghost" onClick={onScale}>
            Escala
          </button>
          <button type="button" onClick={onOpenSettings}>
            Controles
          </button>
        </div>
      </header>

      <footer className="dock">
        <div className="dock-meta interactive">
          <p className="status">
            <span>{hoveredLabel}</span>
            {hoveredKey && <kbd>{hoveredKey}</kbd>}
          </p>
          <p className="last-note" data-last-note={lastNote}>
            {lastNote ? `Sonó ${lastNote}` : "Toca una lámina o el teclado"}
          </p>
          <div className="octave">
            <button type="button" onClick={() => onOctave(-1)} aria-label="Bajar octava">
              −
            </button>
            <span>{activeRangeLabel(bindings.baseMidi)}</span>
            <button type="button" onClick={() => onOctave(1)} aria-label="Subir octava">
              +
            </button>
          </div>
          <p className="hint">Arrastra el fondo para girar. El mouse suena en las láminas.</p>
        </div>
        <div className="keybed interactive" aria-label="Teclado de la octava activa">
          {notes.map((note, index) => (
            <button
              key={`${note.midi}-${index}`}
              type="button"
              className="key natural"
              disabled={!note.playable}
              onPointerDown={(event) => {
                event.preventDefault();
                if (note.playable) onPlay(note.midi);
              }}
            >
              <small>{bindings.noteLabels[index]}</small>
              <strong>{note.name}</strong>
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}

