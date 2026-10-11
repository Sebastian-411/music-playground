import { CANCIONES, ESTUDIOS, type Estudio } from "../marimba/pacifico";

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
          Los estudios son para practicar el aire. Las canciones se pueden tocar en esta hilera: la armonía sale de
          las cifras publicadas cuando existen, transportada a La menor o Do mayor. No suenan las grabaciones ni van
          las letras.
        </p>
        <div className="study-list">
          {ESTUDIOS.map((estudio) => (
            <article key={estudio.id} className="study-row">
              <div>
                <strong>{estudio.title}</strong>
                <small>{estudio.aire}</small>
                <p>{estudio.chords}</p>
              </div>
              <button type="button" onClick={() => onPlay(estudio)} aria-pressed={playingId === estudio.id}>
                {playingId === estudio.id ? "Sonando…" : "Tocar"}
              </button>
            </article>
          ))}
        </div>
        <h3>Para tocar</h3>
        <div className="study-list">
          {CANCIONES.map((song) => (
            <article key={song.id} className="study-row">
              <div>
                <strong>{song.title}</strong>
                <small>
                  {song.artist} · {song.aire}
                </small>
                <p>{song.chords}</p>
                <p>{song.detail}</p>
              </div>
              <button type="button" onClick={() => onPlay(song)} aria-pressed={playingId === song.id}>
                {playingId === song.id ? "Sonando…" : "Tocar"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
