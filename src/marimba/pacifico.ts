export type Estudio = {
  id: string;
  title: string;
  aire: string;
  detail: string;
  stepMs: number;
  steps: number[][];
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
    stepMs: 280,
    steps: [
      [48, 72], [71], [69], [67],
      [48, 65], [64], [62], [60],
      [50, 69], [67], [65], [64],
      [48, 67], [65], [64], [60],
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
