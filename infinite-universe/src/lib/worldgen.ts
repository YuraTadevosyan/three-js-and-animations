import * as THREE from 'three';
import { UNIVERSE, WORLD_WEIGHTS } from './config';
import { hashInt, makeRng } from './rng';
import {
  BIOME_KEYS,
  biomeEmissiveStrength,
  makePalette,
  type Palette,
} from './palette';
import { makeName } from './names';

export type WorldType = 'planet' | 'island' | 'gas' | 'crystal' | 'monolith';

/** Numeric flag handed to the surface shader (monolith is drawn separately). */
export const TYPE_FLAG: Record<Exclude<WorldType, 'monolith'>, number> = {
  planet: 0,
  island: 1,
  gas: 2,
  crystal: 3,
};

export interface WorldDesc {
  slot: number;
  seed: number;
  name: string;
  designation: string;
  type: WorldType;
  biome: string;
  biomeName: string;
  position: THREE.Vector3;
  /** Base radius (monoliths reuse this as their height scale). */
  size: number;
  palette: Palette;
  /** GLSL displacement controls. */
  noiseFreq: number;
  noiseAmp: number;
  emissive: number;
  /** Rotation. */
  spinSpeed: number;
  spinAxis: THREE.Vector3;
  tilt: number;
  /** Organic vertical bob. */
  bobAmp: number;
  bobSpeed: number;
  bobPhase: number;
  /** Ring system. */
  ring: null | {
    inner: number;
    outer: number;
    color: THREE.Color;
    tilt: THREE.Euler;
  };
  /** The rare easter-egg world. */
  isEgg: boolean;
  /** Secret revealed when a monolith is scanned. */
  secret?: string;
}

const SECRETS = [
  'You are not lost. You are simply everywhere at once.',
  'Every horizon you chase becomes the ground beneath the next.',
  'The universe kept no beginning for you — so you may not need an end.',
  'Between two worlds there is always a thread. Follow it.',
  'What you call distance, light calls a moment.',
  'Some travellers stop looking for the edge and start becoming it.',
];

const _axis = new THREE.Vector3();

/** Fully deterministic: the same slot always yields the same world. */
export function worldFromSlot(slot: number): WorldDesc {
  const seed = hashInt(slot * 2654435761);
  const rng = makeRng(seed);

  const type = rng.weighted(WORLD_WEIGHTS) as WorldType;
  const biome = rng.pick(BIOME_KEYS);
  const palette = makePalette(biome, rng);

  // Place the world on a flattened disc around the travel axis.
  const angle = rng.range(0, Math.PI * 2);
  const radius =
    UNIVERSE.minRadius +
    (UNIVERSE.maxRadius - UNIVERSE.minRadius) * Math.pow(rng.next(), 1.5);
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius * 0.62 + rng.range(-6, 6);
  const z = -slot * UNIVERSE.slotSpacing;

  const isEgg = type === 'monolith';

  // Size per type.
  let size: number;
  if (type === 'gas') size = rng.range(4.2, 6.8);
  else if (type === 'island') size = rng.range(2.6, 4.4);
  else if (type === 'monolith') size = rng.range(3.4, 4.6);
  else size = rng.range(2.4, 5.2);

  // Displacement — gas giants are smooth banded, crystals jagged, islands rough.
  let noiseFreq = rng.range(1.4, 2.6);
  let noiseAmp = rng.range(0.1, 0.22);
  if (type === 'gas') {
    noiseFreq = rng.range(0.8, 1.4);
    noiseAmp = rng.range(0.02, 0.05);
  } else if (type === 'crystal') {
    noiseFreq = rng.range(2.4, 3.6);
    noiseAmp = rng.range(0.22, 0.4);
  } else if (type === 'island') {
    noiseFreq = rng.range(1.8, 3.0);
    noiseAmp = rng.range(0.18, 0.34);
  }

  const emissive =
    biomeEmissiveStrength(biome) * (type === 'crystal' ? 1.4 : 1) +
    (type === 'crystal' ? 0.6 : 0);

  // Spin.
  _axis.set(rng.range(-0.3, 0.3), 1, rng.range(-0.3, 0.3)).normalize();
  const spinAxis = _axis.clone();
  const spinSpeed = rng.range(0.04, 0.2) * (rng.chance(0.5) ? 1 : -1);
  const tilt = rng.range(-0.5, 0.5);

  // Bob.
  const bobAmp = size * rng.range(0.04, 0.12);
  const bobSpeed = rng.range(0.15, 0.4);
  const bobPhase = rng.range(0, Math.PI * 2);

  // Rings — planets & gas giants only.
  const wantsRing =
    (type === 'planet' || type === 'gas') && rng.chance(type === 'gas' ? 0.6 : 0.3);
  const ring = wantsRing
    ? {
        inner: size * rng.range(1.35, 1.6),
        outer: size * rng.range(1.9, 2.6),
        color: palette.atmosphere.clone(),
        tilt: new THREE.Euler(
          Math.PI / 2 + rng.range(-0.5, 0.5),
          rng.range(-0.4, 0.4),
          rng.range(-0.4, 0.4),
        ),
      }
    : null;

  const { name, designation } = makeName(rng);

  return {
    slot,
    seed,
    name,
    designation,
    type,
    biome,
    biomeName: isEgg ? 'Anomaly' : biomeNameFor(biome),
    position: new THREE.Vector3(x, y, z),
    size,
    palette,
    noiseFreq,
    noiseAmp,
    emissive,
    spinSpeed,
    spinAxis,
    tilt,
    bobAmp,
    bobSpeed,
    bobPhase,
    ring,
    isEgg,
    secret: isEgg ? SECRETS[Math.abs(slot) % SECRETS.length] : undefined,
  };
}

function biomeNameFor(biome: string): string {
  // Lazy re-import avoidance: mirror the display names.
  const map: Record<string, string> = {
    ocean: 'Oceanic',
    verdant: 'Verdant',
    desert: 'Arid',
    ice: 'Glacial',
    lava: 'Molten',
    toxic: 'Irradiated',
    amethyst: 'Amethyst',
    rose: 'Coral',
  };
  return map[biome] ?? 'Unknown';
}
