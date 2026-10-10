import type { Bindings, Slot } from "../marimba/bindings";
import { keyboardNotes } from "../marimba/bindings";

type SettingsProps = {
  bindings: Bindings;
  listening: Slot | null;
  onListen: (slot: Slot) => void;
  onVolume: (volume: number) => void;
  onHardness: (hardness: number) => void;
  onReset: () => void;
  onClose: () => void;
};

function sameListening(listening: Slot | null, slot: Slot): boolean {
  if (!listening || listening.kind !== slot.kind) return false;
  if (listening.kind === "note" && slot.kind === "note") return listening.index === slot.index;
  return true;
}

export function Settings({ bindings, listening, onListen, onVolume, onHardness, onReset, onClose }: SettingsProps) {
  const notes = keyboardNotes(bindings.baseMidi);

  return (
    <div className="settings-backdrop interactive" onClick={onClose}>
      <section
        className="settings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="settings-head">
          <div>
            <p className="eyebrow">Marimba</p>
            <h2 id="settings-title">Controles</h2>
          </div>
          <button type="button" className="text-button" onClick={onClose}>
            Cerrar
          </button>
        </header>
        <p className="settings-copy">
          Elige la tecla de cada nota y cómo cambias de octava. Si la tecla ya estaba usada, se intercambia.
          Escape cancela la captura.
        </p>
        {listening && <p className="listen-banner">Pulsa la nueva tecla.</p>}
        <div className="sliders">
          <label>
            Volumen
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={bindings.volume}
              onChange={(event) => onVolume(Number(event.target.value))}
            />
          </label>
          <label>
            Dureza de la baqueta
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={bindings.hardness}
              onChange={(event) => onHardness(Number(event.target.value))}
            />
          </label>
        </div>
        <ul className="binding-list">
          <BindingRow
            name="Bajar octava"
            label={bindings.octaveDownLabel}
            listening={sameListening(listening, { kind: "octaveDown" })}
            onListen={() => onListen({ kind: "octaveDown" })}
          />
          <BindingRow
            name="Subir octava"
            label={bindings.octaveUpLabel}
            listening={sameListening(listening, { kind: "octaveUp" })}
            onListen={() => onListen({ kind: "octaveUp" })}
          />
          {notes.map((note, index) => (
            <BindingRow
              key={index}
              name={note.playable ? note.name : "Fuera del instrumento"}
              label={bindings.noteLabels[index]}
              listening={sameListening(listening, { kind: "note", index })}
              disabled={!note.playable}
              onListen={() => onListen({ kind: "note", index })}
            />
          ))}
        </ul>
        <footer className="settings-foot">
          <button type="button" className="ghost" onClick={onReset}>
            Restablecer
          </button>
        </footer>
      </section>
    </div>
  );
}

function BindingRow({
  name,
  label,
  listening,
  disabled,
  onListen,
}: {
  name: string;
  label: string;
  listening: boolean;
  disabled?: boolean;
  onListen: () => void;
}) {
  return (
    <li className={disabled ? "is-disabled" : undefined}>
      <span>{name}</span>
      <kbd>{label}</kbd>
      <button type="button" onClick={onListen} disabled={disabled} aria-pressed={listening}>
        {listening ? "Escuchando…" : "Cambiar"}
      </button>
    </li>
  );
}
