import { useMemo } from 'react';
import { Color } from 'three';

interface ProceduralWheelProps {
  /** Hub centre in the car group's local space. */
  position: [number, number, number];
  /** Tire outer radius. */
  radius: number;
  /** Wheel width along the axle (X). */
  width: number;
  /** +1 / -1 — mirrors the rim face outboard. */
  side: 1 | -1;
  spokes: number;
  split: boolean;
  /** Rim finish. */
  color: string;
  metalness: number;
  roughness: number;
}

/**
 * A procedural alloy wheel (tire + recessed multi-spoke rim) sized to drop in
 * over one of the GLB's hub positions when a non-OEM wheel style is chosen.
 * The whole wheel is built around the axle (X), tire tread open-ended so the
 * rim reads through the face.
 */
export function ProceduralWheel({
  position,
  radius,
  width,
  side,
  spokes,
  split,
  color,
  metalness,
  roughness,
}: ProceduralWheelProps) {
  const rim = useMemo(() => new Color(color), [color]);

  const halfW = width / 2;
  const tube = radius * 0.12;
  const rimOuter = radius * 0.82;
  const hubR = radius * 0.17;
  const faceX = halfW * 0.45;
  const spokeMid = (rimOuter + hubR) / 2;
  const spokeLen = rimOuter - hubR + radius * 0.04;
  const spokeW = (spokes >= 10 ? 0.13 : 0.22) * radius;

  const angles = useMemo(() => {
    const out: number[] = [];
    const step = (Math.PI * 2) / spokes;
    const fork = split ? 0.14 : 0;
    for (let i = 0; i < spokes; i++) {
      const base = i * step;
      if (split) out.push(base - fork, base + fork);
      else out.push(base);
    }
    return out;
  }, [spokes, split]);

  return (
    <group position={position}>
      <group scale={[side, 1, 1]}>
        {/* Tire tread (open-ended) */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[radius, radius, width, 48, 1, true]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.9} metalness={0.04} />
        </mesh>
        {/* Rounded rubber sidewalls */}
        {[halfW, -halfW].map((x) => (
          <mesh key={x} rotation={[0, Math.PI / 2, 0]} position={[x, 0, 0]}>
            <torusGeometry args={[radius - tube, tube, 16, 44]} />
            <meshStandardMaterial color="#141416" roughness={0.78} />
          </mesh>
        ))}

        {/* Outer rim lip */}
        <mesh rotation={[0, Math.PI / 2, 0]} position={[faceX, 0, 0]}>
          <torusGeometry args={[rimOuter, radius * 0.08, 16, 48]} />
          <meshStandardMaterial color={rim} metalness={metalness} roughness={roughness * 0.7} />
        </mesh>

        {/* Spokes */}
        {angles.map((a, i) => (
          <group key={i} rotation={[a, 0, 0]}>
            <mesh position={[faceX, spokeMid, 0]} castShadow>
              <boxGeometry args={[radius * 0.14, spokeLen, spokeW]} />
              <meshStandardMaterial color={rim} metalness={metalness} roughness={roughness} />
            </mesh>
          </group>
        ))}

        {/* Hub + roundel */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[faceX + radius * 0.03, 0, 0]}>
          <cylinderGeometry args={[hubR, hubR, radius * 0.16, 24]} />
          <meshStandardMaterial color={rim} metalness={metalness} roughness={roughness} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]} position={[faceX + radius * 0.12, 0, 0]}>
          <circleGeometry args={[hubR * 0.62, 24]} />
          <meshStandardMaterial color="#1c4fa0" metalness={0.4} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
