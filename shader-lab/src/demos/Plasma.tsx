import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { DemoComponentProps, DemoDef } from '@/lib/types';
import { FULLSCREEN_VERT } from '@/shaders/common';
import { usePointerUV } from '@/hooks/usePointer';

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uPointer;
uniform float uScale;
uniform float uSpeed;
uniform float uHue;
uniform float uMix;
uniform float uOpacity;

// Cosine palette (Inigo Quilez)
vec3 pal(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318530718 * (c * t + d));
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  vec2 p = (uv - 0.5) * aspect * uScale;

  vec2 ptr = (uPointer - 0.5) * aspect * uScale;
  vec2 toP = p - ptr;
  float pullDist = length(toP);

  float t = uTime * uSpeed;

  // Classic plasma: sum of sines from multiple centers, all rotating in time.
  float v = 0.0;
  v += sin(p.x * 1.4 + t);
  v += sin(p.y * 1.6 + t * 1.1 + 1.7);
  v += sin((p.x + p.y) * 1.1 + t * 0.8 + 3.1);
  v += sin(length(p) * 2.1 - t * 1.3);
  v += sin(length(p - vec2(2.0 * sin(t * 0.7), 2.0 * cos(t * 0.6))) * 1.8 + t);
  // Pointer-driven swirl center
  v += sin(pullDist * 3.0 - t * 2.0) * exp(-pullDist * 0.5) * 1.4;
  v *= 0.2;

  // Two palettes blended by uMix — both shifted by uHue.
  vec3 c1 = pal(v + uHue,
    vec3(0.5), vec3(0.5),
    vec3(1.0, 1.0, 1.0), vec3(0.0, 0.33, 0.67));
  vec3 c2 = pal(v + uHue,
    vec3(0.55, 0.40, 0.70), vec3(0.45, 0.40, 0.50),
    vec3(1.0, 1.0, 1.0), vec3(0.30, 0.20, 0.10));
  vec3 color = mix(c1, c2, uMix);

  // Subtle radial fade so the corners stay calm.
  float vig = smoothstep(1.25, 0.30, length(uv - 0.5));
  color *= vig * 0.92 + 0.08;

  gl_FragColor = vec4(color, uOpacity);
}
`;

function PlasmaDemo({ params, opacityRef }: DemoComponentProps) {
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
      uHue:        { value: params.hue as number },
      uMix:        { value: params.mix as number },
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
    u.uHue.value     = params.hue as number;
    u.uMix.value     = params.mix as number;
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

export const plasmaDemo: DemoDef = {
  id: 'plasma',
  name: 'Plasma',
  tagline: 'Summed sines through a cosine palette — pointer adds a swirl center.',
  accent: '#f472b6',
  fullscreen: true,
  Component: PlasmaDemo,
  controls: [
    { type: 'range', key: 'scale', label: 'Scale', min: 1.0, max: 8.0, step: 0.01, default: 3.5 },
    { type: 'range', key: 'speed', label: 'Speed', min: 0,   max: 3.0, step: 0.01, default: 0.7 },
    { type: 'range', key: 'hue',   label: 'Hue shift', min: 0, max: 1.0, step: 0.001, default: 0.2 },
    { type: 'range', key: 'mix',   label: 'Palette mix', min: 0, max: 1.0, step: 0.01, default: 0.35 },
  ],
};
