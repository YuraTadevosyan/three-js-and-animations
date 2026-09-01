// La Masia graduates currently in the first team. Each entry references a
// player from SQUAD by name (resolved at render) and adds the year they
// debuted for the senior side — the one piece of biographical context the
// squad data doesn't already carry.
//
// 2026-27 revision: Marc Casadó dropped out of the first-team list over the
// summer, and Pedri was removed because he isn't actually an academy product
// — he came to Barça from Las Palmas at seventeen and went straight into the
// senior side. In their place, two genuine La Masia holding players: Marc
// Bernal and Xavi Espart, promoted to the senior squad in August 2026.
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
    note: 'Debuted at 15 years, 290 days — the youngest Barça first-teamer of the modern era. Now wears the ten.',
  },
  {
    name: 'Pau Cubarsí',
    debut: 2024,
    note: 'Centre-back called up to the senior side at 16. With Araújo gone, the back line is his to organise.',
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
    name: 'Marc Bernal',
    debut: 2024,
    note: 'Holding midfielder who broke through at 17, lost a season to a cruciate injury, and now learns the pivot behind Rodri.',
  },
  {
    name: 'Xavi Espart',
    debut: 2026,
    note: 'In La Masia since he was eight. Champions League debut at Newcastle, then the number 12 shirt in August 2026.',
  },
];
