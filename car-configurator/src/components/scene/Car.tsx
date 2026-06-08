import { useEffect, useMemo, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { Color, type Group, MeshPhysicalMaterial } from 'three';

import { useConfig } from '@/state/configStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Wheel } from './Wheel';
import { Headlights } from './Headlights';

// Wheel hub placement (car faces +Z, centred at the origin). The track is wide
// relative to the body so the tires clearly poke out under the arches.
const WHEEL_Y = 0.36;
const WHEEL_X = 0.86;
const WHEEL_Z = 1.4;
const BODY_HALF_W = 0.8; // lower body is 1.6 wide → tires sit proud of it

export function Car() {
  const { paint, wheel, caliper, headlightsOn, autoSpin } = useConfig();
  const reducedMotion = useReducedMotion();
  const root = useRef<Group>(null);

  // One physical material shared by every painted panel so a colour change
  // tweens the whole body at once.
  const paintMat = useMemo(() => {
    return new MeshPhysicalMaterial({
      color: new Color(paint.hex),
      metalness: paint.metalness,
      roughness: paint.roughness,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.6,
      reflectivity: 0.6,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => paintMat.dispose(), [paintMat]);

  // GSAP paint transition: cross-fade colour + finish.
  useEffect(() => {
    const target = new Color(paint.hex);
    const duration = reducedMotion ? 0 : 0.7;
    gsap.to(paintMat.color, {
      r: target.r,
      g: target.g,
      b: target.b,
      duration,
      ease: 'power2.inOut',
    });
    gsap.to(paintMat, {
      metalness: paint.metalness,
      roughness: paint.roughness,
      duration,
      ease: 'power2.inOut',
    });
  }, [paint, paintMat, reducedMotion]);

  // Turntable spin.
  useFrame((_, delta) => {
    if (root.current && autoSpin && !reducedMotion) {
      root.current.rotation.y += delta * 0.28;
    }
  });

  return (
    <group ref={root}>
      {/* ============ Painted shell ============ */}
      {/* Lower body — sills, doors, lower fenders */}
      <RoundedBox
        args={[1.6, 0.46, 4.34]}
        radius={0.17}
        smoothness={5}
        position={[0, 0.6, 0]}
        material={paintMat}
        castShadow
        receiveShadow
      />
      {/* Front fenders (slightly wider over the front wheels) */}
      <RoundedBox
        args={[1.7, 0.42, 1.1]}
        radius={0.2}
        smoothness={5}
        position={[0, 0.62, 1.35]}
        material={paintMat}
        castShadow
      />
      {/* Rear haunches — the muscular E46 hips */}
      <RoundedBox
        args={[1.74, 0.46, 1.25]}
        radius={0.22}
        smoothness={5}
        position={[0, 0.63, -1.32]}
        material={paintMat}
        castShadow
      />
      {/* Long hood */}
      <RoundedBox
        args={[1.5, 0.16, 1.78]}
        radius={0.1}
        smoothness={4}
        position={[0, 0.83, 1.18]}
        rotation={[-0.05, 0, 0]}
        material={paintMat}
        castShadow
      />
      {/* Cowl that fills the hood-to-windshield gap */}
      <RoundedBox
        args={[1.5, 0.2, 0.55]}
        radius={0.08}
        smoothness={4}
        position={[0, 0.85, 0.42]}
        material={paintMat}
      />
      {/* Short trunk deck */}
      <RoundedBox
        args={[1.5, 0.16, 1.0]}
        radius={0.1}
        smoothness={4}
        position={[0, 0.86, -1.58]}
        rotation={[0.05, 0, 0]}
        material={paintMat}
        castShadow
      />
      {/* Roof — narrower + shorter than the glass band to imply windshield rake */}
      <RoundedBox
        args={[1.3, 0.16, 1.5]}
        radius={0.18}
        smoothness={5}
        position={[0, 1.24, -0.38]}
        material={paintMat}
        castShadow
      />

      {/* ============ Greenhouse + glass ============ */}
      <Greenhouse />

      {/* ============ Pillars (painted) ============ */}
      {([1, -1] as const).map((s) => (
        <group key={s}>
          {/* A-pillar (strong forward rake) */}
          <mesh
            position={[s * 0.62, 1.05, 0.62]}
            rotation={[0.62, 0, s * 0.06]}
            material={paintMat}
          >
            <boxGeometry args={[0.08, 0.66, 0.1]} />
          </mesh>
          {/* C-pillar */}
          <mesh
            position={[s * 0.62, 1.06, -1.06]}
            rotation={[-0.46, 0, -s * 0.05]}
            material={paintMat}
          >
            <boxGeometry args={[0.1, 0.6, 0.13]} />
          </mesh>
          {/* B-pillar (gloss black) */}
          <mesh position={[s * 0.7, 1.04, -0.34]}>
            <boxGeometry args={[0.05, 0.46, 0.06]} />
            <meshStandardMaterial color="#0a0b0d" roughness={0.5} metalness={0.4} />
          </mesh>
        </group>
      ))}

      {/* ============ Dark trim, bumpers, skirts, arches ============ */}
      <Trim />

      {/* ============ Front ============ */}
      <KidneyGrille />
      <Headlights on={headlightsOn} />

      {/* ============ Rear ============ */}
      <TailLights />
      <Exhausts />

      {/* ============ Mirrors ============ */}
      {([1, -1] as const).map((s) => (
        <group key={s} position={[s * 0.84, 0.94, 0.6]}>
          <mesh position={[s * 0.06, 0, 0]}>
            <boxGeometry args={[0.05, 0.04, 0.14]} />
            <meshStandardMaterial color="#0a0b0d" roughness={0.6} />
          </mesh>
          <RoundedBox
            args={[0.18, 0.12, 0.1]}
            radius={0.05}
            smoothness={4}
            position={[s * 0.17, 0.02, 0]}
            rotation={[0, 0, s * -0.2]}
            material={paintMat}
          />
        </group>
      ))}

      {/* ============ Wheels ============ */}
      <Wheel position={[WHEEL_X, WHEEL_Y, WHEEL_Z]} side={1} wheel={wheel} caliper={caliper} />
      <Wheel position={[-WHEEL_X, WHEEL_Y, WHEEL_Z]} side={-1} wheel={wheel} caliper={caliper} />
      <Wheel position={[WHEEL_X, WHEEL_Y, -WHEEL_Z]} side={1} wheel={wheel} caliper={caliper} />
      <Wheel position={[-WHEEL_X, WHEEL_Y, -WHEEL_Z]} side={-1} wheel={wheel} caliper={caliper} />
    </group>
  );
}

function Greenhouse() {
  return (
    <mesh position={[0, 1.0, -0.32]} castShadow>
      <boxGeometry args={[1.44, 0.42, 2.16]} />
      <meshPhysicalMaterial
        color="#0a0f17"
        metalness={0.2}
        roughness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.04}
        envMapIntensity={2.2}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function KidneyGrille() {
  return (
    <group position={[0, 0.62, 2.13]}>
      {/* Chrome surround */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[0.58, 0.4, 0.05]} />
        <meshStandardMaterial color="#c9ccd2" metalness={1} roughness={0.18} />
      </mesh>
      {([-0.155, 0.155] as const).map((x) => (
        <mesh key={x} position={[x, 0, 0.02]}>
          <boxGeometry args={[0.25, 0.36, 0.06]} />
          <meshStandardMaterial color="#070809" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* Vertical slats */}
      {([-0.155, 0.155] as const).map((x) =>
        Array.from({ length: 6 }, (_, i) => (
          <mesh key={`${x}-${i}`} position={[x, 0.15 - i * 0.06, 0.045]}>
            <boxGeometry args={[0.23, 0.012, 0.04]} />
            <meshStandardMaterial color="#3a3d44" metalness={0.8} roughness={0.3} />
          </mesh>
        )),
      )}
    </group>
  );
}

function TailLights() {
  return (
    <group position={[0, 0.68, -2.16]}>
      {([-0.56, 0.56] as const).map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.52, 0.24, 0.06]} />
          <meshStandardMaterial
            color="#7a0a0a"
            emissive="#ff2020"
            emissiveIntensity={1.5}
            toneMapped={false}
            roughness={0.3}
          />
        </mesh>
      ))}
      {/* Connecting trim across the boot */}
      <mesh position={[0, 0, 0.005]}>
        <boxGeometry args={[0.62, 0.06, 0.05]} />
        <meshStandardMaterial color="#1a0606" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Exhausts() {
  return (
    <group position={[0, 0.22, -2.2]}>
      {([-0.4, 0.4] as const).map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.12, 20]} />
          <meshStandardMaterial color="#c9ccd2" metalness={1} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function Trim() {
  const dark = { color: '#0b0c0f', roughness: 0.55, metalness: 0.3 } as const;
  return (
    <group>
      {/* Front bumper / lower intake */}
      <mesh position={[0, 0.4, 2.12]}>
        <boxGeometry args={[1.66, 0.34, 0.22]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      {/* Front splitter */}
      <mesh position={[0, 0.22, 2.2]}>
        <boxGeometry args={[1.54, 0.05, 0.18]} />
        <meshStandardMaterial color="#050607" roughness={0.6} />
      </mesh>
      {/* Rear bumper / diffuser */}
      <mesh position={[0, 0.38, -2.16]}>
        <boxGeometry args={[1.68, 0.34, 0.2]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      {/* Side skirts */}
      {([1, -1] as const).map((s) => (
        <mesh key={s} position={[s * BODY_HALF_W, 0.32, 0]}>
          <boxGeometry args={[0.08, 0.16, 2.6]} />
          <meshStandardMaterial {...dark} />
        </mesh>
      ))}
      {/* Beltline / shoulder crease */}
      {([1, -1] as const).map((s) => (
        <mesh key={`belt-${s}`} position={[s * 0.81, 0.78, 0]}>
          <boxGeometry args={[0.02, 0.02, 3.4]} />
          <meshStandardMaterial color="#05060a" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
      {/* Wheel-arch trims */}
      {(
        [
          [WHEEL_X, WHEEL_Z],
          [-WHEEL_X, WHEEL_Z],
          [WHEEL_X, -WHEEL_Z],
          [-WHEEL_X, -WHEEL_Z],
        ] as const
      ).map(([x, z], i) => (
        <mesh key={i} position={[x, WHEEL_Y, z]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.46, 0.05, 12, 28, Math.PI]} />
          <meshStandardMaterial color="#0a0b0d" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}
