import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { DemoComponentProps, DemoDef } from '@/lib/types';
import { FULLSCREEN_VERT, VALUE_NOISE } from '@/shaders/common';
import { usePointerUV } from '@/hooks/usePointer';

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uPointer;
uniform float uScale;
uniform float uDistortion;
uniform float uSpeed;
uniform float uPalette;
uniform float uContrast;
uniform float uOpacity;

${VALUE_NOISE}

vec3 pal(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318530718 * (c * t + d));
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  vec2 p = (uv - 0.5) * aspect;

  vec2 ptr = (uPointer - 0.5) * aspect;
  float pull = exp(-length(p - ptr) * 2.2) * 0.7;

  float t = uTime * uSpeed;
  vec2 q = p * uScale;

  vec2 d1 = vec2(fbm(q + t * 0.10),
                 fbm(q + vec2(5.2, 1.3) + t * 0.10));
  vec2 d2 = vec2(fbm(q + 4.0 * d1 + t * 0.13 + pull * 3.0),
                 fbm(q + 4.0 * d1 + vec2(1.7, 9.2) - t * 0.11 + pull * 3.0));
  float v = fbm(q + 4.0 * d2 * uDistortion);
  v = pow(v, mix(1.0, 1.8, uContrast));

  // Two palettes, blended by uPalette
  vec3 c1 = pal(v + t * 0.05,
    vec3(0.5), vec3(0.5),
    vec3(1.0, 1.0, 1.0), vec3(0.00, 0.33, 0.67));
  vec3 c2 = pal(v + t * 0.05,
    vec3(0.55, 0.45, 0.55), vec3(0.55, 0.45, 0.55),
    vec3(2.0, 1.0, 0.0), vec3(0.50, 0.20, 0.25));
  vec3 color = mix(c1, c2, uPalette);

  // soft vignette
  float vig = smoothstep(1.15, 0.30, length(uv - 0.5));
  color *= vig * 0.92 + 0.08;

  gl_FragColor = vec4(color, uOpacity);
}
`;

function NoiseDistortionDemo({ params, opacityRef }: DemoComponentProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = usePointerUV();
  const { size, viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime:       { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer:    { value: new THREE.Vector2(0.5, 0.5) },
      uScale:      { value: params.scale as number },
      uDistortion: { value: params.distortion as number },
      uSpeed:      { value: params.speed as number },
      uPalette:    { value: (params.warm as boolean) ? 1 : 0 },
      uContrast:   { value: params.contrast as number },
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
    u.uScale.value      = params.scale as number;
    u.uDistortion.value = params.distortion as number;
    u.uSpeed.value      = params.speed as number;
    u.uContrast.value   = params.contrast as number;

    // Smoothly tween the palette toggle to avoid a hard pop.
    const target = (params.warm as boolean) ? 1 : 0;
    u.uPalette.value += (target - u.uPalette.value) * Math.min(1, dt * 6);
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

export const noiseDemo: DemoDef = {
  id: 'noise',
  name: 'Noise Distortion',
  tagline: 'Domain-warped fbm field — pointer pulls the flow.',
  accent: '#a78bfa',
  fullscreen: true,
  Component: NoiseDistortionDemo,
  controls: [
    { type: 'range',  key: 'scale',      label: 'Scale',      min: 0.5, max: 6.0, step: 0.01, default: 2.2 },
    { type: 'range',  key: 'distortion', label: 'Distortion', min: 0,   max: 2.0, step: 0.01, default: 1.0 },
    { type: 'range',  key: 'speed',      label: 'Speed',      min: 0,   max: 2.0, step: 0.01, default: 0.6 },
    { type: 'range',  key: 'contrast',   label: 'Contrast',   min: 0,   max: 1.0, step: 0.01, default: 0.4 },
    { type: 'toggle', key: 'warm',       label: 'Warm palette', default: false },
  ],
};
