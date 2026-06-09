import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';
import { ACESFilmicToneMapping } from 'three';

import { CAMERA_VIEWS } from '@/lib/config';
import { CarModel } from './CarModel';
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
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
    >
      <color attach="background" args={['#06070b']} />
      <fog attach="fog" args={['#06070b', 16, 34]} />

      <Suspense fallback={null}>
        <Garage />
        <CarModel />
        <CameraRig />

        <EffectComposer multisampling={4}>
          <Bloom
            intensity={0.55}
            luminanceThreshold={0.8}
            luminanceSmoothing={0.25}
            mipmapBlur
            kernelSize={KernelSize.LARGE}
          />
          <Vignette eskil={false} offset={0.35} darkness={0.6} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
