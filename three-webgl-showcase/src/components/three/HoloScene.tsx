import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, Color, DoubleSide, ShaderMaterial } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

import vertexShader from '@/shaders/holo.vert.glsl?raw';
import fragmentShader from '@/shaders/holo.frag.glsl?raw';

function HoloMesh() {
  const matRef = useRef<ShaderMaterial>(null);
  const reduced = useReducedMotion();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new Color('#22d3ee') },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (!matRef.current || reduced) return;
    matRef.current.uniforms.uTime.value += delta;
  });

  return (
    <group>
      {/* Outer holographic shell (additive, transparent) */}
      <mesh>
        <icosahedronGeometry args={[1.2, 8]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={DoubleSide}
          blending={AdditiveBlending}
        />
      </mesh>
      {/* Inner solid core for silhouette */}
      <mesh>
        <icosahedronGeometry args={[0.55, 2]} />
        <meshBasicMaterial color="#0e7490" wireframe />
      </mesh>
    </group>
  );
}

export default function HoloScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4], fov: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.3} />
      <HoloMesh />
      <OrbitControls
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.6}
        minDistance={2.5}
        maxDistance={6}
      />
    </Canvas>
  );
}
