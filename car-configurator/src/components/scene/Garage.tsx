import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
} from '@react-three/drei';
import { DoubleSide } from 'three';

/**
 * The Need-for-Speed-style garage: a self-contained studio environment built
 * from Lightformers (no external HDR needed), a glossy reflective floor, soft
 * contact shadows, dark walls, and neon accent strips.
 */
export function Garage() {
  return (
    <group>
      {/* Procedural reflections for the car paint — fully offline. */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#05060a']} />
        {/* Big soft ceiling key */}
        <Lightformer
          intensity={2.4}
          position={[0, 6, 1]}
          scale={[10, 6, 1]}
          color="#cfe3ff"
        />
        {/* Long top strip that streaks across the roof and glass */}
        <Lightformer
          form="rect"
          intensity={3}
          position={[0, 4, -3]}
          scale={[12, 0.4, 1]}
          rotation={[Math.PI / 2, 0, 0]}
          color="#ffffff"
        />
        {/* Cool rim from the left */}
        <Lightformer
          intensity={2.2}
          position={[-6, 2, 0]}
          scale={[1, 5, 1]}
          rotation={[0, Math.PI / 2, 0]}
          color="#3dd7ff"
        />
        {/* Warm/ember rim from the right */}
        <Lightformer
          intensity={1.8}
          position={[6, 2, 0]}
          scale={[1, 5, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          color="#ff5a47"
        />
        {/* Front fill so the face/grille reads */}
        <Lightformer
          intensity={1.4}
          position={[0, 1.5, 7]}
          scale={[6, 3, 1]}
          color="#aac4ff"
        />
        {/* Neutral profile strips — long horizontal bars along each side whose
            reflections trace the doors, shoulder line and wheels. */}
        <Lightformer
          form="rect"
          intensity={2.6}
          position={[-7, 2.4, 0]}
          scale={[0.5, 6, 1]}
          rotation={[0, Math.PI / 2, 0]}
          color="#f2f6ff"
        />
        <Lightformer
          form="rect"
          intensity={2.6}
          position={[7, 2.4, 0]}
          scale={[0.5, 6, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          color="#f2f6ff"
        />
        {/* Low kick strips that catch the rockers + rims */}
        <Lightformer
          form="rect"
          intensity={1.6}
          position={[-5, 0.5, 0]}
          scale={[0.3, 5, 1]}
          rotation={[0, Math.PI / 2, 0]}
          color="#cfe0ff"
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          position={[5, 0.5, 0]}
          scale={[0.3, 5, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          color="#cfe0ff"
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
          color="#0a0c12"
          metalness={0.55}
        />
      </mesh>

      {/* Painted-on tyre marks / glow ring under the stage */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[3.4, 3.55, 96]} />
        <meshBasicMaterial color="#3dd7ff" transparent opacity={0.16} side={DoubleSide} />
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

      <GarageWalls />

      {/* Key light with a crisp cast shadow */}
      <directionalLight
        position={[6, 9, 7]}
        intensity={2.6}
        color="#eef4ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      {/* Front fill so the face / grille reads */}
      <directionalLight position={[-3, 4, 8]} intensity={0.9} color="#cfe0ff" />
      {/* Profile fills — neutral light straight onto each flank so the doors,
          mirrors, wheels and brakes read from the side views. */}
      <directionalLight position={[11, 3, 0.5]} intensity={1.5} color="#eaf1ff" />
      <directionalLight position={[-11, 3, -0.5]} intensity={1.3} color="#eaf1ff" />
      {/* Neon rim accents (no distance falloff so they stay punchy) */}
      <spotLight
        position={[-7, 4, -2]}
        angle={0.9}
        penumbra={1}
        intensity={9}
        decay={0}
        color="#3dd7ff"
      />
      <spotLight
        position={[7, 4, -3]}
        angle={0.9}
        penumbra={1}
        intensity={6}
        decay={0}
        color="#ff5a47"
      />
      <hemisphereLight args={['#6678a0', '#0a0a0c', 0.65]} />
      <ambientLight intensity={0.42} />
    </group>
  );
}

function GarageWalls() {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 5, -14]} receiveShadow>
        <planeGeometry args={[60, 22]} />
        <meshStandardMaterial color="#0a0b10" roughness={0.95} metalness={0.1} />
      </mesh>
      {/* Side walls */}
      <mesh position={[-16, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[40, 22]} />
        <meshStandardMaterial color="#080910" roughness={0.95} />
      </mesh>
      <mesh position={[16, 5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[40, 22]} />
        <meshStandardMaterial color="#080910" roughness={0.95} />
      </mesh>

      {/* Neon accent strips on the back wall */}
      {[-7, 7].map((x) => (
        <mesh key={x} position={[x, 4.5, -13.8]}>
          <boxGeometry args={[0.12, 7, 0.12]} />
          <meshStandardMaterial
            color="#3dd7ff"
            emissive="#3dd7ff"
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh position={[0, 8.4, -13.8]}>
        <boxGeometry args={[16, 0.1, 0.1]} />
        <meshStandardMaterial
          color="#ff5a47"
          emissive="#ff5a47"
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
