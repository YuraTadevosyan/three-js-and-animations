// Honours roll. Counts reflect the cabinet at the start of the 2026-27
// season — the 2025-26 double of La Liga (29th) and the Supercopa de España
// (16th) is included. Sourced from the honours table on the FC Barcelona
// Wikipedia article.
//
// `tier` drives the visual emphasis in the section: domestic / european /
// global gets a different accent line on the tile.
export type TrophyTier = 'domestic' | 'european' | 'global';

export type Trophy = {
  name: string;
  short: string;
  count: number;
  tier: TrophyTier;
  // First year FCB won this competition — used as a small caption.
  since: number;
};

export const TROPHIES: Trophy[] = [
  { name: 'La Liga',                   short: 'LaLiga',      count: 29, tier: 'domestic', since: 1929 },
  { name: 'Copa del Rey',              short: 'Copa',        count: 32, tier: 'domestic', since: 1910 },
  { name: 'Supercopa de España',       short: 'Supercopa',   count: 16, tier: 'domestic', since: 1983 },
  { name: 'UEFA Champions League',     short: 'UCL',         count: 5,  tier: 'european', since: 1992 },
  { name: 'UEFA Cup Winners’ Cup',     short: 'Cup Winners', count: 4,  tier: 'european', since: 1979 },
  { name: 'UEFA Super Cup',            short: 'Super Cup',   count: 5,  tier: 'european', since: 1992 },
  { name: 'FIFA Club World Cup',       short: 'Club WC',     count: 3,  tier: 'global',   since: 2009 },
];

export const TROPHIES_TOTAL = TROPHIES.reduce((s, t) => s + t.count, 0);
