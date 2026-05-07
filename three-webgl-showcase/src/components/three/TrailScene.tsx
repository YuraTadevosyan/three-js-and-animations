import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  Color,
  Points,
  Vector3,
} from 'three';

const COUNT = 600;
const COLOR_HEAD = new Color('#a78bfa');
const COLOR_TAIL = new Color('#22d3ee');

function CursorTrail() {
  const pointsRef = useRef<Points>(null);
  const { viewport } = useThree();

  // Pre-allocated buffers
  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      sizes[i] = 0.04 * (1 - i / COUNT) + 0.01;
    }
    return { positions, colors, sizes };
  }, []);

  // Ring buffer head
  const head = useRef(0);
  const target = useRef(new Vector3());

  useFrame(({ pointer }) => {
    const points = pointsRef.current;
    if (!points) return;

    target.current.set(
      (pointer.x * viewport.width) / 2,
      (pointer.y * viewport.height) / 2,
      0,
    );

    head.current = (head.current + 1) % COUNT;
    const i3 = head.current * 3;
    positions[i3] = target.current.x;
    positions[i3 + 1] = target.current.y;
    positions[i3 + 2] = 0;

    // Walk back through the ring buffer assigning age-based colors
    const tmp = new Color();
    for (let i = 0; i < COUNT; i++) {
      const age = (head.current - i + COUNT) % COUNT;
      const t = age / COUNT;
      tmp.copy(COLOR_HEAD).lerp(COLOR_TAIL, t);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }

    const geom = points.geometry;
    (geom.attributes.position as BufferAttribute).needsUpdate = true;
    (geom.attributes.color as BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={COUNT}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={COUNT}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.95}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

export default function TrailScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#050507']} />
      <CursorTrail />
    </Canvas>
  );
}
