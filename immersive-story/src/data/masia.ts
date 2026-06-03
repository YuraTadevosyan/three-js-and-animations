// La Masia graduates currently in the first team. Each entry references a
// player from SQUAD by name (resolved at render) and adds the year they
// debuted for the senior side — the one piece of biographical context the
// squad data doesn't already carry.
export type MasiaEntry = {
  name: string;
  // Year of senior-team debut (matchday, not signing).
  debut: number;
  // One-line callout shown under the name.
  note: string;
};

export const MASIA: MasiaEntry[] = [
  {
    name: 'Lamine Yamal',
    debut: 2023,
    note: 'Debuted at 15 years, 290 days — the youngest Barça first-teamer of the modern era.',
  },
  {
    name: 'Pau Cubarsí',
    debut: 2024,
    note: 'Centre-back called up to the senior side at 16. The next pillar in the Barça back line.',
  },
  {
    name: 'Pedri',
    debut: 2020,
    note: 'Tempo-setter. The first eight-time winner of the Kopa Trophy nominee in club history.',
  },
  {
    name: 'Gavi',
    debut: 2021,
    note: 'Pressed his way into the XI at 17. Spain international before his first contract renewal.',
  },
  {
    name: 'Alejandro Balde',
    debut: 2021,
    note: 'Left-back, raised through the academy after joining Barça at 14 from Espanyol.',
  },
  {
    name: 'Marc Casadó',
    debut: 2024,
    note: 'Holding midfielder out of La Masia — pulled into the senior side at 20 after a Barça Atlètic season.',
  },
];
