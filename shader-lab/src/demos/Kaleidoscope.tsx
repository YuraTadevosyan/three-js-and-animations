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
uniform float uSegments;
uniform float uZoom;
uniform float uTwist;
uniform float uSpeed;
uniform float uHue;
uniform float uOpacity;

${VALUE_NOISE}

vec3 pal(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318530718 * (c * t + d));
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  vec2 p = (uv - 0.5) * aspect;
  float t = uTime * uSpeed;

  // Polar coords + pointer-driven rotation
  float a = atan(p.y, p.x);
  float r = length(p);

  // Wedge angle = TAU / N. Reflect each wedge to get mirror symmetry.
  float segs = max(2.0, uSegments);
  float wedge = 6.28318530718 / segs;
  a = mod(a, wedge);
  a = abs(a - 0.5 * wedge);

  // Pointer offsets the center of the kaleidoscope.
  vec2 ptr = (uPointer - 0.5) * aspect;
  float pAngle = atan(ptr.y, ptr.x);
  a += pAngle * 0.2;

  // Twist with radius — gives the spiral feel.
  a += r * uTwist + t * 0.4;

  vec2 q = vec2(cos(a), sin(a)) * r * uZoom;

  // Pattern: layered fbm sampled in the symmetric coord.
  float n = fbm(q * 2.0 + t * 0.3);
  n = mix(n, fbm(q * 5.0 - t * 0.2), 0.5);
  float ring = sin(r * 10.0 - t * 1.4) * 0.5 + 0.5;
  float v = n * 0.7 + ring * 0.3;

  vec3 color = pal(v + t * 0.05 + uHue,
    vec3(0.5, 0.5, 0.55), vec3(0.5, 0.5, 0.45),
    vec3(1.0, 1.0, 1.0), vec3(0.0, 0.33, 0.67));

  // Radial fade & vignette
  color *= smoothstep(1.20, 0.05, r);

  gl_FragColor = vec4(color, uOpacity);
}
`;

function KaleidoscopeDemo({ params, opacityRef }: DemoComponentProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = usePointerUV();
  const { size, viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime:       { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer:    { value: new THREE.Vector2(0.5, 0.5) },
      uSegments:   { value: params.segments as number },
      uZoom:       { value: params.zoom as number },
      uTwist:      { value: params.twist as number },
      uSpeed:      { value: params.speed as number },
      uHue:        { value: params.hue as number },
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
    u.uSegments.value = params.segments as number;
    u.uZoom.value     = params.zoom as number;
    u.uTwist.value    = params.twist as number;
    u.uSpeed.value    = params.speed as number;
    u.uHue.value      = params.hue as number;
    u.uOpacity.value  = opacityRef.current;
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

export const kaleidoscopeDemo: DemoDef = {
  id: 'kaleidoscope',
  name: 'Kaleidoscope',
  tagline: 'N-fold wedge mirror over fbm rings — pointer rotates the center.',
  accent: '#60a5fa',
  fullscreen: true,
  Component: KaleidoscopeDemo,
  controls: [
    { type: 'range', key: 'segments', label: 'Segments', min: 3,   max: 16,  step: 1,    default: 8 },
    { type: 'range', key: 'zoom',     label: 'Zoom',     min: 0.5, max: 6.0, step: 0.01, default: 2.2 },
    { type: 'range', key: 'twist',    label: 'Twist',    min: -3,  max: 3,   step: 0.01, default: 0.8 },
    { type: 'range', key: 'speed',    label: 'Speed',    min: 0,   max: 2.0, step: 0.01, default: 0.6 },
    { type: 'range', key: 'hue',      label: 'Hue shift', min: 0,  max: 1.0, step: 0.001, default: 0.0 },
  ],
};
