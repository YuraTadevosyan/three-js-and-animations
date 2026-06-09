import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import {
  Box3,
  Color,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
  Object3D,
  Vector3,
} from 'three';

import { CAR_MODEL_URL, MAT } from '@/lib/config';
import { useConfig } from '@/state/configStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const TARGET_LENGTH = 4.5; // fit the car to ~4.5 world units long

interface PreparedModel {
  root: Object3D;
  paintMats: MeshStandardMaterial[];
  wheelMats: MeshStandardMaterial[];
  lightMats: MeshStandardMaterial[];
  rearMesh: Mesh | null;
}

/**
 * Loads the BMW M3 GTR GLB, clones it (so the cached asset is never mutated),
 * enables shadows, isolates the materials the configurator drives, and
 * auto-fits + auto-orients the body to the origin. Paint, wheel finish and
 * headlights are tweened with GSAP off the live config.
 */
export function CarModel() {
  const { paint, wheel, headlightsOn, autoSpin } = useConfig();
  const reducedMotion = useReducedMotion();
  const { scene } = useGLTF(CAR_MODEL_URL);
  const spin = useRef<Group>(null);
  const leftBeam = useRef<import('three').SpotLight>(null);
  const rightBeam = useRef<import('three').SpotLight>(null);
  const beamTargets = useMemo(() => {
    const l = new Object3D();
    const r = new Object3D();
    l.position.set(-0.6, -0.4, 14);
    r.position.set(0.6, -0.4, 14);
    return { l, r };
  }, []);

  // Clone once and collect the driveable materials. Cloning the materials keeps
  // our colour tweens isolated from drei's shared GLTF cache.
  const prepared = useMemo<PreparedModel>(() => {
    const root = scene.clone(true);
    const paintMats: MeshStandardMaterial[] = [];
    const wheelMats: MeshStandardMaterial[] = [];
    const lightMats: MeshStandardMaterial[] = [];
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
          // Drop the baked livery so solid configurator colours read true
          // (a multiply tint over a blue texture can't become white/yellow).
          mat.map = null;
          paintMats.push(mat);
          break;
        case MAT.wheel:
          wheelMats.push(mat);
          break;
        case MAT.lights:
          mat.emissive = new Color('#ffffff');
          mat.emissiveIntensity = 0;
          mat.toneMapped = false;
          lightMats.push(mat);
          break;
      }
      if (mat.name === MAT.taillight) rearMesh = mesh;
    });

    return { root, paintMats, wheelMats, lightMats, rearMesh };
  }, [scene]);

  // Auto-fit: scale to a known length, lay the long axis along Z, put the rear
  // at -Z (so the front faces the hero camera), then centre + sit on the floor.
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

    // The taillight glass unambiguously marks the rear — push it to -Z.
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
  }, [prepared]);

  // ---- Paint transition ----
  useEffect(() => {
    const target = new Color(paint.hex).convertSRGBToLinear();
    const duration = reducedMotion ? 0 : 0.7;
    prepared.paintMats.forEach((m) => {
      gsap.to(m.color, {
        r: target.r,
        g: target.g,
        b: target.b,
        duration,
        ease: 'power2.inOut',
      });
      gsap.to(m, {
        metalness: paint.metalness,
        roughness: paint.roughness,
        duration,
        ease: 'power2.inOut',
      });
    });
  }, [paint, prepared, reducedMotion]);

  // ---- Wheel / caliper finish ----
  useEffect(() => {
    const target = new Color(wheel.hex).convertSRGBToLinear();
    const duration = reducedMotion ? 0 : 0.6;
    prepared.wheelMats.forEach((m) => {
      m.map = null; // let the finish colour read cleanly
      gsap.to(m.color, {
        r: target.r,
        g: target.g,
        b: target.b,
        duration,
        ease: 'power2.inOut',
      });
      gsap.to(m, {
        metalness: wheel.metalness,
        roughness: wheel.roughness,
        duration,
        ease: 'power2.inOut',
      });
    });
  }, [wheel, prepared, reducedMotion]);

  // ---- Headlights ----
  useEffect(() => {
    const duration = reducedMotion ? 0 : 0.5;
    gsap.to(prepared.lightMats, {
      emissiveIntensity: headlightsOn ? 3 : 0,
      duration,
      ease: headlightsOn ? 'power2.out' : 'power2.in',
    });
    const beams = [leftBeam.current, rightBeam.current].filter(Boolean);
    gsap.to(beams, {
      intensity: headlightsOn ? 24 : 0,
      duration,
      ease: 'power2.out',
    });
  }, [headlightsOn, prepared, reducedMotion]);

  // ---- Turntable ----
  useFrame((_, delta) => {
    if (spin.current && autoSpin && !reducedMotion) {
      spin.current.rotation.y += delta * 0.26;
    }
  });

  return (
    <group ref={spin}>
      <primitive object={prepared.root} />

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
        color="#eaf4ff"
      />
      <spotLight
        ref={rightBeam}
        position={[0.62, 0.7, 2.0]}
        target={beamTargets.r}
        angle={0.5}
        penumbra={0.7}
        distance={18}
        intensity={0}
        color="#eaf4ff"
      />
    </group>
  );
}

useGLTF.preload(CAR_MODEL_URL);
