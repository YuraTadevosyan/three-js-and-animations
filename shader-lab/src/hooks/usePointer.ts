import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Returns a stable ref holding a Vector2 with the current pointer in 0..1 UV space
 * (origin at bottom-left, matching gl_FragCoord/uv conventions).
 *
 * Smoothed slightly so shader uniforms don't jitter on rapid mouse moves.
 */
export function usePointerUV(smoothing = 0.18) {
  const ref = useRef(new THREE.Vector2(0.5, 0.5));
  useFrame((state) => {
    // R3F pointer: x in [-1, 1] left→right, y in [-1, 1] bottom→top
    const tx = (state.pointer.x + 1) * 0.5;
    const ty = (state.pointer.y + 1) * 0.5;
    ref.current.x += (tx - ref.current.x) * smoothing;
    ref.current.y += (ty - ref.current.y) * smoothing;
  });
  return ref;
}
