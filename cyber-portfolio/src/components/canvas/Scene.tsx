'use client';

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { useScene } from '@/store/useScene';
import { useIsMobile, usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { CameraRig } from './CameraRig';
import { Particles } from './Particles';
import { Workspace } from './Workspace';
import { Floor } from './Floor';
import { Effects } from './Effects';

/**
 * The full-screen WebGL backdrop. Everything scroll-driven reads from the
 * scene store, so this tree never re-renders on scroll — it just animates in
 * useFrame, which is what keeps the frame budget low.
 */
export default function Scene() {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();
  const setReady = useScene((s) => s.setReady);
  const setReducedMotion = useScene((s) => s.setReducedMotion);

  // Scale rendering down if the GPU can't keep up; bump back when it recovers.
  const [dpr, setDpr] = useState<number>(isMobile ? 1 : 1.5);

  return (
    <Canvas
      className="!fixed inset-0"
      dpr={dpr}
      gl={{
        antialias: !isMobile,
        powerPreference: 'high-performance',
        alpha: false,
      }}
      camera={{ fov: 45, near: 0.1, far: 100, position: [0, 1.55, 9] }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.fog = new THREE.FogExp2('#04060d', 0.045);
        setReducedMotion(reducedMotion);
        setReady(true);
      }}
    >
      <color attach="background" args={['#04060d']} />

      {/* Lighting: moody key + neon rim lights. */}
      <ambientLight intensity={0.25} />
      <hemisphereLight args={['#1b6bff', '#04060d', 0.35]} />
      <spotLight
        position={[0, 7, 4]}
        angle={0.6}
        penumbra={0.8}
        intensity={28}
        color="#ffffff"
        distance={30}
      />
      <pointLight position={[-6, 2, 3]} intensity={40} color="#00f0ff" distance={22} />
      <pointLight position={[6, 2, 2]} intensity={40} color="#ff2bd6" distance={22} />

      <CameraRig />
      <Workspace />
      <Floor />
      <Particles count={isMobile ? 380 : 900} />

      <Effects enabled={!isMobile} />

      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(0.75, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(isMobile ? 1.5 : 2, d + 0.25))}
      />
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
