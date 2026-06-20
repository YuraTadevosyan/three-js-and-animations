'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const NEON = [
  new THREE.Color('#00f0ff'),
  new THREE.Color('#1b6bff'),
  new THREE.Color('#ff2bd6'),
  new THREE.Color('#9d4dff'),
  new THREE.Color('#fcee0a'),
];

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aScale;
  attribute float aSpeed;
  attribute vec3 aColor;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    vec3 p = position;
    // Gentle, GPU-only drift — no CPU array churn each frame.
    float t = uTime * aSpeed;
    p.y += sin(t + position.x * 0.6) * 0.6;
    p.x += cos(t * 0.8 + position.z * 0.5) * 0.4;
    p.z += sin(t * 0.6 + position.y * 0.4) * 0.4;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // Size attenuation: nearer points are bigger.
    gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / -mv.z);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  void main() {
    // Soft round sprite with a hot core, additively blended for neon bloom.
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.18, 0.0, d);
    vec3 col = vColor * (glow * 0.8 + core * 1.6);
    gl_FragColor = vec4(col, glow);
  }
`;

export function Particles({ count = 900, radius = 14 }: { count?: number; radius?: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, scales, speeds, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Distribute in a flattened sphere for a "volumetric dust" look.
      const r = radius * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = (r * Math.cos(phi)) * 0.5 + 2.0;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      scales[i] = 6 + Math.random() * 22;
      speeds[i] = 0.15 + Math.random() * 0.5;

      const c = NEON[Math.floor(Math.random() * NEON.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, scales, speeds, colors };
  }, [count, radius]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 26 },
      uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
