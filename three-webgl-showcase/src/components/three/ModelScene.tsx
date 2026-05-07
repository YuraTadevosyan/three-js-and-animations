import { Canvas, useFrame } from '@react-three/fiber';
import {
  Environment,
  Float,
  MeshDistortMaterial,
  OrbitControls,
  PerspectiveCamera,
} from '@react-three/drei';
import { useRef } from 'react';
import { Mesh } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function MorphingBlob({ color }: { color: string }) {
  const ref = useRef<Mesh>(null);
  const reduced = useReducedMotion();

  useFrame(({ clock }) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.25;
  });

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <icosahedronGeometry args={[1.2, 64]} />
      <MeshDistortMaterial
        color={color}
        distort={0.45}
        speed={1.6}
        roughness={0.1}
        metalness={0.6}
      />
    </mesh>
  );
}

export default function ModelScene() {
  return (
    <Canvas shadows dpr={[1, 1.75]} gl={{ antialias: true }}>
      <PerspectiveCamera makeDefault position={[0, 0.4, 4]} fov={45} />
      <color attach="background" args={['#0b0b14']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} castShadow />

      <Float rotationIntensity={0.4} floatIntensity={0.6} speed={1.4}>
        <MorphingBlob color="#22d3ee" />
      </Float>

      <Environment preset="studio" />
      <OrbitControls enablePan={false} enableZoom minDistance={3} maxDistance={6} />
    </Canvas>
  );
}
