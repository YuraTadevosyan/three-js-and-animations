import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';

import { CAMERA_VIEWS } from '@/lib/config';
import { Car } from './Car';
import { Garage } from './Garage';
import { CameraRig } from './CameraRig';

const HERO = CAMERA_VIEWS[0];

export function CarScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: HERO.position, fov: 38, near: 0.1, far: 100 }}
    >
      <color attach="background" args={['#06070b']} />
      <fog attach="fog" args={['#06070b', 14, 30]} />

      <Suspense fallback={null}>
        <Garage />
        <Car />
        <CameraRig />

        <EffectComposer multisampling={4}>
          <Bloom
            intensity={0.7}
            luminanceThreshold={0.75}
            luminanceSmoothing={0.2}
            mipmapBlur
            kernelSize={KernelSize.LARGE}
          />
          <Vignette eskil={false} offset={0.25} darkness={0.85} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
