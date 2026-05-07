import { Canvas } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Grid,
  OrbitControls,
  PivotControls,
} from '@react-three/drei';
import { Html } from '@react-three/drei';
import { useState } from 'react';

interface DraggableObjectProps {
  position: [number, number, number];
  color: string;
  shape: 'box' | 'sphere' | 'cone';
  label: string;
}

function DraggableObject({ position, color, shape, label }: DraggableObjectProps) {
  const [active, setActive] = useState(false);

  return (
    <PivotControls
      offset={position}
      depthTest={false}
      lineWidth={2.5}
      scale={75}
      fixed
      anchor={[0, 0, 0]}
      activeAxes={[true, true, true]}
      onDragStart={() => setActive(true)}
      onDragEnd={() => setActive(false)}
    >
      <mesh position={position} castShadow>
        {shape === 'box' && <boxGeometry args={[0.8, 0.8, 0.8]} />}
        {shape === 'sphere' && <sphereGeometry args={[0.5, 32, 32]} />}
        {shape === 'cone' && <coneGeometry args={[0.5, 0.9, 32]} />}
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.55}
          emissive={active ? color : '#000000'}
          emissiveIntensity={active ? 0.35 : 0}
        />
        {active && (
          <Html
            position={[0, 0.9, 0]}
            center
            distanceFactor={6}
            style={{ pointerEvents: 'none' }}
          >
            <span className="rounded-md bg-background/80 px-2 py-1 text-xs text-foreground backdrop-blur">
              dragging {label}
            </span>
          </Html>
        )}
      </mesh>
    </PivotControls>
  );
}

export default function DragScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [4, 4, 5], fov: 45 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0b0b14']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 6, 4]} intensity={1.1} castShadow />

      <DraggableObject position={[-1.6, 0.4, 0]} color="#a78bfa" shape="box" label="cube" />
      <DraggableObject position={[0, 0.5, 0]} color="#22d3ee" shape="sphere" label="sphere" />
      <DraggableObject position={[1.6, 0.45, 0]} color="#f472b6" shape="cone" label="cone" />

      <Grid
        position={[0, -0.001, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#1f2937"
        sectionSize={2}
        sectionThickness={1.2}
        sectionColor="#a78bfa"
        fadeDistance={20}
        fadeStrength={1}
        infiniteGrid
      />
      <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={10} blur={2.4} far={4} />

      <Environment preset="city" />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={4}
        maxDistance={10}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
