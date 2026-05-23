import { clamp, rand } from './math';

export type Accent = 'cyan' | 'violet' | 'pink' | 'amber' | 'lime';

/** Visual variants — each renders a different layout inside `PhysicsCard`. */
export type CardKind = 'feature' | 'stat' | 'pill' | 'icon' | 'toggle';

export type IconName = 'cursor' | 'bolt' | 'layers';

export interface CardDef {
  id: string;
  kind: CardKind;
  /** Width / height in CSS pixels — already multiplied by the layout scale. */
  w: number;
  h: number;
  accent: Accent;
  title?: string;
  body?: string;
  icon?: IconName;
}

export interface OrbDef {
  id: string;
  /** Radius in CSS pixels, already scaled. */
  r: number;
  accent: Accent;
}

export interface Layout {
  /** 0.46 .. 1 — shrinks every body so the playground fits small screens. */
  scale: number;
  cards: CardDef[];
  orbs: OrbDef[];
}

/** Accent colour lookup — `hex` for solid fills, `rgb` for alpha glows. */
export const ACCENTS: Record<Accent, { hex: string; rgb: string }> = {
  cyan: { hex: '#22d3ee', rgb: '34, 211, 238' },
  violet: { hex: '#818cf8', rgb: '129, 140, 248' },
  pink: { hex: '#f472b6', rgb: '244, 114, 182' },
  amber: { hex: '#fbbf24', rgb: '251, 191, 36' },
  lime: { hex: '#a3e635', rgb: '163, 230, 53' },
};

/** Card content + base (unscaled) sizes. The set is intentionally varied so
 *  collisions between different shapes stay visually interesting. */
const CARD_BLUEPRINT: CardDef[] = [
  {
    id: 'feat-drag',
    kind: 'feature',
    w: 252,
    h: 152,
    accent: 'violet',
    title: 'Drag me around',
    body: 'Every card is a Matter.js rigid body.',
  },
  {
    id: 'feat-magnet',
    kind: 'feature',
    w: 232,
    h: 140,
    accent: 'cyan',
    title: 'Magnetic cursor',
    body: 'The cursor bends toward interactive UI.',
  },
  {
    id: 'feat-elastic',
    kind: 'feature',
    w: 222,
    h: 134,
    accent: 'pink',
    title: 'Elastic hover',
    body: 'Hover a card for a springy GSAP pop.',
  },
  {
    id: 'stat-fps',
    kind: 'stat',
    w: 142,
    h: 142,
    accent: 'lime',
    title: '60',
    body: 'fps target',
  },
  {
    id: 'stat-rest',
    kind: 'stat',
    w: 134,
    h: 134,
    accent: 'amber',
    title: '0.9',
    body: 'restitution',
  },
  {
    id: 'pill-collide',
    kind: 'pill',
    w: 198,
    h: 58,
    accent: 'amber',
    title: 'Dynamic collisions',
  },
  {
    id: 'pill-interp',
    kind: 'pill',
    w: 214,
    h: 58,
    accent: 'cyan',
    title: 'Smooth interpolation',
  },
  {
    id: 'pill-mobile',
    kind: 'pill',
    w: 156,
    h: 58,
    accent: 'lime',
    title: 'Mobile ready',
  },
  { id: 'icon-cursor', kind: 'icon', w: 86, h: 86, accent: 'violet', icon: 'cursor' },
  { id: 'icon-bolt', kind: 'icon', w: 86, h: 86, accent: 'pink', icon: 'bolt' },
  { id: 'icon-layers', kind: 'icon', w: 86, h: 86, accent: 'cyan', icon: 'layers' },
  {
    id: 'toggle-grav',
    kind: 'toggle',
    w: 170,
    h: 76,
    accent: 'amber',
    title: 'Gravity',
  },
];

const ORB_ACCENTS: Accent[] = ['cyan', 'violet', 'pink', 'amber', 'lime'];

/**
 * Build a scaled layout for the current viewport. Card sizes shrink on small
 * screens so the whole set still fits inside the walls on a phone.
 */
export function buildLayout(
  viewportW: number,
  viewportH: number,
  reducedMotion: boolean,
): Layout {
  const scale = clamp(Math.min(viewportW / 980, viewportH / 720), 0.46, 1);

  const cards: CardDef[] = CARD_BLUEPRINT.map((c) => ({
    ...c,
    w: Math.round(c.w * scale),
    h: Math.round(c.h * scale),
  }));

  // Fewer orbs when the user prefers reduced motion or the screen is tiny.
  const orbCount = reducedMotion ? 4 : viewportW < 560 ? 7 : 10;
  const orbs: OrbDef[] = Array.from({ length: orbCount }, (_, i) => ({
    id: `orb-${i}`,
    r: Math.round(rand(15, 30) * scale),
    accent: ORB_ACCENTS[i % ORB_ACCENTS.length],
  }));

  return { scale, cards, orbs };
}
