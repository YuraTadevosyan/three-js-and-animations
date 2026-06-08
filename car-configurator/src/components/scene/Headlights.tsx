import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { Object3D, type Mesh, type MeshStandardMaterial, type SpotLight } from 'three';

// One angel-eye headlight cluster sits at each front corner. The E46 face uses
// twin round projectors per side, each ringed by a glowing corona.
const RING_OFFSETS = [-0.16, 0.16]; // inner / outer projector along X within a cluster

function HeadlightCluster({ xSign }: { xSign: 1 | -1 }) {
  return (
    <group position={[xSign * 0.6, 0.62, 2.02]}>
      {/* Smoked housing */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.21, 0.23, 0.06, 24]} />
        <meshStandardMaterial color="#0c0d10" metalness={0.5} roughness={0.35} />
      </mesh>
      {RING_OFFSETS.map((ox) => (
        <group key={ox} position={[xSign * ox, 0, 0.02]}>
          {/* Angel-eye corona */}
          <mesh
            rotation={[0, Math.PI / 2, 0]}
            userData={{ angelEye: true }}
            name="angelEye"
          >
            <torusGeometry args={[0.1, 0.014, 16, 40]} />
            <meshStandardMaterial
              color="#eaf6ff"
              emissive="#bfe6ff"
              emissiveIntensity={0.15}
              toneMapped={false}
            />
          </mesh>
          {/* Projector lens */}
          <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 0, 0.01]} name="projector">
            <circleGeometry args={[0.085, 24]} />
            <meshStandardMaterial
              color="#dfeefc"
              emissive="#cfe6ff"
              emissiveIntensity={0.05}
              metalness={0.2}
              roughness={0.1}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Headlights({ on }: { on: boolean }) {
  const groupRef = useRef<import('three').Group>(null);
  const leftBeam = useRef<SpotLight>(null);
  const rightBeam = useRef<SpotLight>(null);
  const coneRefs = useRef<Mesh[]>([]);

  // Targets the beams aim at, well in front of the car.
  const leftTarget = useMemo(() => new Object3D(), []);
  const rightTarget = useMemo(() => new Object3D(), []);

  useEffect(() => {
    leftTarget.position.set(-0.6, -0.2, 12);
    rightTarget.position.set(0.6, -0.2, 12);
  }, [leftTarget, rightTarget]);

  // Animate everything that should "switch on" together.
  useEffect(() => {
    const ringMats: MeshStandardMaterial[] = [];
    const lensMats: MeshStandardMaterial[] = [];
    groupRef.current?.traverse((obj) => {
      const mesh = obj as Mesh;
      if (mesh.name === 'angelEye') {
        ringMats.push(mesh.material as MeshStandardMaterial);
      } else if (mesh.name === 'projector') {
        lensMats.push(mesh.material as MeshStandardMaterial);
      }
    });

    const beams = [leftBeam.current, rightBeam.current].filter(Boolean) as SpotLight[];
    const cones = coneRefs.current.filter(Boolean);

    const ctx = gsap.context(() => {
      gsap.to(ringMats, {
        emissiveIntensity: on ? 3.2 : 0.15,
        duration: 0.55,
        ease: on ? 'power2.out' : 'power2.in',
        stagger: 0.06,
      });
      gsap.to(lensMats, {
        emissiveIntensity: on ? 2.4 : 0.05,
        duration: 0.55,
        ease: 'power2.out',
      });
      gsap.to(beams, {
        intensity: on ? 26 : 0,
        duration: 0.5,
        ease: 'power2.out',
      });
      cones.forEach((cone) => {
        gsap.to((cone.material as MeshStandardMaterial), {
          opacity: on ? 0.12 : 0,
          duration: 0.5,
          ease: 'power2.out',
        });
      });
    });
    return () => ctx.revert();
  }, [on]);

  return (
    <group ref={groupRef}>
      <HeadlightCluster xSign={-1} />
      <HeadlightCluster xSign={1} />

      {/* Beams */}
      <primitive object={leftTarget} />
      <primitive object={rightTarget} />
      <spotLight
        ref={leftBeam}
        position={[-0.6, 0.62, 2.1]}
        target={leftTarget}
        angle={0.42}
        penumbra={0.7}
        distance={16}
        intensity={0}
        color="#eaf4ff"
      />
      <spotLight
        ref={rightBeam}
        position={[0.6, 0.62, 2.1]}
        target={rightTarget}
        angle={0.42}
        penumbra={0.7}
        distance={16}
        intensity={0}
        color="#eaf4ff"
      />

      {/* Fake volumetric beam cones */}
      {[-0.6, 0.6].map((x, i) => (
        <mesh
          key={x}
          ref={(m) => {
            if (m) coneRefs.current[i] = m;
          }}
          position={[x, 0.5, 4.4]}
          rotation={[Math.PI / 2 + 0.04, 0, 0]}
        >
          <coneGeometry args={[1.1, 4.6, 24, 1, true]} />
          <meshStandardMaterial
            color="#dcefff"
            emissive="#bfe4ff"
            emissiveIntensity={0.6}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
