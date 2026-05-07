import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { Color, ShaderMaterial } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

import vertexShader from '@/shaders/wave.vert.glsl?raw';
import fragmentShader from '@/shaders/wave.frag.glsl?raw';

function WavePlane() {
  const matRef = useRef<ShaderMaterial>(null);
  const reduced = useReducedMotion();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new Color('#1e1b4b') },
      uColorB: { value: new Color('#a78bfa') },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (!matRef.current || reduced) return;
    matRef.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh rotation={[-Math.PI / 3, 0, 0]}>
      <planeGeometry args={[6, 6, 128, 128]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function ShaderScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.6, 3.5], fov: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#09090b']} />
      <WavePlane />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
}
