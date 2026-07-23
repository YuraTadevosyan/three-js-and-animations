/**
 * Global tunables for the endless drift. The universe is a corridor along the
 * -Z axis: the camera travels toward -Z forever and worlds are generated per
 * integer "slot" ahead of it, streamed in and out of a fixed-size pool so the
 * cosmos feels boundless while only a couple dozen worlds ever exist at once.
 */
export const UNIVERSE = {
  /** Distance between consecutive world slots along the travel axis. */
  slotSpacing: 46,
  /** How many slots live in the active pool (the visible corridor depth). */
  poolSize: 26,
  /** How many pooled slots sit behind the camera vs. ahead of it. */
  slotsBehind: 4,
  /** Min / max radial distance of a world from the travel axis. */
  minRadius: 11,
  maxRadius: 62,
  /** Camera wander amplitude (organic simplex drift off the axis). */
  wanderAmp: 3.4,
  /** Base cruise speed in world-units / second. */
  baseSpeed: 15,
  /** Speed multipliers the user can toggle through. */
  speedLevels: [0.4, 1, 2.2, 4] as const,
  /** Multiplier applied during a hyperspace / warp jump. */
  warpMultiplier: 9,
  /** Fog start / end so distant worlds dissolve into the nebula. */
  fogNear: 60,
  fogFar: 520,
  /** How far ahead the camera aims (look-at target distance). */
  lookAhead: 60,
} as const;

/** Rough types a slot can resolve to, with their relative weights. */
export const WORLD_WEIGHTS: Record<string, number> = {
  planet: 46,
  island: 24,
  gas: 18,
  crystal: 9,
  monolith: 3, // the rare easter-egg world
};

export const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
] as const;
