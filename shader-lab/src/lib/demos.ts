import type { DemoDef, Params } from './types';
import { waterDemo } from '@/demos/Water';
import { noiseDemo } from '@/demos/NoiseDistortion';
import { plasmaDemo } from '@/demos/Plasma';
import { voronoiDemo } from '@/demos/Voronoi';
import { kaleidoscopeDemo } from '@/demos/Kaleidoscope';
import { hologramDemo } from '@/demos/Hologram';
import { particlesDemo } from '@/demos/Particles';

export const DEMOS: DemoDef[] = [
  waterDemo,
  noiseDemo,
  plasmaDemo,
  voronoiDemo,
  kaleidoscopeDemo,
  hologramDemo,
  particlesDemo,
];

export const DEMO_BY_ID: Record<string, DemoDef> = Object.fromEntries(
  DEMOS.map((d) => [d.id, d]),
);

export function defaultParamsFor(demo: DemoDef): Params {
  const out: Params = {};
  for (const c of demo.controls) {
    out[c.key] = c.default;
  }
  return out;
}
