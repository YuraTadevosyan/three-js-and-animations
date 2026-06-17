import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import {
  Box3,
  Color,
  type Group,
  type Mesh,
  type MeshPhysicalMaterial,
  type MeshStandardMaterial,
  Object3D,
  type Texture,
  Vector3,
} from 'three';

import { beamSetting, CAR_MODEL_URL, MAT, WHEEL_MODEL_URLS } from '@/lib/config';
import { useConfig } from '@/state/configStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ProceduralWheel } from './ProceduralWheel';
import { WheelModel } from './WheelModel';

const TARGET_LENGTH = 4.5; // fit the car to ~4.5 world units long
// Tire outer radius relative to the measured OEM *rim* radius. Real tires stand
// ~40% proud of the rim, so the swapped wheel fills the arch like the original.
const TIRE_SCALE = 1.42;

interface HubXform {
  position: [number, number, number];
  radius: number;
  width: number;
  side: 1 | -1;
}

interface PreparedModel {
  root: Object3D;
  paintMats: MeshStandardMaterial[];
  wheelMats: MeshStandardMaterial[];
  lightMats: MeshStandardMaterial[];
  hubMeshes: Mesh[];
  tireMeshes: Mesh[];
  brakeMeshes: Mesh[];
  diskMeshes: Mesh[];
  glassMats: {
    mat: MeshPhysicalMaterial;
    base: {
      color: Color;
      opacity: number;
      transmission: number;
      map: Texture | null;
      transmissionMap: Texture | null;
    };
  }[];
  tailMats: MeshStandardMaterial[];
  carbonMats: { mat: MeshStandardMaterial; baseColor: Color; baseMap: Texture | null }[];
  rearMesh: Mesh | null;
}

/** True if `obj` or any ancestor has a name matching `re`. */
function ancestorMatches(obj: Object3D, re: RegExp): boolean {
  let cur: Object3D | null = obj;
  while (cur) {
    if (re.test(cur.name)) return true;
    cur = cur.parent;
  }
  return false;
}

export function CarModel() {
  const {
    paint,
    paintFinish,
    wheelStyle,
    wheelFinish,
    wheelSurface,
    headlightColor,
    taillightColor,
    windowTint,
    carbonOn,
    beamMode,
    autoSpin,
  } = useConfig();
  const reducedMotion = useReducedMotion();
  const { scene } = useGLTF(CAR_MODEL_URL);
  const spin = useRef<Group>(null);
  const leftBeam = useRef<import('three').SpotLight>(null);
  const rightBeam = useRef<import('three').SpotLight>(null);
  const [hubs, setHubs] = useState<HubXform[]>([]);

  const beamTargets = useMemo(() => {
    const l = new Object3D();
    const r = new Object3D();
    l.position.set(-0.6, -0.4, 14);
    r.position.set(0.6, -0.4, 14);
    return { l, r };
  }, []);

  // Clone once and collect the driveable materials + the wheel meshes.
  const prepared = useMemo<PreparedModel>(() => {
    const root = scene.clone(true);
    const paintMats: MeshStandardMaterial[] = [];
    const wheelMats: MeshStandardMaterial[] = [];
    const lightMats: MeshStandardMaterial[] = [];
    const hubMeshes: Mesh[] = [];
    const tireMeshes: Mesh[] = [];
    const brakeMeshes: Mesh[] = [];
    const diskMeshes: Mesh[] = [];
    const glassMats: PreparedModel['glassMats'] = [];
    const tailMats: MeshStandardMaterial[] = [];
    const carbonMats: PreparedModel['carbonMats'] = [];
    let rearMesh: Mesh | null = null;

    root.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const src = mesh.material as MeshStandardMaterial;
      const mat = src.clone();
      mesh.material = mat;
      if ('envMapIntensity' in mat) mat.envMapIntensity = 1.3;

      switch (mat.name) {
        case MAT.paint:
          mat.map = null; // solid configurator colours instead of the baked livery
          paintMats.push(mat);
          break;
        case MAT.wheel:
          wheelMats.push(mat);
          if (ancestorMatches(mesh, /hub/i)) hubMeshes.push(mesh);
          else if (ancestorMatches(mesh, /brake/i)) brakeMeshes.push(mesh);
          break;
        case MAT.lights:
          mat.emissive = new Color('#ffffff');
          mat.emissiveIntensity = 0;
          mat.toneMapped = false;
          lightMats.push(mat);
          break;
      }
      if (mat.name === 'tire') tireMeshes.push(mesh);
      if (/disk/i.test(mat.name)) diskMeshes.push(mesh);
      if (mat.name === MAT.taillight) {
        rearMesh = mesh;
        mat.toneMapped = false;
        tailMats.push(mat);
      }
      if (mat.name === MAT.glass) {
        // Same glass material is used by the windows *and* the front light lens
        // cover. Only tint the actual windows (the light cover sits low).
        mesh.geometry.computeBoundingBox();
        const bb = mesh.geometry.boundingBox;
        const centreY = bb ? (bb.min.y + bb.max.y) / 2 : 1;
        if (centreY >= 0.65) {
          const gmat = mat as unknown as MeshPhysicalMaterial;
          glassMats.push({
            mat: gmat,
            base: {
              color: gmat.color.clone(),
              opacity: gmat.opacity,
              transmission: gmat.transmission ?? 0,
              map: gmat.map,
              transmissionMap: gmat.transmissionMap ?? null,
            },
          });
        }
      }
      if (mat.name === MAT.carbon) {
        carbonMats.push({ mat, baseColor: mat.color.clone(), baseMap: mat.map ?? null });
      }
    });

    return {
      root,
      paintMats,
      wheelMats,
      lightMats,
      hubMeshes,
      tireMeshes,
      brakeMeshes,
      diskMeshes,
      glassMats,
      tailMats,
      carbonMats,
      rearMesh,
    };
  }, [scene]);

  // Auto-fit + measure the hub positions for procedural wheel swapping.
  useLayoutEffect(() => {
    const obj = prepared.root;
    obj.position.set(0, 0, 0);
    obj.rotation.set(0, 0, 0);
    obj.scale.setScalar(1);
    obj.updateMatrixWorld(true);

    let box = new Box3().setFromObject(obj);
    const size = box.getSize(new Vector3());
    const scale = TARGET_LENGTH / Math.max(size.x, size.z);
    let rotY = size.x > size.z ? Math.PI / 2 : 0;

    obj.scale.setScalar(scale);
    obj.rotation.y = rotY;
    obj.updateMatrixWorld(true);

    if (prepared.rearMesh) {
      const rear = new Box3().setFromObject(prepared.rearMesh).getCenter(new Vector3());
      if (rear.z > 0) {
        rotY += Math.PI;
        obj.rotation.y = rotY;
        obj.updateMatrixWorld(true);
      }
    }

    box = new Box3().setFromObject(obj);
    const center = box.getCenter(new Vector3());
    obj.position.x -= center.x;
    obj.position.z -= center.z;
    obj.position.y -= box.min.y;
    obj.updateMatrixWorld(true);

    // Actual OEM tire radius: the tire mesh's vertical extent is its diameter.
    let tireRadius = 0;
    if (prepared.tireMeshes.length) {
      const tb = new Box3();
      prepared.tireMeshes.forEach((m) => tb.expandByObject(m));
      tireRadius = tb.getSize(new Vector3()).y / 2;
    }

    // With the body grounded, measure each hub (rim) to place the wheels.
    const xforms: HubXform[] = prepared.hubMeshes.map((hub) => {
      const hbox = new Box3().setFromObject(hub);
      const hsize = hbox.getSize(new Vector3());
      const hc = hbox.getCenter(new Vector3());
      const rimR = Math.max(hsize.y, hsize.z) / 2;
      return {
        position: [hc.x, hc.y, hc.z],
        radius: tireRadius > 0 ? tireRadius : rimR * TIRE_SCALE,
        width: Math.max(hsize.x, rimR * 0.62),
        side: hc.x >= 0 ? 1 : -1,
      };
    });
    setHubs(xforms);
  }, [prepared]);

  // Decide which factory wheel parts stay visible:
  //  • oem   → everything (its own rims, tires, calipers, discs)
  //  • proc  → hide rims + tires (the procedural wheel brings its own tire),
  //            keep calipers + discs so they show through the spokes
  //  • model → hide the whole corner; the real wheel GLB has tire + caliper
  useEffect(() => {
    const k = wheelStyle.kind;
    const showRim = k === 'oem';
    const showCorner = k !== 'model';
    prepared.hubMeshes.forEach((m) => (m.visible = showRim));
    prepared.tireMeshes.forEach((m) => (m.visible = showRim));
    prepared.brakeMeshes.forEach((m) => (m.visible = showCorner));
    prepared.diskMeshes.forEach((m) => (m.visible = showCorner));
  }, [wheelStyle, prepared]);

  // ---- Paint colour + finish ----
  useEffect(() => {
    const target = new Color(paint.hex).convertSRGBToLinear();
    const duration = reducedMotion ? 0 : 0.7;
    prepared.paintMats.forEach((m) => {
      gsap.to(m.color, { r: target.r, g: target.g, b: target.b, duration, ease: 'power2.inOut' });
      gsap.to(m, {
        metalness: paintFinish.metalness,
        roughness: paintFinish.roughness,
        envMapIntensity: paintFinish.env,
        duration,
        ease: 'power2.inOut',
      });
    });
  }, [paint, paintFinish, prepared, reducedMotion]);

  // ---- Wheel / caliper finish (OEM material) ----
  // Colour comes from the rim finish; metalness / roughness / reflections come
  // from the chosen surface type (gloss, matte, chrome …).
  useEffect(() => {
    const target = new Color(wheelFinish.hex).convertSRGBToLinear();
    const duration = reducedMotion ? 0 : 0.6;
    prepared.wheelMats.forEach((m) => {
      m.map = null;
      gsap.to(m.color, { r: target.r, g: target.g, b: target.b, duration, ease: 'power2.inOut' });
      gsap.to(m, {
        metalness: wheelSurface.metalness,
        roughness: wheelSurface.roughness,
        envMapIntensity: wheelSurface.env,
        duration,
        ease: 'power2.inOut',
      });
    });
  }, [wheelFinish, wheelSurface, prepared, reducedMotion]);

  // ---- Headlight colour (emissive; beams take it via the colour prop) ----
  useEffect(() => {
    const c = new Color(headlightColor.hex);
    prepared.lightMats.forEach((m) => m.emissive.copy(c));
  }, [headlightColor, prepared]);

  // ---- Headlights: off / low (ближний) / high (дальний) ----
  // Low beam is dimmer, wider and aimed down at the road; high beam is brighter,
  // tighter and flattened out so it throws further.
  useEffect(() => {
    const beam = beamSetting(beamMode);
    const on = beam.id !== 'off';
    const duration = reducedMotion ? 0 : 0.5;
    gsap.to(prepared.lightMats, {
      emissiveIntensity: beam.emissive,
      duration,
      ease: on ? 'power2.out' : 'power2.in',
    });
    const beams = [leftBeam.current, rightBeam.current].filter(Boolean);
    gsap.to(beams, {
      intensity: beam.beam,
      angle: beam.angle,
      distance: beam.distance,
      duration,
      ease: 'power2.out',
    });
    gsap.to([beamTargets.l.position, beamTargets.r.position], {
      y: beam.aimY,
      duration,
      ease: 'power2.out',
    });
  }, [beamMode, prepared, reducedMotion, beamTargets]);

  // ---- Taillight colour ----
  useEffect(() => {
    const c = new Color(taillightColor.hex);
    prepared.tailMats.forEach((m) => {
      m.color.copy(c);
      m.emissive.copy(c);
      m.emissiveIntensity = 0.85;
      m.needsUpdate = true;
    });
  }, [taillightColor, prepared]);

  // ---- Window tint ----
  // The glass is a transmission material with a transmission *texture*, so the
  // centre stays see-through no matter the transmission factor. To tint, drop
  // both the transmission map and the base-colour map and drive a solid dark
  // glass; restore the originals at 0%.
  useEffect(() => {
    const t = windowTint;
    prepared.glassMats.forEach(({ mat, base }) => {
      if (t <= 0.001) {
        // Factory clear glass.
        mat.color.copy(base.color);
        mat.opacity = base.opacity;
        mat.transmission = base.transmission;
        mat.map = base.map;
        mat.transmissionMap = base.transmissionMap;
        mat.envMapIntensity = 1.3;
      } else {
        // Pure black overlay, opacity-driven (no transmission, no maps) so it
        // darkens to black instead of a white haze.
        mat.map = null;
        mat.transmissionMap = null;
        mat.transmission = 0;
        mat.color.setScalar(0);
        mat.opacity = Math.min(1, 0.08 + t);
        mat.envMapIntensity = 0.2;
      }
      mat.transparent = true;
      mat.needsUpdate = true;
    });
  }, [windowTint, prepared]);

  // ---- Carbon parts (hood vents / spoiler / diffuser) ----
  useEffect(() => {
    const bodyColor = new Color(paint.hex).convertSRGBToLinear();
    prepared.carbonMats.forEach(({ mat, baseColor, baseMap }) => {
      if (carbonOn) {
        mat.color.copy(baseColor);
        mat.map = baseMap;
        mat.metalness = 0.4;
        mat.roughness = 0.48;
      } else {
        mat.map = null;
        mat.color.copy(bodyColor);
        mat.metalness = paintFinish.metalness;
        mat.roughness = paintFinish.roughness;
        if ('envMapIntensity' in mat) mat.envMapIntensity = paintFinish.env;
      }
      mat.needsUpdate = true;
    });
  }, [carbonOn, paint, paintFinish, prepared]);

  // ---- Turntable ----
  useFrame((_, delta) => {
    if (spin.current && autoSpin && !reducedMotion) {
      spin.current.rotation.y += delta * 0.26;
    }
  });

  return (
    <group ref={spin}>
      <primitive object={prepared.root} />

      {wheelStyle.kind === 'proc' &&
        hubs.map((h, i) => (
          <ProceduralWheel
            key={i}
            position={h.position}
            radius={h.radius}
            width={h.width}
            side={h.side}
            spokes={wheelStyle.spokes ?? 5}
            split={wheelStyle.split ?? false}
            color={wheelFinish.hex}
            metalness={wheelSurface.metalness}
            roughness={wheelSurface.roughness}
            env={wheelSurface.env}
          />
        ))}

      {wheelStyle.kind === 'model' && wheelStyle.url && (
        <Suspense fallback={null}>
          {hubs.map((h, i) => (
            <WheelModel
              key={i}
              url={wheelStyle.url!}
              position={h.position}
              targetRadius={h.radius}
              side={h.side}
              color={wheelFinish.hex}
              metalness={wheelSurface.metalness}
              roughness={wheelSurface.roughness}
              env={wheelSurface.env}
            />
          ))}
        </Suspense>
      )}

      {/* Headlight beams (front faces +Z after auto-orient) */}
      <primitive object={beamTargets.l} />
      <primitive object={beamTargets.r} />
      <spotLight
        ref={leftBeam}
        position={[-0.62, 0.7, 2.0]}
        target={beamTargets.l}
        angle={0.5}
        penumbra={0.7}
        distance={18}
        intensity={0}
        color={headlightColor.hex}
      />
      <spotLight
        ref={rightBeam}
        position={[0.62, 0.7, 2.0]}
        target={beamTargets.r}
        angle={0.5}
        penumbra={0.7}
        distance={18}
        intensity={0}
        color={headlightColor.hex}
      />
    </group>
  );
}

useGLTF.preload(CAR_MODEL_URL);
WHEEL_MODEL_URLS.forEach((url) => useGLTF.preload(url));
