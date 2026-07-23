import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { globalUniforms } from '@/shaders/uniforms';
import { useUniverse } from '@/state/universeStore';

const _dir = new THREE.Vector3();
const _col = new THREE.Color();

/**
 * The master clock. Advances the shared uniforms once per frame and animates
 * the dynamic key light — a distant sun that slowly circles the cosmos with a
 * drifting hue, lighting every world in unison. Also holds the scene lights
 * used by the (rare) monolith standard material.
 */
export function FrameDirector() {
  const light = useRef<THREE.DirectionalLight>(null);
  const { shared } = useUniverse();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    globalUniforms.uTime.value = t;
    globalUniforms.uWarp.value = shared.warp;

    const slow = shared.reducedMotion ? 0.015 : 0.055;
    _dir
      .set(
        Math.sin(t * slow) * 0.65,
        0.42 + 0.22 * Math.sin(t * 0.03),
        Math.cos(t * slow) * 0.65,
      )
      .normalize();
    globalUniforms.uLightDir.value.copy(_dir);

    const hue = ((0.58 + 0.06 * Math.sin(t * 0.05)) % 1 + 1) % 1;
    _col.setHSL(hue, 0.42, 0.72);
    globalUniforms.uLightColor.value.copy(_col);

    if (light.current) {
      light.current.position.copy(_dir).multiplyScalar(140);
      light.current.color.copy(_col);
    }
  });

  return (
    <>
      <ambientLight intensity={0.32} color="#4a5a99" />
      <directionalLight ref={light} intensity={1.5} />
    </>
  );
}
