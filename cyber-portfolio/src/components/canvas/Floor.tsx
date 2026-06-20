'use client';

import { Grid } from '@react-three/drei';

/**
 * Endless neon floor grid — the Blade Runner "wet-street" plane the whole
 * scene sits on. drei's <Grid> renders it on the GPU with distance fade, so
 * it stays cheap even when it visually stretches to the horizon.
 */
export function Floor() {
  return (
    <Grid
      position={[0, -0.6, 0]}
      args={[60, 60]}
      cellSize={0.6}
      cellThickness={0.6}
      cellColor="#0a3a4a"
      sectionSize={3}
      sectionThickness={1.1}
      sectionColor="#00f0ff"
      fadeDistance={34}
      fadeStrength={1.4}
      followCamera={false}
      infiniteGrid
    />
  );
}
