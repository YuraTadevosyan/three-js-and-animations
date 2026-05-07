import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import { Color, InstancedMesh, Object3D } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const GRID = 40; // 40 x 40 = 1,600 instanced cubes
const COUNT = GRID * GRID;

const tmp = new Object3D();
const baseColor = new Color('#3f3f46');
const hotColor = new Color('#a78bfa');

function CubeField() {
  const meshRef = useRef<InstancedMesh>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const reduced = useReducedMotion();

  const positions = useMemo(() => {
    const arr: [number, number][] = [];
    const half = GRID / 2;
    for (let x = 0; x < GRID; x++) {
      for (let z = 0; z < GRID; z++) {
        arr.push([x - half + 0.5, z - half + 0.5]);
      }
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = reduced ? 0 : clock.getElapsedTime();

    for (let i = 0; i < COUNT; i++) {
      const [x, z] = positions[i];
      const dist = Math.sqrt(x * x + z * z);
      const y = Math.sin(dist * 0.4 - t * 1.4) * 0.6;

      tmp.position.set(x, y, z);
      tmp.scale.setScalar(i === hovered ? 1.6 : 1);
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);

      mesh.setColorAt(
        i,
        i === hovered ? hotColor : baseColor.clone().lerp(hotColor, (y + 0.6) * 0.5),
      );
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, COUNT]}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(e.instanceId ?? null);
      }}
      onPointerLeave={() => setHovered(null)}
    >
      <boxGeometry args={[0.7, 0.7, 0.7]} />
      <meshStandardMaterial roughness={0.4} metalness={0.2} />
    </instancedMesh>
  );
}

export default function InstancesScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [16, 14, 16], fov: 45 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#09090b']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 12, 6]} intensity={1.1} castShadow />
      <CubeField />
      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.2} />
    </Canvas>
  );
}
