import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  PLANET_FRAG,
  PLANET_VERT,
  RING_FRAG,
  RING_VERT,
} from '@/shaders/planet';
import { globalUniforms } from '@/shaders/uniforms';
import { TYPE_FLAG, type WorldDesc } from '@/lib/worldgen';
import { useUniverse } from '@/state/universeStore';

interface WorldProps {
  desc: WorldDesc;
  planetGeo: THREE.BufferGeometry;
  ringGeo: THREE.BufferGeometry;
  focusedSlot: number | null;
  onSelect: (d: WorldDesc) => void;
}

const _q = new THREE.Quaternion();

/** One world — a shared icosphere sculpted by its per-instance uniforms. */
export function World(props: WorldProps) {
  if (props.desc.type === 'monolith') return <Monolith {...props} />;
  return <Planetoid {...props} />;
}

function Planetoid({ desc, planetGeo, ringGeo, focusedSlot, onSelect }: WorldProps) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const { shared } = useUniverse();

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: PLANET_VERT,
        fragmentShader: PLANET_FRAG,
        uniforms: {
          uTime: globalUniforms.uTime,
          uLightDir: globalUniforms.uLightDir,
          uLightColor: globalUniforms.uLightColor,
          uFreq: { value: 1 },
          uAmp: { value: 0.2 },
          uType: { value: 0 },
          uSeed: { value: new THREE.Vector3() },
          uLow: { value: new THREE.Color() },
          uMid: { value: new THREE.Color() },
          uHigh: { value: new THREE.Color() },
          uAtmo: { value: new THREE.Color() },
          uEmissive: { value: new THREE.Color() },
          uEmissiveStr: { value: 0 },
          uHighlight: { value: 0 },
        },
      }),
    [],
  );

  const ringMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: RING_VERT,
        fragmentShader: RING_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uInner: { value: 1.25 },
          uOuter: { value: 2.4 },
          uColor: { value: new THREE.Color('#ffffff') },
          uSeed: { value: 0 },
        },
      }),
    [],
  );

  useEffect(() => () => {
    material.dispose();
    ringMaterial.dispose();
  }, [material, ringMaterial]);

  // Push the world's procedural parameters into the shader whenever the slot
  // this pool entry represents changes.
  useEffect(() => {
    const u = material.uniforms;
    u.uFreq.value = desc.noiseFreq;
    u.uAmp.value = desc.noiseAmp;
    u.uType.value = TYPE_FLAG[desc.type as keyof typeof TYPE_FLAG] ?? 0;
    const s = desc.seed;
    u.uSeed.value.set((s & 255) / 20, ((s >> 8) & 255) / 20, ((s >> 16) & 255) / 20);
    u.uLow.value.copy(desc.palette.low);
    u.uMid.value.copy(desc.palette.mid);
    u.uHigh.value.copy(desc.palette.high);
    u.uAtmo.value.copy(desc.palette.atmosphere);
    u.uEmissive.value.copy(desc.palette.emissive);
    u.uEmissiveStr.value = desc.emissive;

    if (desc.ring) {
      ringMaterial.uniforms.uColor.value.copy(desc.ring.color);
      ringMaterial.uniforms.uSeed.value = (desc.seed & 4095) / 400;
    }

    const g = group.current;
    if (g) {
      g.scale.setScalar(desc.size);
      g.rotation.set(0, 0, desc.tilt);
    }
  }, [desc, material, ringMaterial]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const t = globalUniforms.uTime.value;
    const reduce = shared.reducedMotion;

    const bob = reduce ? 0 : Math.sin(t * desc.bobSpeed + desc.bobPhase) * desc.bobAmp;
    g.position.set(desc.position.x, desc.position.y + bob, desc.position.z);

    if (spin.current) {
      _q.setFromAxisAngle(desc.spinAxis, (reduce ? 0.15 : 1) * t * desc.spinSpeed + desc.bobPhase);
      spin.current.quaternion.copy(_q);
    }

    const target = focusedSlot === desc.slot ? 1 : 0;
    const hl = material.uniforms.uHighlight;
    hl.value += (target - hl.value) * Math.min(dt * 5, 1);
  });

  const handleSelect = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(desc);
  };

  return (
    <group ref={group}>
      <group ref={spin}>
        <mesh
          geometry={planetGeo}
          material={material}
          onClick={handleSelect}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = '';
          }}
        />
      </group>
      {desc.ring && (
        <mesh
          geometry={ringGeo}
          material={ringMaterial}
          rotation={[desc.ring.tilt.x, desc.ring.tilt.y, desc.ring.tilt.z]}
        />
      )}
    </group>
  );
}

/** The rare easter-egg world: a slowly turning obelisk with a glowing core. */
function Monolith({ desc, focusedSlot, onSelect }: WorldProps) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const body = useRef<THREE.MeshStandardMaterial>(null);
  const coreMat = useRef<THREE.MeshBasicMaterial>(null);
  const { shared } = useUniverse();

  const color = useMemo(() => new THREE.Color(desc.palette.accent), [desc]);
  const edges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.56, 3.02, 0.44)),
    [],
  );
  useEffect(() => () => edges.dispose(), [edges]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const t = globalUniforms.uTime.value;
    const reduce = shared.reducedMotion;
    const bob = reduce ? 0 : Math.sin(t * desc.bobSpeed + desc.bobPhase) * desc.bobAmp;
    g.position.set(desc.position.x, desc.position.y + bob, desc.position.z);
    g.rotation.y = reduce ? 0 : t * 0.22;

    const focused = focusedSlot === desc.slot;
    const pulse = 0.55 + 0.45 * Math.sin(t * 1.6 + desc.bobPhase);
    if (core.current) {
      core.current.rotation.set(t * 0.6, t * 0.9, 0);
      core.current.position.y = 2.55 + (reduce ? 0 : Math.sin(t * 0.8) * 0.18);
      core.current.scale.setScalar(0.85 + 0.25 * pulse);
    }
    if (body.current) body.current.emissiveIntensity = (focused ? 0.9 : 0.35) * pulse;
    if (coreMat.current) coreMat.current.color.copy(color).multiplyScalar(1.2 + pulse);
  });

  return (
    <group
      ref={group}
      scale={desc.size}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(desc);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = '';
      }}
    >
      <mesh>
        <boxGeometry args={[0.55, 3, 0.42]} />
        <meshStandardMaterial
          ref={body}
          color="#05060c"
          metalness={0.6}
          roughness={0.35}
          emissive={color}
          emissiveIntensity={0.35}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={color} transparent opacity={0.85} />
      </lineSegments>
      <mesh ref={core} position={[0, 2.55, 0]}>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshBasicMaterial ref={coreMat} color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}
