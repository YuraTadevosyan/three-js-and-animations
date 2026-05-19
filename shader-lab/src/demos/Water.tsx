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
uniform float uAmplitude;
uniform float uSpeed;
uniform float uRefraction;
uniform float uHue;
uniform float uRipple;
uniform float uOpacity;

${HSV2RGB}
${VALUE_NOISE}

float waveHeight(vec2 p, float t) {
  float h = 0.0;
  h += sin(p.x * 1.7 + t * 0.9 + fbm(p + t * 0.1) * 2.0) * 0.5;
  h += sin(p.y * 2.2 - t * 0.6 + fbm(p * 1.3 - t * 0.07) * 2.5) * 0.4;
  h += (fbm(p * 1.5 + vec2(t * 0.2, -t * 0.3)) - 0.5) * 1.4;
  return h;
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  vec2 p = (uv - 0.5) * aspect * 3.0;
  float t = uTime * uSpeed;

  float h = waveHeight(p, t) * uAmplitude;

  // Pointer-driven ripple
  vec2 ptr = (uPointer - 0.5) * aspect * 3.0;
  float d = length(p - ptr);
  h += sin(d * 18.0 - t * 6.0) * exp(-d * 2.2) * uRipple * 0.8;

  // Derivatives → normal
  vec2 grad = vec2(dFdx(h), dFdy(h)) * uRefraction * 40.0;
  vec3 N = normalize(vec3(-grad, 1.0));

  // Sky / depth gradient sampled with refraction offset
  vec2 refUv = uv + grad * 0.03;
  vec3 top    = hsv2rgb(vec3(uHue, 0.55, 0.95));
  vec3 bottom = hsv2rgb(vec3(fract(uHue + 0.55), 0.85, 0.10));
  vec3 sky = mix(bottom, top, smoothstep(-0.1, 1.1, refUv.y));

  // Specular highlight
  vec3 L = normalize(vec3(0.35, 0.85, 0.45));
  float spec = pow(max(dot(N, L), 0.0), 70.0);
  vec3 color = sky + spec * vec3(1.0, 0.96, 0.88) * 0.9;

  // Caustic shimmer
  float caustic = pow(0.5 + 0.5 * sin(h * 7.5 + t * 1.6), 6.0);
  color += caustic * mix(top, vec3(1.0), 0.35) * 0.28;

  // Subtle vignette
  float vig = smoothstep(1.2, 0.35, length(uv - 0.5));
  color *= vig;

  gl_FragColor = vec4(color, uOpacity);
}
`;

function WaterDemo({ params, opacityRef }: DemoComponentProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = usePointerUV();
  const { size, viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime:       { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer:    { value: new THREE.Vector2(0.5, 0.5) },
      uAmplitude:  { value: params.amplitude as number },
      uSpeed:      { value: params.speed as number },
      uRefraction: { value: params.refraction as number },
      uHue:        { value: params.hue as number },
      uRipple:     { value: params.ripple as number },
      uOpacity:    { value: 1 },
    }),
    // initial values only; runtime updates happen in useFrame
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((_, dt) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    u.uTime.value += dt;
    u.uResolution.value.set(size.width * viewport.dpr, size.height * viewport.dpr);
    u.uPointer.value.copy(pointer.current);
    u.uAmplitude.value  = params.amplitude as number;
    u.uSpeed.value      = params.speed as number;
    u.uRefraction.value = params.refraction as number;
    u.uHue.value        = params.hue as number;
    u.uRipple.value     = params.ripple as number;
    u.uOpacity.value    = opacityRef.current;
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
        extensions={{ derivatives: true } as never}
      />
    </mesh>
  );
}

export const waterDemo: DemoDef = {
  id: 'water',
  name: 'Water',
  tagline: 'Layered waves with screen-space normals & pointer ripples.',
  accent: '#22d3ee',
  fullscreen: true,
  Component: WaterDemo,
  controls: [
    { type: 'range', key: 'amplitude',  label: 'Amplitude',  min: 0,   max: 1.5, step: 0.01, default: 0.6 },
    { type: 'range', key: 'speed',      label: 'Speed',      min: 0,   max: 3.0, step: 0.01, default: 1.0 },
    { type: 'range', key: 'refraction', label: 'Refraction', min: 0,   max: 2.0, step: 0.01, default: 0.9 },
    { type: 'range', key: 'hue',        label: 'Hue',        min: 0,   max: 1.0, step: 0.001, default: 0.55 },
    { type: 'range', key: 'ripple',     label: 'Ripple',     min: 0,   max: 2.0, step: 0.01, default: 0.8 },
  ],
};
