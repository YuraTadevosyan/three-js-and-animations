import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { DemoComponentProps, DemoDef } from '@/lib/types';
import { FULLSCREEN_VERT, HSV2RGB } from '@/shaders/common';
import { usePointerUV } from '@/hooks/usePointer';

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uPointer;
uniform float uScale;
uniform float uSpeed;
uniform float uJitter;
uniform float uHue;
uniform float uEdge;
uniform float uOpacity;

${HSV2RGB}

vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)),
           dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123);
}

/** Returns (distance to nearest seed, distance to second nearest, cell id hash). */
vec3 voronoi(vec2 x, float t, float jitter, vec2 pullCenter) {
  vec2 n = floor(x);
  vec2 f = fract(x);

  float d1 = 8.0;
  float d2 = 8.0;
  float id = 0.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 seed = hash22(n + g);
      // Animate seeds — sin/cos to keep them inside the cell bounds.
      vec2 offset = 0.5 + 0.5 * sin(t + 6.2831 * seed) * jitter;
      // Pull cells gently toward the pointer.
      offset += 0.20 * (pullCenter - (n + g + offset));
      vec2 r = g + offset - f;
      float d = dot(r, r);

      if (d < d1) {
        d2 = d1;
        d1 = d;
        id = dot(n + g, vec2(7.0, 113.0));
      } else if (d < d2) {
        d2 = d;
      }
    }
  }
  return vec3(sqrt(d1), sqrt(d2), id);
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  vec2 p = (uv - 0.5) * aspect * uScale;
  vec2 ptr = (uPointer - 0.5) * aspect * uScale;
  float t = uTime * uSpeed;

  vec3 v = voronoi(p, t, uJitter, ptr);
  float edge = v.y - v.x;     // distance between nearest two seeds
  float cellHue = fract(uHue + 0.05 * sin(v.z) + 0.15 * fract(v.z * 0.013));

  vec3 cell = hsv2rgb(vec3(cellHue, 0.55, 0.85 - v.x * 0.4));

  // Edge highlight — bright where two cells meet.
  float edgeMask = smoothstep(0.04, 0.0, edge);
  vec3 edgeColor = hsv2rgb(vec3(fract(uHue + 0.5), 0.4, 1.0));
  vec3 color = mix(cell, edgeColor, edgeMask * uEdge);

  // Subtle inner glow at the cell core.
  color += hsv2rgb(vec3(cellHue, 0.3, 1.0)) * smoothstep(0.6, 0.0, v.x) * 0.25;

  // Vignette
  float vig = smoothstep(1.2, 0.30, length(uv - 0.5));
  color *= vig * 0.92 + 0.08;

  gl_FragColor = vec4(color, uOpacity);
}
`;

function VoronoiDemo({ params, opacityRef }: DemoComponentProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = usePointerUV();
  const { size, viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime:       { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer:    { value: new THREE.Vector2(0.5, 0.5) },
      uScale:      { value: params.scale as number },
      uSpeed:      { value: params.speed as number },
      uJitter:     { value: params.jitter as number },
      uHue:        { value: params.hue as number },
      uEdge:       { value: params.edge as number },
      uOpacity:    { value: 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((_, dt) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    u.uTime.value += dt;
    u.uResolution.value.set(size.width * viewport.dpr, size.height * viewport.dpr);
    u.uPointer.value.copy(pointer.current);
    u.uScale.value   = params.scale as number;
    u.uSpeed.value   = params.speed as number;
    u.uJitter.value  = params.jitter as number;
    u.uHue.value     = params.hue as number;
    u.uEdge.value    = params.edge as number;
    u.uOpacity.value = opacityRef.current;
  });

  return (
    <mesh frustumCulled={false} renderOrder={0}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={FULLSCREEN_VERT}
        fragmentShader={FRAG}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export const voronoiDemo: DemoDef = {
  id: 'voronoi',
  name: 'Voronoi',
  tagline: 'Animated cellular noise — pointer drags seeds toward the cursor.',
  accent: '#fbbf24',
  fullscreen: true,
  Component: VoronoiDemo,
  controls: [
    { type: 'range', key: 'scale',  label: 'Cell density', min: 2,  max: 24,  step: 0.1,  default: 8 },
    { type: 'range', key: 'speed',  label: 'Speed',        min: 0,  max: 2.5, step: 0.01, default: 0.8 },
    { type: 'range', key: 'jitter', label: 'Jitter',       min: 0,  max: 1.0, step: 0.01, default: 0.85 },
    { type: 'range', key: 'edge',   label: 'Edge glow',    min: 0,  max: 1.5, step: 0.01, default: 0.7 },
    { type: 'range', key: 'hue',    label: 'Hue',          min: 0,  max: 1.0, step: 0.001, default: 0.10 },
  ],
};
