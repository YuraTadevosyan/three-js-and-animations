'use client';

import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

/**
 * Post chain that sells the neon: bloom for the glow, a touch of chromatic
 * aberration + film noise for the Blade Runner CRT vibe, and a vignette to
 * pull focus to the centre. multisampling=0 keeps it light.
 */
export function Effects({ enabled = true }: { enabled?: boolean }) {
  if (!enabled) return null;
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.9}
        luminanceThreshold={0.22}
        luminanceSmoothing={0.5}
        mipmapBlur
        radius={0.7}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0008, 0.0012)}
        radialModulation={false}
        modulationOffset={0}
      />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
      <Vignette eskil={false} offset={0.25} darkness={0.85} />
    </EffectComposer>
  );
}
