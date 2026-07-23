import type { Rng } from './rng';

/** Syllable pools for No Man's Sky-style procedural system names. */
const PREFIX = [
  'Xa',
  'Vor',
  'Ael',
  'Zy',
  'Oru',
  'Cael',
  'Nyx',
  'Tor',
  'Lys',
  'Quor',
  'Ith',
  'Bre',
  'Sol',
  'Vael',
  'Ossu',
  'Kae',
];
const MID = [
  'ndar',
  'ther',
  'lios',
  'phae',
  'ryn',
  'goro',
  'mira',
  'vex',
  'lune',
  'dros',
  'thys',
  'kar',
  'zephy',
  'oris',
];
const SUFFIX = [
  'a',
  'is',
  'on',
  'us',
  'ex',
  'ia',
  'or',
  'eth',
  'yx',
  'une',
  'ara',
  ' os',
];

/** Deterministically name a world and give it a catalogue designation. */
export function makeName(rng: Rng): { name: string; designation: string } {
  const name =
    rng.pick(PREFIX) +
    (rng.chance(0.6) ? rng.pick(MID) : '') +
    rng.pick(SUFFIX);
  const clean = name.replace(/\s+/g, '');
  const designation = `${rng.pick(['XR', 'HD', 'GJ', 'KOI', 'PSR', 'NGC'])}-${rng.int(
    100,
    9999,
  )}${rng.pick(['', 'b', 'c', 'd', ' Prime'])}`;
  return {
    name: clean.charAt(0).toUpperCase() + clean.slice(1),
    designation,
  };
}
