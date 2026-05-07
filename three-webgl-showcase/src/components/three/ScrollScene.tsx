import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ScrollControls, useScroll } from '@react-three/drei';
import { useRef } from 'react';
import { Group, MathUtils } from 'three';

const stages = [
  { position: [0, 0, 0] as const, color: '#a78bfa' },
  { position: [3, -1, -3] as const, color: '#22d3ee' },
  { position: [-3, 1, -6] as const, color: '#f472b6' },
  { position: [0, 0, -10] as const, color: '#facc15' },
];

function ScrollRig() {
  const scroll = useScroll();
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const offset = scroll.offset; // 0..1

    // Lerp camera through key positions across scroll progress
    const segments = stages.length - 1;
    const segIndex = Math.min(Math.floor(offset * segments), segments - 1);
    const t = offset * segments - segIndex;
    const from = stages[segIndex].position;
    const to = stages[segIndex + 1].position;

    state.camera.position.x = MathUtils.lerp(from[0], to[0], t);
    state.camera.position.y = MathUtils.lerp(from[1], to[1], t) + 0.5;
    state.camera.position.z = MathUtils.lerp(from[2], to[2], t) + 4;
    state.camera.lookAt(0, 0, -5);
  });

  return (
    <group ref={groupRef}>
      {stages.map((s, i) => (
        <Float key={i} speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
          <mesh position={s.position}>
            <octahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial
              color={s.color}
              roughness={0.2}
              metalness={0.7}
              emissive={s.color}
              emissiveIntensity={0.25}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function ScrollScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4], fov: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0b0b14']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 3]} intensity={1.1} />
      <ScrollControls pages={3} damping={0.2}>
        <ScrollRig />
      </ScrollControls>
    </Canvas>
  );
}
