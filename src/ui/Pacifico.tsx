import { ESTUDIOS, REFERENCIAS, type Estudio } from "../marimba/pacifico";

type PacificoProps = {
  playingId: string | null;
  onPlay: (estudio: Estudio) => void;
  onClose: () => void;
};

export function Pacifico({ playingId, onPlay, onClose }: PacificoProps) {
  return (
    <div className="settings-backdrop interactive" onClick={onClose}>
      <section
        className="settings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pacifico-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="settings-head">
          <div>
            <p className="eyebrow">Marimba de chonta</p>
            <h2 id="pacifico-title">Pacífico</h2>
          </div>
          <button type="button" className="text-button" onClick={onClose}>
            Cerrar
          </button>
        </header>
        <p className="settings-copy">
          Estos estudios son piezas originales en currulao, juga y bunde para practicar en esta marimba. La lista de
          abajo son canciones de referencia del litoral; aquí no suenan sus grabaciones.
        </p>
        <div className="study-list">
          {ESTUDIOS.map((estudio) => (
            <article key={estudio.id} className="study-row">
              <div>
                <strong>{estudio.title}</strong>
                <small>{estudio.aire}</small>
                <p>{estudio.detail}</p>
              </div>
              <button type="button" onClick={() => onPlay(estudio)} aria-pressed={playingId === estudio.id}>
                {playingId === estudio.id ? "Sonando…" : "Tocar"}
              </button>
            </article>
          ))}
        </div>
        <h3>Para escuchar</h3>
        <ul className="song-list">
          {REFERENCIAS.map((song) => (
            <li key={song.title}>
              <strong>{song.title}</strong>
              <small>
                {song.artist} · {song.aire}
              </small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
