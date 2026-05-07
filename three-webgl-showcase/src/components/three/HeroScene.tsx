import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows } from '@react-three/drei';
import { useRef } from 'react';
import { Mesh } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function SpinningTorus() {
  const ref = useRef<Mesh>(null);
  const reduced = useReducedMotion();

  useFrame((_, delta) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.x += delta * 0.3;
    ref.current.rotation.y += delta * 0.4;
  });

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <torusKnotGeometry args={[1, 0.32, 220, 32]} />
      <meshStandardMaterial
        color="#7c3aed"
        roughness={0.15}
        metalness={0.85}
      />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.5, 4.5], fov: 45 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      frameloop="always"
    >
      <color attach="background" args={['#09090b']} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[3, 5, 2]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
        <SpinningTorus />
      </Float>

      <ContactShadows
        position={[0, -1.6, 0]}
        opacity={0.45}
        scale={8}
        blur={2.4}
        far={3}
      />
      <Environment preset="city" />
    </Canvas>
  );
}
