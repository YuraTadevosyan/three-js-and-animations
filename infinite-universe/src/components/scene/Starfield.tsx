import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { globalUniforms } from '@/shaders/uniforms';

const STAR_COUNT = 2600;

const STAR_VERT = /* glsl */ `
uniform float uTime;
attribute float aPhase;
attribute float aSize;
attribute vec3 aColor;
out float vTw;
out vec3 vColor;
void main() {
  vTw = 0.55 + 0.45 * sin(uTime * 1.4 + aPhase * 6.2831);
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (620.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

const STAR_FRAG = /* glsl */ `
precision highp float;
in float vTw;
in vec3 vColor;
out vec4 outColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  outColor = vec4(vColor * (0.5 + 0.9 * vTw), a * (0.35 + 0.65 * vTw));
}
`;

/**
 * Crisp twinkling stars on a spherical shell that recenters on the camera —
 * always around you, never any closer. The parallax-free counterpart to the
 * nebula backdrop.
 */
export function Starfield() {
  const ref = useRef<THREE.Points>(null);
  const { camera } = useThree();

  const geometry = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const phases = new Float32Array(STAR_COUNT);
    const sizes = new Float32Array(STAR_COUNT);
    const colors = new Float32Array(STAR_COUNT * 3);
    const tint = new THREE.Color();
    for (let i = 0; i < STAR_COUNT; i++) {
      // Even-ish distribution on a sphere shell.
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 620 + Math.random() * 220;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      phases[i] = Math.random();
      sizes[i] = 1.2 + Math.pow(Math.random(), 3) * 5.5;
      // Mostly white-blue, occasionally warm.
      const roll = Math.random();
      const hue = roll < 0.15 ? 0.09 : roll < 0.3 ? 0.55 : 0.62;
      const sat = roll < 0.3 ? 0.55 : 0.18;
      tint.setHSL(hue, sat, 0.85);
      colors[i * 3] = tint.r;
      colors[i * 3 + 1] = tint.g;
      colors[i * 3 + 2] = tint.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    g.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  const uniforms = useMemo(() => ({ uTime: globalUniforms.uTime }), []);

  useFrame(() => {
    if (ref.current) ref.current.position.copy(camera.position);
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false} renderOrder={-5}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={STAR_VERT}
        fragmentShader={STAR_FRAG}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
        glslVersion={THREE.GLSL3}
      />
    </points>
  );
}
