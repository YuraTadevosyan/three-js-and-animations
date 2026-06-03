// Canonical 2025-26 4-3-3 starting XI. Each slot references a player by
// name (resolved at render against SQUAD) and an x/y position as a 0..100
// percentage inside the pitch SVG (origin top-left, attacking up).
import { SQUAD, type Player } from './squad';

export type Slot = {
  role: 'GK' | 'LB' | 'RB' | 'LCB' | 'RCB' | 'CDM' | 'LCM' | 'RCM' | 'LW' | 'ST' | 'RW';
  label: string;
  name: string;
  x: number;
  y: number;
};

// Positions are tuned by eye on a 100×100 pitch. Goalkeeper at the bottom,
// forwards near the top edge.
export const LINEUP: Slot[] = [
  { role: 'GK',  label: 'GK', name: 'Joan Garcia',       x: 50, y: 90 },
  { role: 'LB',  label: 'LB', name: 'Alejandro Balde',   x: 12, y: 70 },
  { role: 'LCB', label: 'CB', name: 'Pau Cubarsí',       x: 35, y: 75 },
  { role: 'RCB', label: 'CB', name: 'Ronald Araújo',     x: 65, y: 75 },
  { role: 'RB',  label: 'RB', name: 'Jules Koundé',      x: 88, y: 70 },
  { role: 'CDM', label: 'DM', name: 'Frenkie de Jong',   x: 50, y: 55 },
  { role: 'LCM', label: 'CM', name: 'Pedri',             x: 30, y: 42 },
  { role: 'RCM', label: 'CM', name: 'Dani Olmo',         x: 70, y: 42 },
  { role: 'LW',  label: 'LW', name: 'Lamine Yamal',      x: 18, y: 22 },
  { role: 'ST',  label: 'ST', name: 'Robert Lewandowski', x: 50, y: 18 },
  { role: 'RW',  label: 'RW', name: 'Raphinha',          x: 82, y: 22 },
];

// Lookup helper — keeps Lineup section thin. Returns the SQUAD entry whose
// name matches, with a small tolerance for the diacritic-stripping the
// existing squad data already does correctly.
export function resolvePlayer(name: string): Player | undefined {
  return SQUAD.find((p) => p.name === name);
}
