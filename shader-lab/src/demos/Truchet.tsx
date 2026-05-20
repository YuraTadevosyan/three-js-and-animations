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
uniform float uThickness;
uniform float uSpeed;
uniform float uHue;
uniform float uFlow;
uniform float uOpacity;

${HSV2RGB}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  vec2 p = (uv - 0.5) * aspect * uScale;
  vec2 ptr = (uPointer - 0.5) * aspect * uScale;

  float t = uTime * uSpeed;

  // Tile coords
  vec2 gv = fract(p) - 0.5;
  vec2 id = floor(p);

  // Random rotation per tile, slowly cycling so the pattern evolves.
  float r = hash21(id);
  float flip = step(0.5, fract(r + t * 0.08));
  if (flip > 0.5) gv.x = -gv.x;

  // Two quarter-arcs connecting opposite corners — classic Truchet.
  float d  = abs(length(gv - 0.5) - 0.5);
  float d2 = abs(length(gv + 0.5) - 0.5);
  float arc = min(d, d2);

  // Animated bright pulse running along the arcs.
  float phase = (gv.x < 0.0 ? d : d2);
  float pulse = 0.5 + 0.5 * sin(phase * 18.0 - t * 4.0 + r * 6.28);

  float line = smoothstep(uThickness, uThickness * 0.5, arc);

  // Cell hue derived from tile hash so neighbours differ.
  float cellHue = fract(uHue + r * 0.3 + t * 0.01);
  vec3 base = hsv2rgb(vec3(cellHue, 0.55, 0.18));
  vec3 lit  = hsv2rgb(vec3(cellHue, 0.7,  1.0));

  vec3 color = mix(base, lit, line * mix(0.4, pulse, uFlow));

  // Pointer ripple — distance-based intensity bump on nearby tiles.
  float pull = exp(-length(p - ptr) * 0.5) * 0.6;
  color += lit * pull * line * 0.6;

  // Vignette
  float vig = smoothstep(1.20, 0.30, length(uv - 0.5));
  color *= vig * 0.92 + 0.08;

  gl_FragColor = vec4(color, uOpacity);
}
`;

function TruchetDemo({ params, opacityRef }: DemoComponentProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = usePointerUV();
  const { size, viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime:       { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer:    { value: new THREE.Vector2(0.5, 0.5) },
      uScale:      { value: params.scale as number },
      uThickness:  { value: params.thickness as number },
      uSpeed:      { value: params.speed as number },
      uHue:        { value: params.hue as number },
      uFlow:       { value: params.flow as number },
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
    u.uScale.value     = params.scale as number;
    u.uThickness.value = params.thickness as number;
    u.uSpeed.value     = params.speed as number;
    u.uHue.value       = params.hue as number;
    u.uFlow.value      = params.flow as number;
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

export const truchetDemo: DemoDef = {
  id: 'truchet',
  name: 'Truchet',
  tagline: 'Quarter-arc tile pattern with animated pulse trails.',
  accent: '#4ade80',
  fullscreen: true,
  Component: TruchetDemo,
  controls: [
    { type: 'range', key: 'scale',     label: 'Tile density', min: 3,    max: 24,   step: 0.1,  default: 9 },
    { type: 'range', key: 'thickness', label: 'Line width',   min: 0.05, max: 0.40, step: 0.005, default: 0.18 },
    { type: 'range', key: 'speed',     label: 'Pulse speed',  min: 0,    max: 3.0,  step: 0.01, default: 0.8 },
    { type: 'range', key: 'flow',      label: 'Pulse glow',   min: 0,    max: 1.0,  step: 0.01, default: 0.65 },
    { type: 'range', key: 'hue',       label: 'Hue',          min: 0,    max: 1.0,  step: 0.001, default: 0.35 },
  ],
};
