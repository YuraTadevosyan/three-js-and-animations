import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { createNoise2D } from 'simplex-noise';
import { UNIVERSE } from '@/lib/config';
import { mulberry32 } from '@/lib/rng';
import { useUniverse } from '@/state/universeStore';

const _desired = new THREE.Vector3();

/**
 * Drives the endless flight. Cruising, the camera falls forever down the -Z
 * corridor while organic simplex noise (and the pointer) makes it wander like
 * a ship on manual trim. Selecting a world hands control to a GSAP fly-to that
 * eases in, then settles into a slow orbit; releasing resumes the drift.
 */
export function CameraRig() {
  const { camera } = useThree();
  const { shared, focus } = useUniverse();

  // Deterministic wander so the flight path is stable across reloads.
  const noise = useMemo(() => createNoise2D(mulberry32(0xc0ffee)), []);
  const lookTarget = useRef(new THREE.Vector3(0, 0, -UNIVERSE.lookAhead));
  const orbit = useRef({
    active: false,
    angle: 0,
    radius: 12,
    y: 0,
    world: new THREE.Vector3(),
  });
  const tweens = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, -UNIVERSE.lookAhead);
  }, [camera]);

  // Fly-to / release when the focused world changes.
  useEffect(() => {
    tweens.current.forEach((t) => t.kill());
    tweens.current = [];
    orbit.current.active = false;

    if (!focus) return;

    const w = focus.position;
    const size = focus.size;
    const dest = new THREE.Vector3(
      w.x + size * 1.7,
      w.y + size * 0.55,
      w.z + size * 3.6 + 6,
    );
    const proxy = lookTarget.current.clone();
    const dur = shared.reducedMotion ? 0.6 : 2.1;

    const t1 = gsap.to(camera.position, {
      x: dest.x,
      y: dest.y,
      z: dest.z,
      duration: dur,
      ease: 'power3.inOut',
    });
    const t2 = gsap.to(proxy, {
      x: w.x,
      y: w.y,
      z: w.z,
      duration: dur,
      ease: 'power3.inOut',
      onUpdate: () => {
        camera.lookAt(proxy);
        lookTarget.current.copy(proxy);
      },
      onComplete: () => {
        const o = orbit.current;
        o.active = true;
        o.world.copy(w);
        o.radius = camera.position.distanceTo(w);
        o.angle = Math.atan2(camera.position.x - w.x, camera.position.z - w.z);
        o.y = camera.position.y;
      },
    });
    tweens.current = [t1, t2];
  }, [focus, camera, shared]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const clampedDt = Math.min(dt, 0.05);

    if (shared.paused) {
      // Focused: slow orbit around the scanned world once we've arrived.
      const o = orbit.current;
      if (o.active) {
        o.angle += clampedDt * 0.12 * (shared.reducedMotion ? 0.3 : 1);
        camera.position.set(
          o.world.x + Math.sin(o.angle) * o.radius,
          o.y,
          o.world.z + Math.cos(o.angle) * o.radius,
        );
        camera.lookAt(o.world);
      }
      shared.camZ = camera.position.z;
      return;
    }

    // Cruise: fall forever down the corridor.
    const effSpeed =
      UNIVERSE.baseSpeed *
      shared.speedMul *
      (1 + shared.warp * (UNIVERSE.warpMultiplier - 1));
    camera.position.z -= effSpeed * clampedDt;

    // Organic wander, nudged by the pointer.
    const wander = shared.reducedMotion ? 0.4 : 1;
    const nx = noise(t * 0.05, 0) * UNIVERSE.wanderAmp * wander + shared.pointer.x * 6;
    const ny =
      noise(0, t * 0.05) * UNIVERSE.wanderAmp * 0.7 * wander + shared.pointer.y * 4;
    const k = Math.min(clampedDt * 0.8, 1);
    camera.position.x += (nx - camera.position.x) * k;
    camera.position.y += (ny - camera.position.y) * k;

    // Aim ahead, leading the wander a little for a natural banking feel.
    _desired.set(
      camera.position.x + shared.pointer.x * 10 + noise(t * 0.05, 5) * 4,
      camera.position.y + shared.pointer.y * 7 + noise(5, t * 0.05) * 3,
      camera.position.z - UNIVERSE.lookAhead,
    );
    lookTarget.current.lerp(_desired, Math.min(clampedDt * 2.2, 1));
    camera.lookAt(lookTarget.current);

    shared.camZ = camera.position.z;
    shared.distance = -camera.position.z;
  });

  return null;
}
