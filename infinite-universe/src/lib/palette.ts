import * as THREE from 'three';
import type { Rng } from './rng';

/**
 * A world's colour scheme, sampled by the surface shader across elevation:
 * low → mid → high, plus a rim `atmosphere` glow and an optional `emissive`
 * (self-lit lava / crystal cores).
 */
export interface Palette {
  low: THREE.Color;
  mid: THREE.Color;
  high: THREE.Color;
  atmosphere: THREE.Color;
  emissive: THREE.Color;
  /** Hex accent used by the HUD / connection lines for this world. */
  accent: string;
}

interface Biome {
  name: string;
  hue: [number, number];
  low: [number, number]; // [sat, light] for the low band
  mid: [number, number];
  high: [number, number];
  atmoHueShift: number;
  emissiveHueShift: number;
  emissiveStrength: number;
}

/** Hand-tuned biome archetypes — each gives a whole family of worlds. */
export const BIOMES: Record<string, Biome> = {
  ocean: {
    name: 'Oceanic',
    hue: [0.54, 0.62],
    low: [0.85, 0.16],
    mid: [0.7, 0.42],
    high: [0.35, 0.86],
    atmoHueShift: -0.04,
    emissiveHueShift: 0,
    emissiveStrength: 0,
  },
  verdant: {
    name: 'Verdant',
    hue: [0.26, 0.4],
    low: [0.6, 0.2],
    mid: [0.7, 0.4],
    high: [0.2, 0.88],
    atmoHueShift: 0.08,
    emissiveHueShift: 0,
    emissiveStrength: 0,
  },
  desert: {
    name: 'Arid',
    hue: [0.06, 0.12],
    low: [0.7, 0.32],
    mid: [0.6, 0.5],
    high: [0.25, 0.9],
    atmoHueShift: 0.02,
    emissiveHueShift: 0,
    emissiveStrength: 0,
  },
  ice: {
    name: 'Glacial',
    hue: [0.52, 0.6],
    low: [0.35, 0.55],
    mid: [0.2, 0.78],
    high: [0.05, 0.97],
    atmoHueShift: 0.0,
    emissiveHueShift: 0,
    emissiveStrength: 0,
  },
  lava: {
    name: 'Molten',
    hue: [0.02, 0.08],
    low: [0.6, 0.12],
    mid: [0.9, 0.42],
    high: [1.0, 0.62],
    atmoHueShift: -0.02,
    emissiveHueShift: 0.0,
    emissiveStrength: 1.6,
  },
  toxic: {
    name: 'Irradiated',
    hue: [0.2, 0.32],
    low: [0.7, 0.16],
    mid: [0.85, 0.44],
    high: [0.9, 0.72],
    atmoHueShift: 0.02,
    emissiveHueShift: 0.02,
    emissiveStrength: 0.9,
  },
  amethyst: {
    name: 'Amethyst',
    hue: [0.72, 0.82],
    low: [0.7, 0.2],
    mid: [0.75, 0.46],
    high: [0.55, 0.82],
    atmoHueShift: 0.06,
    emissiveHueShift: 0.0,
    emissiveStrength: 0.7,
  },
  rose: {
    name: 'Coral',
    hue: [0.92, 0.99],
    low: [0.7, 0.24],
    mid: [0.75, 0.5],
    high: [0.5, 0.86],
    atmoHueShift: 0.04,
    emissiveHueShift: 0,
    emissiveStrength: 0.2,
  },
};

export const BIOME_KEYS = Object.keys(BIOMES);

function hsl(h: number, s: number, l: number): THREE.Color {
  return new THREE.Color().setHSL((h % 1 + 1) % 1, s, l);
}

/** Build a concrete palette for a biome, jittered by the world's RNG. */
export function makePalette(biomeKey: string, rng: Rng): Palette {
  const b = BIOMES[biomeKey] ?? BIOMES.ocean;
  const h = rng.range(b.hue[0], b.hue[1]);
  const jitter = () => rng.range(-0.02, 0.02);

  const low = hsl(h + jitter(), b.low[0], b.low[1]);
  const mid = hsl(h + jitter(), b.mid[0], b.mid[1]);
  const high = hsl(h + jitter(), b.high[0], b.high[1]);
  const atmosphere = hsl(h + b.atmoHueShift, 0.8, 0.6);
  const emissive =
    b.emissiveStrength > 0
      ? hsl(h + b.emissiveHueShift, 0.95, 0.55)
      : new THREE.Color(0, 0, 0);

  return {
    low,
    mid,
    high,
    atmosphere,
    accent: `#${atmosphere.getHexString()}`,
    emissive,
  };
}

export function biomeEmissiveStrength(biomeKey: string): number {
  return (BIOMES[biomeKey] ?? BIOMES.ocean).emissiveStrength;
}
