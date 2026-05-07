import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { useRef } from 'react';
import { Group, Vector2 } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function NeonRing({
  radius,
  speed,
  color,
  tilt,
}: {
  radius: number;
  speed: number;
  color: string;
  tilt: number;
}) {
  const ref = useRef<Group>(null);
  const reduced = useReducedMotion();

  useFrame((_, delta) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.z += delta * speed;
  });

  return (
    <group ref={ref} rotation={[tilt, 0, 0]}>
      <mesh>
        <torusGeometry args={[radius, 0.04, 16, 200]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function PostFxScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} intensity={0.5} color="#a78bfa" />

      <NeonRing radius={1.4} speed={0.5} color="#a78bfa" tilt={0.4} />
      <NeonRing radius={1.9} speed={-0.35} color="#22d3ee" tilt={-0.5} />
      <NeonRing radius={2.4} speed={0.25} color="#f472b6" tilt={0.3} />

      <mesh>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#22d3ee"
          emissiveIntensity={1.4}
          roughness={0.3}
          metalness={0.6}
          toneMapped={false}
        />
      </mesh>

      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.4} />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={1.4}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.85}
          kernelSize={KernelSize.LARGE}
          mipmapBlur
        />
        <ChromaticAberration
          offset={new Vector2(0.0015, 0.0015)}
          radialModulation={false}
          modulationOffset={0}
          blendFunction={BlendFunction.NORMAL}
        />
        <Vignette eskil={false} offset={0.2} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
