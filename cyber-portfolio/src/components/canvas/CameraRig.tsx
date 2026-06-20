'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from '@/store/useScene';
import { WAYPOINTS } from './waypoints';

/**
 * Drives the camera from the scene store. Two things blend together:
 *  1. a per-section waypoint (the cinematic "dolly" between sections), and
 *  2. a subtle pointer parallax so the frame feels alive when idle.
 *
 * All easing is frame-rate independent (damp factor uses delta), so it holds
 * 60fps on a laptop and still behaves on a 144Hz monitor.
 */
export function CameraRig() {
  const { camera } = useThree();

  // Smoothed working vectors so we never snap.
  const pos = useRef(WAYPOINTS.hero.position.clone());
  const look = useRef(WAYPOINTS.hero.target.clone());
  const lookHelper = useRef(new THREE.Vector3());
  const smoothedPointer = useRef(new THREE.Vector2());

  useFrame((_, delta) => {
    const { active, pointer, reducedMotion } = useScene.getState();
    const wp = WAYPOINTS[active];

    // Exponential damping — independent of frame rate.
    const ease = 1 - Math.pow(0.0016, delta);

    // Pointer parallax, eased separately and toned down on reduced motion.
    const parallax = reducedMotion ? 0 : 1;
    smoothedPointer.current.x +=
      (pointer.x - smoothedPointer.current.x) * (1 - Math.pow(0.02, delta));
    smoothedPointer.current.y +=
      (pointer.y - smoothedPointer.current.y) * (1 - Math.pow(0.02, delta));

    const px = smoothedPointer.current.x * 0.6 * parallax;
    const py = -smoothedPointer.current.y * 0.35 * parallax;

    pos.current.lerp(wp.position, ease);
    look.current.lerp(wp.target, ease);

    camera.position.set(
      pos.current.x + px,
      pos.current.y + py,
      pos.current.z,
    );

    lookHelper.current.set(
      look.current.x + px * 0.25,
      look.current.y + py * 0.25,
      look.current.z,
    );
    camera.lookAt(lookHelper.current);
  });

  return null;
}
