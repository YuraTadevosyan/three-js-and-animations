import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Vignette,
} from '@react-three/postprocessing';
import { useUniverse } from '@/state/universeStore';

// Structural types for just the bits we drive per frame — avoids depending on
// `postprocessing` directly (it's a transitive dep of the R3F wrapper).
type BloomHandle = { intensity: number };
type ChromaHandle = { offset: THREE.Vector2 };

/**
 * Post pipeline that sells the dynamic lighting: bloom lifts every emissive
 * core, atmosphere rim and light-thread into a glow, and both bloom and
 * chromatic aberration surge during a warp jump.
 */
export function Effects() {
  const { shared } = useUniverse();
  const bloom = useRef<BloomHandle | null>(null);
  const chroma = useRef<ChromaHandle | null>(null);
  const baseOffset = useMemo(() => new THREE.Vector2(0.0006, 0.0006), []);

  useFrame(() => {
    const w = shared.warp;
    if (bloom.current) bloom.current.intensity = 0.85 + w * 2.4;
    if (chroma.current) {
      const o = 0.0006 + w * 0.005;
      chroma.current.offset.set(o, o);
    }
  });

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        ref={bloom as never}
        intensity={0.85}
        luminanceThreshold={0.22}
        luminanceSmoothing={0.5}
        mipmapBlur
      />
      <ChromaticAberration
        ref={chroma as never}
        offset={baseOffset}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette offset={0.28} darkness={0.9} />
    </EffectComposer>
  );
}
