import * as THREE from 'three';

/**
 * Uniforms shared by reference across every world material and the nebula.
 * A single frame director updates them once per frame; because each material
 * holds the same uniform objects, one write lights the whole cosmos at once.
 * The scene is a singleton, so a module-level object is the simplest home.
 */
export const globalUniforms = {
  uTime: { value: 0 },
  uLightDir: { value: new THREE.Vector3(0.4, 0.55, 0.7).normalize() },
  uLightColor: { value: new THREE.Color('#e6ecff') },
  uWarp: { value: 0 },
};

export type GlobalUniforms = typeof globalUniforms;
