import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, type Group } from 'three';

import type { CaliperOption, WheelOption } from '@/lib/config';

const TIRE_R = 0.35;
const TIRE_HALF_W = 0.13; // tire is 0.26 wide
const SIDEWALL_TUBE = 0.04;
const RIM_FACE_X = 0.06; // recessed behind the outboard sidewall → deep-dish look
const RIM_OUTER = 0.29;
const HUB_R = 0.06;

interface WheelProps {
  /** World position of the wheel hub. */
  position: [number, number, number];
  /** +1 for the right side, -1 for the left (mirrors the rim face outward). */
  side: 1 | -1;
  wheel: WheelOption;
  caliper: CaliperOption;
  /** Roll speed in rad/s when the turntable is spinning. */
  rollSpeed?: number;
}

/**
 * A single procedural alloy wheel. The tire tread is an *open-ended* cylinder
 * (no sidewall caps) so the recessed rim face — and the brake disc + caliper
 * behind it — are clearly visible through the wheel face. Only the tire + rim
 * spin; the brake stays put.
 */
export function Wheel({ position, side, wheel, caliper, rollSpeed = 0 }: WheelProps) {
  const rollRef = useRef<Group>(null);

  const rimColor = useMemo(() => new Color(wheel.rimColor), [wheel.rimColor]);
  const caliperColor = useMemo(() => new Color(caliper.hex), [caliper.hex]);
  // Alloys are kept only semi-metallic so their colour still reads in the dark
  // garage instead of going black like a pure mirror.
  const rimMetalness = Math.min(wheel.metalness, 0.62);

  // Spoke angular layout. Split (M-style) spokes fork into a tight pair.
  const spokeAngles = useMemo(() => {
    const out: number[] = [];
    const step = (Math.PI * 2) / wheel.spokes;
    const fork = wheel.split ? 0.14 : 0;
    for (let i = 0; i < wheel.spokes; i++) {
      const base = i * step;
      if (wheel.split) {
        out.push(base - fork, base + fork);
      } else {
        out.push(base);
      }
    }
    return out;
  }, [wheel.spokes, wheel.split]);

  const spokeWidth = wheel.spokes >= 10 ? 0.05 : 0.085;
  const spokeLen = RIM_OUTER - HUB_R + 0.02;
  const spokeMid = (RIM_OUTER + HUB_R) / 2;

  useFrame((_, delta) => {
    if (rollRef.current && rollSpeed) {
      rollRef.current.rotation.x += rollSpeed * delta;
    }
  });

  return (
    <group position={position}>
      {/* Mirror so the decorative rim face always points away from the car. */}
      <group scale={[side, 1, 1]}>
        {/* ---- Brake assembly (static, sits behind the spokes) ---- */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.02, 0, 0]}>
          <cylinderGeometry args={[0.245, 0.245, 0.03, 40]} />
          <meshStandardMaterial color="#4a4e56" metalness={0.55} roughness={0.35} />
        </mesh>
        {/* Disc hat / inner bell */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.01, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.08, 24]} />
          <meshStandardMaterial color="#191a1d" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Caliper clamped over the disc edge at ~1 o'clock */}
        <mesh position={[0.0, 0.2, 0.05]} castShadow>
          <boxGeometry args={[0.08, 0.16, 0.12]} />
          <meshStandardMaterial
            color={caliperColor}
            emissive={caliperColor}
            emissiveIntensity={0.45}
            metalness={0.3}
            roughness={0.4}
            toneMapped={false}
          />
        </mesh>

        {/* ---- Rolling assembly (tire + rim) ---- */}
        <group ref={rollRef}>
          {/* Tire tread — open-ended so the rim shows through */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[TIRE_R, TIRE_R, TIRE_HALF_W * 2, 48, 1, true]} />
            <meshStandardMaterial color="#0c0c0e" roughness={0.9} metalness={0.04} />
          </mesh>
          {/* Rounded rubber sidewalls, outboard + inboard */}
          {[TIRE_HALF_W, -TIRE_HALF_W].map((x) => (
            <mesh key={x} rotation={[0, Math.PI / 2, 0]} position={[x, 0, 0]}>
              <torusGeometry args={[TIRE_R - SIDEWALL_TUBE, SIDEWALL_TUBE, 16, 48]} />
              <meshStandardMaterial color="#141416" roughness={0.78} />
            </mesh>
          ))}

          {/* Rim barrel (open drum between tire and rim face) */}
          <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.01, 0, 0]}>
            <cylinderGeometry args={[RIM_OUTER - 0.02, RIM_OUTER - 0.02, 0.2, 40, 1, true]} />
            <meshStandardMaterial color={rimColor} metalness={rimMetalness} roughness={0.32} side={2} />
          </mesh>
          {/* Outer rim lip */}
          <mesh rotation={[0, Math.PI / 2, 0]} position={[RIM_FACE_X, 0, 0]}>
            <torusGeometry args={[RIM_OUTER, 0.03, 16, 48]} />
            <meshStandardMaterial color={rimColor} metalness={rimMetalness} roughness={0.24} />
          </mesh>

          {/* Spokes */}
          {spokeAngles.map((a, i) => (
            <group key={i} rotation={[a, 0, 0]}>
              <mesh position={[RIM_FACE_X, spokeMid, 0]} castShadow>
                <boxGeometry args={[0.05, spokeLen, spokeWidth]} />
                <meshStandardMaterial color={rimColor} metalness={rimMetalness} roughness={0.3} />
              </mesh>
            </group>
          ))}

          {/* Hub + roundel */}
          <mesh rotation={[0, 0, Math.PI / 2]} position={[RIM_FACE_X + 0.01, 0, 0]}>
            <cylinderGeometry args={[HUB_R, HUB_R, 0.05, 24]} />
            <meshStandardMaterial color={rimColor} metalness={rimMetalness} roughness={0.32} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]} position={[RIM_FACE_X + 0.04, 0, 0]}>
            <circleGeometry args={[0.04, 24]} />
            <meshStandardMaterial color="#1c4fa0" metalness={0.4} roughness={0.4} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
