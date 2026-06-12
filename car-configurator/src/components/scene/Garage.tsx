import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
} from '@react-three/drei';
import { DoubleSide } from 'three';

import type { SceneOption } from '@/lib/config';
import { useConfig } from '@/state/configStore';

/**
 * The garage. A self-contained studio environment built from Lightformers (no
 * external HDR needed), a glossy reflective floor, soft contact shadows, walls
 * and neon accent strips — all recoloured by the selected scene (garage mood).
 */
export function Garage() {
  const { scene } = useConfig();

  return (
    <group>
      {/* Procedural reflections for the car paint — fully offline. */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={[scene.envBg]} />
        <Lightformer intensity={2.4} position={[0, 6, 1]} scale={[10, 6, 1]} color={scene.key} />
        <Lightformer
          form="rect"
          intensity={3}
          position={[0, 4, -3]}
          scale={[12, 0.4, 1]}
          rotation={[Math.PI / 2, 0, 0]}
          color={scene.key}
        />
        {/* Accent rims */}
        <Lightformer
          intensity={2.2}
          position={[-6, 2, 0]}
          scale={[1, 5, 1]}
          rotation={[0, Math.PI / 2, 0]}
          color={scene.accentA}
        />
        <Lightformer
          intensity={1.8}
          position={[6, 2, 0]}
          scale={[1, 5, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          color={scene.accentB}
        />
        <Lightformer intensity={1.4} position={[0, 1.5, 7]} scale={[6, 3, 1]} color={scene.key} />
        {/* Neutral profile strips so the flanks read */}
        <Lightformer
          form="rect"
          intensity={2.6}
          position={[-7, 2.4, 0]}
          scale={[0.5, 6, 1]}
          rotation={[0, Math.PI / 2, 0]}
          color={scene.key}
        />
        <Lightformer
          form="rect"
          intensity={2.6}
          position={[7, 2.4, 0]}
          scale={[0.5, 6, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          color={scene.key}
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          position={[-5, 0.5, 0]}
          scale={[0.3, 5, 1]}
          rotation={[0, Math.PI / 2, 0]}
          color={scene.accentA}
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          position={[5, 0.5, 0]}
          scale={[0.3, 5, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          color={scene.accentB}
        />
      </Environment>

      {/* Reflective showroom floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[24, 64]} />
        <MeshReflectorMaterial
          resolution={1024}
          mirror={0.7}
          mixStrength={2.4}
          mixBlur={1.1}
          blur={[400, 100]}
          roughness={0.85}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color={scene.floor}
          metalness={0.55}
        />
      </mesh>

      {/* Stage glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[3.4, 3.55, 96]} />
        <meshBasicMaterial color={scene.accentA} transparent opacity={0.16} side={DoubleSide} />
      </mesh>

      {/* Soft grounded shadow under the car */}
      <ContactShadows
        position={[0, 0.01, 0]}
        scale={14}
        resolution={1024}
        far={6}
        blur={2.6}
        opacity={0.7}
        color="#000000"
      />

      <GarageWalls scene={scene} />

      {/* Key light with a soft cast shadow. */}
      <directionalLight
        position={[6, 9, 7]}
        intensity={2.6}
        color={scene.key}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-radius={8}
        shadow-bias={-0.0001}
        shadow-normalBias={0.05}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      <directionalLight position={[-3, 4, 8]} intensity={0.9} color={scene.key} />
      {/* Profile fills so the flanks read from the side views */}
      <directionalLight position={[11, 3, 0.5]} intensity={1.5} color={scene.key} />
      <directionalLight position={[-11, 3, -0.5]} intensity={1.3} color={scene.key} />
      {/* Neon rim accents (no distance falloff so they stay punchy) */}
      <spotLight position={[-7, 4, -2]} angle={0.9} penumbra={1} intensity={9} decay={0} color={scene.accentA} />
      <spotLight position={[7, 4, -3]} angle={0.9} penumbra={1} intensity={6} decay={0} color={scene.accentB} />
      <hemisphereLight args={['#6678a0', '#0a0a0c', 0.65]} />
      <ambientLight intensity={scene.ambient} />
    </group>
  );
}

function GarageWalls({ scene }: { scene: SceneOption }) {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 5, -14]} receiveShadow>
        <planeGeometry args={[60, 22]} />
        <meshStandardMaterial color={scene.wall} roughness={0.95} metalness={0.1} />
      </mesh>
      {/* Side walls */}
      <mesh position={[-16, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[40, 22]} />
        <meshStandardMaterial color={scene.wall} roughness={0.95} />
      </mesh>
      <mesh position={[16, 5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[40, 22]} />
        <meshStandardMaterial color={scene.wall} roughness={0.95} />
      </mesh>

      {/* Neon accent strips on the back wall */}
      {[-7, 7].map((x) => (
        <mesh key={x} position={[x, 4.5, -13.8]}>
          <boxGeometry args={[0.12, 7, 0.12]} />
          <meshStandardMaterial
            color={scene.accentA}
            emissive={scene.accentA}
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh position={[0, 8.4, -13.8]}>
        <boxGeometry args={[16, 0.1, 0.1]} />
        <meshStandardMaterial
          color={scene.accentB}
          emissive={scene.accentB}
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
