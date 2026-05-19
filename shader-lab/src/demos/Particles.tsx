import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { DemoComponentProps, DemoDef } from '@/lib/types';
import { HSV2RGB } from '@/shaders/common';
import { usePointerUV } from '@/hooks/usePointer';

const PARTICLE_COUNT = 25000;

const VERT = /* glsl */ `
attribute vec3 aSeed;
attribute float aOffset;
uniform float uTime;
uniform float uPointSize;
uniform float uCurl;
uniform vec3  uAttractor;
uniform float uAttract;
uniform float uHue;
varying float vLife;
varying float vHue;

vec3 curlField(vec3 p, float t) {
  float n1 = sin(p.x * 1.1 + t * 0.6) + cos(p.y * 1.3 - t * 0.4);
  float n2 = sin(p.y * 1.2 - t * 0.5) + cos(p.z * 1.4 + t * 0.3);
  float n3 = sin(p.z * 1.5 + t * 0.7) + cos(p.x * 1.0 - t * 0.5);
  return vec3(n2 - n3, n3 - n1, n1 - n2);
}

void main() {
  vec3 base = aSeed * 3.0;
  float t = uTime + aOffset * 12.0;

  vec3 v = curlField(base + t * 0.07, t * 0.18);
  vec3 pos = base + v * uCurl;

  // Pointer attraction (z=0 plane projection)
  vec3 toP = uAttractor - pos;
  float d = length(toP) + 1e-3;
  vec3 pull = (toP / d) * smoothstep(2.2, 0.0, d) * uAttract;
  pos += pull;

  vec4 mvPosition = viewMatrix * modelMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  gl_PointSize = uPointSize * (320.0 / max(-mvPosition.z, 0.1));
  vLife = 0.5 + 0.5 * sin(t * 0.6 + aOffset * 6.2831);
  vHue  = uHue + aOffset * 0.45;
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying float vLife;
varying float vHue;
uniform float uOpacity;
${HSV2RGB}

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  // Soft circular falloff with bright core
  float core = smoothstep(0.5, 0.0, r);
  float glow = pow(core, 2.4);
  vec3 col = hsv2rgb(vec3(fract(vHue), 0.75, 1.0));
  col *= 0.55 + vLife * 0.9;
  gl_FragColor = vec4(col * glow, glow * uOpacity);
}
`;

function ParticlesDemo({ params, opacityRef }: DemoComponentProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = usePointerUV();
  const { camera, viewport } = useThree();

  // Static per-particle attributes — uploaded once, animated in vertex shader.
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const seeds     = new Float32Array(PARTICLE_COUNT * 3);
    const offsets   = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // positions are unused at runtime (vert ignores them) but BufferGeometry needs one.
      positions[i * 3 + 0] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      // Seeds in [-1, 1]
      seeds[i * 3 + 0] = Math.random() * 2 - 1;
      seeds[i * 3 + 1] = Math.random() * 2 - 1;
      seeds[i * 3 + 2] = Math.random() * 2 - 1;
      offsets[i] = Math.random();
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSeed',    new THREE.BufferAttribute(seeds, 3));
    geo.setAttribute('aOffset',  new THREE.BufferAttribute(offsets, 1));
    // Big bounding sphere — animation happens in the vertex shader, so the
    // CPU-side bounds are meaningless. Disable frustum culling on the Points.
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime:      { value: 0 },
      uPointSize: { value: params.size as number },
      uCurl:      { value: params.curl as number },
      uAttractor: { value: new THREE.Vector3() },
      uAttract:   { value: params.attract as number },
      uHue:       { value: params.hue as number },
      uOpacity:   { value: 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((_, dt) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    u.uTime.value += dt;
    u.uPointSize.value = params.size as number;
    u.uCurl.value      = params.curl as number;
    u.uAttract.value   = params.attract as number;
    u.uHue.value       = params.hue as number;
    u.uOpacity.value   = opacityRef.current;

    // Project pointer (uv 0..1) to world on z=0 plane.
    const ndc = new THREE.Vector3(
      pointer.current.x * 2 - 1,
      pointer.current.y * 2 - 1,
      0.5,
    );
    ndc.unproject(camera);
    const dir = ndc.sub(camera.position).normalize();
    const tHit = -camera.position.z / dir.z;
    u.uAttractor.value.copy(camera.position).add(dir.multiplyScalar(tHit));
  });

  // Hint: keep additive blending so overlapping particles brighten.
  return (
    <points geometry={geometry} frustumCulled={false} scale={Math.min(1, viewport.aspect)}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export const particlesDemo: DemoDef = {
  id: 'particles',
  name: 'Particle Sim',
  tagline: `${PARTICLE_COUNT.toLocaleString()} GPU particles driven by a curl field.`,
  accent: '#ec4899',
  Component: ParticlesDemo,
  controls: [
    { type: 'range', key: 'size',    label: 'Point size',    min: 1,   max: 8,   step: 0.1,  default: 2.5 },
    { type: 'range', key: 'curl',    label: 'Curl strength', min: 0,   max: 1.5, step: 0.01, default: 0.5 },
    { type: 'range', key: 'attract', label: 'Pointer pull',  min: 0,   max: 3.0, step: 0.01, default: 1.2 },
    { type: 'range', key: 'hue',     label: 'Hue',           min: 0,   max: 1.0, step: 0.001, default: 0.85 },
  ],
};
