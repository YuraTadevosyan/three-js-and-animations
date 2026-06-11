import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import {
  Box3,
  Color,
  type Mesh,
  type MeshStandardMaterial,
  Vector3,
} from 'three';

interface WheelModelProps {
  url: string;
  /** Hub centre in the car group's local space. */
  position: [number, number, number];
  /** Target tire outer radius (matches the OEM wheel it replaces). */
  targetRadius: number;
  /** +1 / -1 — which side of the car, so the rim face points outboard. */
  side: 1 | -1;
  /** Finish applied to the rim + caliper materials (tires/logos kept native). */
  color: string;
  metalness: number;
  roughness: number;
}

// Materials that take the finish colour.
const FINISH_RE = /wheel|rim|spoke|alloy|brake|calli/i;
// Round structural meshes used to measure size + axle (ignore decals/logos that
// would otherwise inflate the bounding box).
const SIZING_RE = /tire|tyre|wheel|rim|alloy|spoke/i;

/**
 * Loads a real wheel GLB and drops one at each measured hub. Size and axle are
 * read from the tire/rim meshes only, so a stray logo/decal plane can't skew
 * the scale or leave the wheel lying flat. The detected axle (thinnest axis) is
 * rotated onto the car's wheel axis (X).
 */
export function WheelModel({
  url,
  position,
  targetRadius,
  side,
  color,
  metalness,
  roughness,
}: WheelModelProps) {
  const { scene } = useGLTF(url);

  const { obj, scale, rotation, finishMats } = useMemo(() => {
    const obj = scene.clone(true);
    const finishMats: MeshStandardMaterial[] = [];
    const sizingMeshes: Mesh[] = [];

    obj.traverse((o) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      const mat = (mesh.material as MeshStandardMaterial).clone();
      mesh.material = mat;
      if ('envMapIntensity' in mat) mat.envMapIntensity = 1.3;

      // A near-invisible logo/decal plane would otherwise cast a slab shadow
      // under the car — keep it from casting.
      const isDecal = /logo|decal|sticker/i.test(mat.name);
      mesh.castShadow = !isDecal && !(mat.transparent && (mat.opacity ?? 1) < 0.5);
      mesh.receiveShadow = true;

      if (FINISH_RE.test(mat.name)) {
        // Drop the dark base texture so light finishes (white/silver) read true.
        mat.map = null;
        finishMats.push(mat);
      }
      if (SIZING_RE.test(mat.name)) sizingMeshes.push(mesh);
    });

    // Measure from the round meshes only (fallback to the whole object).
    obj.updateMatrixWorld(true);
    const box = new Box3();
    const targets = sizingMeshes.length ? sizingMeshes : [obj];
    targets.forEach((m) => box.expandByObject(m));

    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    obj.position.sub(center);

    const radius = Math.max(size.x, size.y, size.z) / 2;
    const scale = radius > 0 ? targetRadius / radius : 1;

    // Axle = thinnest axis → rotate onto X, outboard face per side.
    const out = side === 1 ? -Math.PI / 2 : Math.PI / 2;
    let rotation: [number, number, number];
    if (size.x <= size.y && size.x <= size.z) {
      rotation = [0, side === 1 ? 0 : Math.PI, 0]; // already on X
    } else if (size.y <= size.x && size.y <= size.z) {
      rotation = [0, 0, out]; // Y → X
    } else {
      rotation = [0, out, 0]; // Z → X
    }

    return { obj, scale, rotation, finishMats };
  }, [scene, targetRadius, side]);

  useEffect(() => {
    const col = new Color(color).convertSRGBToLinear();
    finishMats.forEach((m) => {
      m.color.copy(col);
      m.metalness = metalness;
      m.roughness = roughness;
      m.needsUpdate = true;
    });
  }, [color, metalness, roughness, finishMats]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={obj} />
    </group>
  );
}
