import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { DemoComponentProps, DemoDef } from '@/lib/types';
import { FULLSCREEN_VERT, HSV2RGB, VALUE_NOISE } from '@/shaders/common';
import { usePointerUV } from '@/hooks/usePointer';

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uPointer;
uniform float uIntensity;
uniform float uSpeed;
uniform float uHue;
uniform float uSpread;
uniform float uStars;
uniform float uOpacity;

${HSV2RGB}
${VALUE_NOISE}
// hash21 is provided by VALUE_NOISE

float starfield(vec2 uv, float density) {
  // Coarse grid → per-cell star with random brightness and twinkle.
  vec2 g = floor(uv * 80.0);
  vec2 f = fract(uv * 80.0) - 0.5;
  float h = hash21(g);
  float keep = step(1.0 - density, h);
  float twinkle = 0.6 + 0.4 * sin(uTime * (2.0 + h * 6.0) + h * 12.0);
  float d = length(f);
  return keep * smoothstep(0.07, 0.0, d) * twinkle;
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  float t = uTime * uSpeed;

  // Night-sky background gradient (deep navy → near-black at horizon).
  vec3 sky = mix(
    vec3(0.005, 0.012, 0.04),
    vec3(0.04, 0.05, 0.10),
    smoothstep(0.0, 1.0, uv.y)
  );
  vec3 color = sky;

  // Sparse star layer behind the aurora.
  color += vec3(1.0, 0.95, 0.9) * starfield(uv * aspect, uStars);

  // Pointer creates one extra ribbon centered under the cursor.
  float px = uPointer.x;

  // Layered ribbons. Each ribbon's y-baseline drifts with low-freq noise and
  // the ribbon body is a soft falloff around that baseline.
  float aurora = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float band = 0.35 + fi * 0.10;
    float drift = fbm(vec2(uv.x * (2.0 + fi * 0.6) + t * (0.20 + fi * 0.05), fi * 4.0));
    float y = band + (drift - 0.5) * 0.30;
    float bodyWidth = 0.06 + 0.02 * sin(uv.x * 8.0 + t + fi);
    float intensity = exp(-pow((uv.y - y) / bodyWidth, 2.0));

    // Each ribbon gets its own hue offset so the curtain has chroma variation.
    vec3 ribbon = hsv2rgb(vec3(fract(uHue + fi * 0.05 + uv.x * 0.10), 0.7, 1.0));
    // Horizontal flicker so ribbons shimmer.
    float shimmer = 0.6 + 0.4 * sin(uv.x * 16.0 - t * 1.5 + fi);
    aurora += intensity * shimmer * 0.45;
    color += ribbon * intensity * shimmer * uIntensity * uSpread;
  }

  // Extra pointer-driven ribbon.
  {
    float bodyWidth = 0.04;
    float y = 0.45 + 0.08 * sin(uv.x * 10.0 + t);
    float pointerMask = exp(-pow((uv.x - px) * 2.5, 2.0));
    float intensity = exp(-pow((uv.y - y) / bodyWidth, 2.0)) * pointerMask;
    vec3 ribbon = hsv2rgb(vec3(fract(uHue + 0.5), 0.5, 1.0));
    color += ribbon * intensity * uIntensity * 1.4;
    aurora += intensity * 0.6;
  }

  // Slight bottom horizon glow.
  color += vec3(0.05, 0.10, 0.18) * smoothstep(0.0, 0.25, 1.0 - uv.y) * 0.3;

  // Auroras reflect onto the lower half — faint mirror.
  // Soft tonemap so bright stacks don't blow out.
  color = color / (1.0 + color * 0.4);

  gl_FragColor = vec4(color, uOpacity);
}
`;

function AuroraDemo({ params, opacityRef }: DemoComponentProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = usePointerUV();
  const { size, viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime:       { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer:    { value: new THREE.Vector2(0.5, 0.5) },
      uIntensity:  { value: params.intensity as number },
      uSpeed:      { value: params.speed as number },
      uHue:        { value: params.hue as number },
      uSpread:     { value: params.spread as number },
      uStars:      { value: params.stars as number },
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
    u.uIntensity.value = params.intensity as number;
    u.uSpeed.value     = params.speed as number;
    u.uHue.value       = params.hue as number;
    u.uSpread.value    = params.spread as number;
    u.uStars.value     = params.stars as number;
    u.uOpacity.value   = opacityRef.current;
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

export const auroraDemo: DemoDef = {
  id: 'aurora',
  name: 'Aurora',
  tagline: 'Layered noise ribbons over a starfield — pointer adds a ribbon.',
  accent: '#10b981',
  fullscreen: true,
  Component: AuroraDemo,
  controls: [
    { type: 'range', key: 'intensity', label: 'Intensity', min: 0.2, max: 2.5, step: 0.01, default: 1.1 },
    { type: 'range', key: 'speed',     label: 'Speed',     min: 0,   max: 2.5, step: 0.01, default: 0.6 },
    { type: 'range', key: 'spread',    label: 'Spread',    min: 0.3, max: 2.0, step: 0.01, default: 1.0 },
    { type: 'range', key: 'hue',       label: 'Hue',       min: 0,   max: 1.0, step: 0.001, default: 0.40 },
    { type: 'range', key: 'stars',     label: 'Stars',     min: 0,   max: 0.04, step: 0.0005, default: 0.012 },
  ],
};
