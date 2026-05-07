import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Group, MathUtils } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Card {
  position: [number, number, number];
  color: string;
  size: [number, number];
  depth: number;
}

function ParallaxLayers() {
  const groupRef = useRef<Group>(null);
  const reduced = useReducedMotion();

  const cards = useMemo<Card[]>(() => {
    const palette = ['#a78bfa', '#22d3ee', '#f472b6', '#facc15', '#34d399', '#f97316'];
    return Array.from({ length: 18 }, (_, i) => {
      const depth = -1 - Math.random() * 6;
      return {
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6,
          depth,
        ],
        color: palette[i % palette.length],
        size: [0.6 + Math.random() * 0.6, 0.8 + Math.random() * 0.6],
        depth,
      };
    });
  }, []);

  useFrame(({ pointer }) => {
    if (!groupRef.current) return;
    if (reduced) {
      groupRef.current.position.set(0, 0, 0);
      return;
    }
    // Inverse-direction parallax: closer layers move more, far layers less
    groupRef.current.position.x = MathUtils.lerp(
      groupRef.current.position.x,
      pointer.x * 0.6,
      0.05,
    );
    groupRef.current.position.y = MathUtils.lerp(
      groupRef.current.position.y,
      pointer.y * 0.4,
      0.05,
    );
    groupRef.current.rotation.y = MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.x * 0.15,
      0.05,
    );
    groupRef.current.rotation.x = MathUtils.lerp(
      groupRef.current.rotation.x,
      -pointer.y * 0.1,
      0.05,
    );
  });

  return (
    <group ref={groupRef}>
      {cards.map((c, i) => {
        // Scale parallax effect by depth
        const offsetScale = 1 - Math.abs(c.depth) / 8;
        return (
          <mesh
            key={i}
            position={[
              c.position[0] * offsetScale,
              c.position[1] * offsetScale,
              c.position[2],
            ]}
          >
            <planeGeometry args={c.size} />
            <meshBasicMaterial color={c.color} transparent opacity={0.85} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function ParallaxScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4], fov: 60 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#09090b']} />
      <ambientLight intensity={1} />
      <ParallaxLayers />
    </Canvas>
  );
}
