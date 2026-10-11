export type Estudio = {
  id: string;
  title: string;
  aire: string;
  detail: string;
  chords: string;
  stepMs: number;
  steps: number[][];
  artist?: string;
};

export type Referencia = {
  title: string;
  artist: string;
  aire: string;
};

export const ESTUDIOS: Estudio[] = [
  {
    id: "currulao",
    title: "Estudio de currulao",
    aire: "Currulao",
    detail: "Ostinato en 6/8 con el grave en el tiempo fuerte y la melodía en el contratiempo.",
    chords: "Lam · Sol · Do",
    stepMs: 170,
    steps: [
      [48, 67], [], [64], [48, 69], [], [67],
      [50, 65], [], [57], [50, 72], [], [69],
      [48, 67], [64], [], [48, 71], [], [67],
      [53, 65], [], [60], [53, 69], [64], [60],
    ],
  },
  {
    id: "juga",
    title: "Estudio de juga",
    aire: "Juga",
    detail: "Frase corta y más pareja, con respuestas entre el registro medio y el agudo.",
    chords: "Do · Fa · Sol",
    stepMs: 155,
    steps: [
      [60], [64], [67], [64], [60, 48], [],
      [62], [65], [69], [65], [62, 50], [],
      [64], [67], [72], [67], [64, 52], [60],
      [59], [62], [67], [64], [60, 48], [55],
    ],
  },
  {
    id: "bunde",
    title: "Estudio de bunde",
    aire: "Bunde",
    detail: "Melodía lenta sobre un bordón, más cantábile que el currulao.",
    chords: "Do · Fa · Sol · Lam",
    stepMs: 280,
    steps: [
      [48, 72], [71], [69], [67],
      [48, 65], [64], [62], [60],
      [50, 69], [67], [65], [64],
      [48, 67], [65], [64], [60],
    ],
  },
];

const C3 = 48;
const D3 = 50;
const E3 = 52;
const F3 = 53;
const G3 = 55;
const A3 = 57;
const B3 = 59;
const C4 = 60;
const D4 = 62;
const E4 = 64;
const F4 = 65;
const G4 = 67;
const A4 = 69;
const B4 = 71;
const C5 = 72;
const D5 = 74;
const E5 = 76;
const G5 = 79;

/** Compás de 6/8: el bajo entra en el tiempo fuerte y en el contratiempo. */
function bar(bass: number, melody: Array<number | 0>): number[][] {
  return melody.map((note, index) => {
    const chord: number[] = [];
    if (index === 0 || index === 3) chord.push(bass);
    if (note) chord.push(note);
    return chord;
  });
}

function four(bass: number, melody: number[]): number[][] {
  return melody.map((note, index) => (index === 0 ? [bass, note] : [note]));
}

/**
 * Arreglos para esta hilera diatónica.
 * Donde hay cifra publicada, la armonía se transporta a La menor o Do mayor
 * y el dominante con sensible alterada queda en su versión natural (Mim en vez de Mi7).
 * No se copian letras ni partituras.
 */
export const CANCIONES: Estudio[] = [
  {
    id: "buenaventura",
    title: "Mi Buenaventura",
    artist: "Petronio Álvarez",
    aire: "Currulao",
    chords: "Mim · Lam · Do · Sol",
    detail:
      "Cifra publicada en Re menor (Rem7, La7, Fa, Do7). Transportada a La menor para que cada nota exista en la chonta.",
    stepMs: 168,
    steps: [
      ...bar(E3, [G4, 0, B4, G4, E4, G4]),
      ...bar(A3, [E4, 0, C5, A4, E4, C5]),
      ...bar(E3, [B4, 0, G4, E4, G4, B4]),
      ...bar(A3, [C5, 0, A4, E5, C5, A4]),
      ...bar(C3, [E5, 0, G5, E5, C5, G4]),
      ...bar(G3, [D5, 0, B4, G4, B4, D5]),
      ...bar(C4, [E5, 0, C5, G4, E4, G4]),
      ...bar(A3, [C5, A4, E4, C4, A3, 0]),
    ],
  },
  {
    id: "te-vengo",
    title: "Te vengo a cantar",
    artist: "Grupo Bahía",
    aire: "Aguabajo",
    chords: "Lam · Rem · Mim · Sol · Do",
    detail:
      "Cifra publicada en Mi menor (Mim, Lam, Si7; puente Re, Sol, Si7). Subida una cuarta y con el dominante natural.",
    stepMs: 340,
    steps: [
      ...four(A3, [A4, C5, E4, A4]),
      ...four(D3, [F4, A4, D4, F4]),
      ...four(E3, [G4, B4, E4, G4]),
      ...four(A3, [C5, A4, E4, A4]),
      ...four(G3, [B4, D5, G4, B4]),
      ...four(C3, [E5, C5, G4, E4]),
      ...four(E3, [G4, B4, E4, B4]),
      ...four(A3, [A4, E4, C4, A3]),
    ],
  },
  {
    id: "escalera",
    title: "Quítate de mi escalera",
    artist: "Grupo Socavón de Timbiquí",
    aire: "Currulao",
    chords: "Lam · Sol · Do · Mim",
    detail:
      "El tema está documentado en La menor, cerca de 87 pulsos. No hay una cifra pública única; este es el currulao lento sobre esa cadencia.",
    stepMs: 230,
    steps: [
      ...bar(A3, [A4, 0, C5, 0, E4, 0]),
      ...bar(G3, [G4, 0, B4, 0, D5, 0]),
      ...bar(C4, [E4, 0, G4, 0, C5, 0]),
      ...bar(E3, [E4, 0, G4, B4, E4, 0]),
      ...bar(A3, [C5, 0, A4, 0, E4, C4]),
      ...bar(G3, [D5, 0, B4, G4, D4, 0]),
      ...bar(C4, [G4, E4, C5, G4, E4, C4]),
      ...bar(A3, [A4, E4, C4, A3, 0, 0]),
    ],
  },
  {
    id: "tumba",
    title: "La vamo' a tumba'",
    artist: "Grupo Saboreo",
    aire: "Bambazú",
    chords: "Do · Fa · Sol",
    detail:
      "No aparece una cifra pública. Arreglo en Do mayor, el modo brillante en el que suele cantarse este bambazú de fiesta.",
    stepMs: 155,
    steps: [
      ...bar(C3, [E4, G4, C5, E5, C5, G4]),
      ...bar(F3, [A4, C5, F4, A4, C5, A4]),
      ...bar(G3, [B4, D5, G4, B4, D5, B4]),
      ...bar(C4, [E5, C5, G4, E4, C5, E5]),
      ...bar(C3, [G4, C5, E5, G5, E5, C5]),
      ...bar(F3, [C5, A4, F4, A4, C5, F4]),
      ...bar(G3, [D5, B4, G4, D4, B4, G4]),
      ...bar(C4, [C5, E4, G4, C5, E5, C5]),
    ],
  },
  {
    id: "birimbi",
    title: "El Birimbí",
    artist: "Grupo Bahía",
    aire: "Abosao",
    chords: "Mim · Lam · Do · Sol",
    detail:
      "La partitura de conjunto está en Sol menor (Re7, Solm, Sib, Fa), a negra con puntillo = 126. Subida un tono, dominante natural.",
    stepMs: 155,
    steps: [
      ...bar(E3, [E4, G4, B4, E4, G4, B4]),
      ...bar(A3, [A4, C5, E4, A4, C5, E5]),
      ...bar(C3, [E4, G4, C5, E5, C5, G4]),
      ...bar(G3, [D5, B4, G4, B4, D5, G4]),
      ...bar(E3, [B4, G4, E4, B4, E5, B4]),
      ...bar(A3, [C5, A4, E4, C5, A4, E4]),
      ...bar(C4, [G4, C5, E5, C5, G4, E4]),
      ...bar(A3, [A4, E4, C4, A3, E4, A4]),
    ],
  },
  {
    id: "aguacerito",
    title: "Aguacerito llové",
    artist: "Grupo Naidy",
    aire: "Canto de boga",
    chords: "La pentatónica · Do · Sol",
    detail:
      "Canto tradicional de bogas. No hay una sola cifra; la marimba responde con la pentatónica de La, en pregunta y contestación.",
    stepMs: 280,
    steps: [
      [E4], [G4], [A4], [C5], [A4], [G4],
      [A3, E4], [D4], [E4], [G4], [A4], [],
      [C5], [A4], [G4], [E4], [D4], [E4],
      [A3, A4], [G4], [E4], [D4], [C4], [A3],
      [C4, G4], [A4], [C5], [D5], [C5], [A4],
      [G3, G4], [E4], [D4], [E4], [G4], [A4],
      [A3, C5], [A4], [G4], [E4], [D4], [C4],
      [A3, A4], [E4], [C4], [A3], [], [],
    ],
  },
  {
    id: "y-que",
    title: "Y qué?",
    artist: "Herencia de Timbiquí",
    aire: "Juga",
    chords: "Lam · Sol · Do",
    detail:
      "No hay cifra publicada de esta juga. Arreglo corto en La menor, con la frase partida entre el medio y el agudo.",
    stepMs: 148,
    steps: [
      [A3, A4], [C5], [A4], [G4], [A4], [],
      [G3, G4], [B4], [D5], [B4], [G4], [],
      [C4, E4], [G4], [C5], [G4], [E4], [C5],
      [A3, E5], [C5], [A4], [E4], [C4], [A3],
      [A3, C5], [E4], [A4], [C5], [E5], [C5],
      [G3, D5], [B4], [G4], [D4], [B3], [G3],
      [C4, E5], [C5], [G4], [E4], [G4], [C5],
      [A3, A4], [E4], [C4], [A3], [E4], [A4],
    ],
  },
  {
    id: "rio-timbiqui",
    title: "Río Timbiquí",
    artist: "Grupo Canalón de Timbiquí",
    aire: "Juga bambuquiada",
    chords: "Sol · Do · Lam · Mim",
    detail:
      "No hay cifra pública. Juga en Sol y Do, el giro que usa la marimba cuando la frase baja al río y vuelve.",
    stepMs: 152,
    steps: [
      [G3, D5], [B4], [G4], [D5], [B4], [G4],
      [C4, E5], [C5], [G4], [E4], [G4], [C5],
      [A3, C5], [A4], [E4], [A4], [C5], [E4],
      [E3, B4], [G4], [E4], [G4], [B4], [E4],
      [G3, G4], [B4], [D5], [G5], [D5], [B4],
      [C4, C5], [E5], [G4], [C5], [E4], [G4],
      [A3, A4], [C5], [E4], [A4], [C4], [E4],
      [G3, D5], [B4], [G4], [D4], [B3], [G3],
    ],
  },
  {
    id: "gualajo",
    title: "Marimba de Gualajo",
    artist: "José Antonio Torres, Gualajo",
    aire: "Marimba de chonta",
    chords: "Lam · Sol · Do · Mim",
    detail:
      "No es una canción con cifra: es el modo de la marimba de Gualajo. El bordón va en el tiempo y la otra mano contesta en el contratiempo.",
    stepMs: 145,
    steps: [
      [A3], [E5], [C5], [A3], [A4], [E4],
      [A3], [G4], [E4], [G3], [D5], [B4],
      [C4], [E5], [G4], [C4], [C5], [G4],
      [E3], [B4], [G4], [A3], [C5], [A4],
      [A3], [C5], [E5], [A3], [G4], [E4],
      [G3], [D5], [B4], [G4], [D4], [B3],
      [C4], [G4], [C5], [E4], [G4], [C5],
      [A3], [E4], [C5], [A4], [E4], [A3],
    ],
  },
  {
    id: "mision",
    title: "Mi misión",
    artist: "Esteban Copete y su Kinteto Pacífico",
    aire: "Contemporánea",
    chords: "Lam · Fa · Do · Sol",
    detail:
      "No hay cifra publicada. Acompañamiento lento en La menor para tocar encima con la hilera completa.",
    stepMs: 380,
    steps: [
      ...four(A3, [C5, E4, A4, C5]),
      ...four(F3, [A4, C5, F4, A4]),
      ...four(C4, [G4, E4, C5, G4]),
      ...four(G3, [B4, D5, G4, D4]),
      ...four(A3, [A4, C4, E4, A3]),
    ],
  },
  {
    id: "pinal",
    title: "El puente del Piñal",
    artist: "La Revuelta",
    aire: "Fusión",
    chords: "Do · Sol · Lam · Fa",
    detail:
      "No hay cifra pública de esta fusión. Rueda en Do mayor para acompañar el estribillo en la marimba.",
    stepMs: 300,
    steps: [
      ...four(C3, [E4, G4, C5, E5]),
      ...four(G3, [D5, B4, G4, D5]),
      ...four(A3, [C5, E4, A4, C5]),
      ...four(F3, [A4, C5, F4, A4]),
      ...four(C4, [E5, C5, G4, E4]),
    ],
  },
  {
    id: "ser-querido",
    title: "Mi ser querido",
    artist: "De Mar y Río",
    aire: "Nueva propuesta",
    chords: "Lam · Rem · Sol · Do",
    detail:
      "No hay cifra pública. Arreglo en La menor, con el bajo en la mano izquierda y la frase en el medio.",
    stepMs: 360,
    steps: [
      ...four(A3, [E4, A4, C5, E4]),
      ...four(D3, [F4, A4, D4, F4]),
      ...four(G3, [B4, D5, G4, B4]),
      ...four(C4, [E4, G4, C5, E4]),
      ...four(A3, [C5, A4, E4, A3]),
    ],
  },
];

export const REFERENCIAS: Referencia[] = [
  { title: "Mi Buenaventura", artist: "Petronio Álvarez", aire: "Currulao" },
  { title: "Te vengo a cantar", artist: "Grupo Bahía", aire: "Aguabajo" },
  { title: "Quítate de mi escalera", artist: "Grupo Socavón de Timbiquí", aire: "Currulao" },
  { title: "La vamo' a tumba'", artist: "Grupo Saboreo", aire: "Bambazú" },
  { title: "El Birimbí", artist: "Grupo Bahía", aire: "Abosao" },
  { title: "Aguacerito llové", artist: "Grupo Naidy", aire: "Canto de boga" },
  { title: "Y qué?", artist: "Herencia de Timbiquí", aire: "Juga" },
  { title: "Río Timbiquí", artist: "Grupo Canalón de Timbiquí", aire: "Juga bambuquiada" },
  { title: "Música de Gualajo", artist: "José Antonio Torres, Gualajo", aire: "Marimba de chonta" },
  { title: "Mi misión", artist: "Esteban Copete y su Kinteto Pacífico", aire: "Contemporánea" },
  { title: "El puente del Piñal", artist: "La Revuelta", aire: "Fusión" },
  { title: "Mi ser querido", artist: "De Mar y Río", aire: "Nueva propuesta" },
];
