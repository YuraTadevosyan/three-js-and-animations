// Hand-picked nights that defined the club's modern era. Kept typographic
// rather than photo-driven — the section renders these as big year + result
// panels and skips the licensing question entirely.
export type Moment = {
  year: number;
  date: string;
  competition: string;
  score: string;
  opponent: string;
  venue: string;
  title: string;
  caption: string;
};

export const MOMENTS: Moment[] = [
  {
    year: 1992,
    date: '20 May 1992',
    competition: 'European Cup Final',
    score: '1 – 0',
    opponent: 'Sampdoria',
    venue: 'Wembley · London',
    title: 'The first star.',
    caption:
      "Cruyff's Dream Team — Koeman's free-kick in extra time finally wins Europe's biggest prize for Barça.",
  },
  {
    year: 2009,
    date: '2 May 2009',
    competition: 'La Liga',
    score: '6 – 2',
    opponent: 'Real Madrid',
    venue: 'Santiago Bernabéu · Madrid',
    title: "Pep's manita at the Bernabéu.",
    caption:
      'Henry, Messi, Puyol, Piqué and Xavi tear Madrid apart in their own stadium on the way to the historic sextuple.',
  },
  {
    year: 2009,
    date: '27 May 2009',
    competition: 'UEFA Champions League Final',
    score: '2 – 0',
    opponent: 'Manchester United',
    venue: 'Stadio Olimpico · Rome',
    title: 'The treble is born.',
    caption:
      "Eto'o and Messi seal Pep's first Champions League — the year ends with all six available trophies in the cabinet.",
  },
  {
    year: 2011,
    date: '28 May 2011',
    competition: 'UEFA Champions League Final',
    score: '3 – 1',
    opponent: 'Manchester United',
    venue: 'Wembley · London',
    title: 'Tiki-taka, immortalised.',
    caption:
      "Pep's side keeps the ball for ninety minutes. Pedro, Messi and Villa score. Ferguson calls them the best he has ever faced.",
  },
  {
    year: 2015,
    date: '6 June 2015',
    competition: 'UEFA Champions League Final',
    score: '3 – 1',
    opponent: 'Juventus',
    venue: 'Olympiastadion · Berlin',
    title: 'The second treble.',
    caption:
      'MSN — Messi, Suárez, Neymar — finish the season with 122 goals between them. Lucho lifts a treble in his first year.',
  },
  {
    year: 2017,
    date: '8 March 2017',
    competition: 'UCL Round of 16, 2nd leg',
    score: '6 – 1',
    opponent: 'Paris Saint-Germain',
    venue: 'Camp Nou · Barcelona',
    title: 'La Remontada.',
    caption:
      'Three down from Paris. Sergi Roberto in the 95th. Camp Nou unleashes the loudest night in its history.',
  },
];
