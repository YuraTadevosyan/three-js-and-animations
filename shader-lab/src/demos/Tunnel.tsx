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
uniform float uSpeed;
uniform float uArms;
uniform float uHue;
uniform float uTwist;
uniform float uBrightness;
uniform float uOpacity;

${HSV2RGB}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  vec2 p = (uv - 0.5) * aspect * 2.0;

  // Pointer offsets the tunnel center so you can "lean" into it.
  vec2 ptr = (uPointer - 0.5) * aspect * 0.6;
  p -= ptr;

  float r = length(p) + 1e-4;
  float a = atan(p.y, p.x);
  float t = uTime * uSpeed;

  // Inverse-radius depth — equivalent to scrolling down an infinite tube.
  float z = 1.0 / r + t;

  // Radial spokes + scrolling rings, with a twist that increases with depth.
  float spokes = 0.5 + 0.5 * sin(a * uArms + z * 0.5 + r * uTwist * 4.0);
  float rings  = 0.5 + 0.5 * sin(z * 3.0);
  float pattern = mix(spokes, rings, 0.5);

  // Palette that scrolls with depth.
  vec3 col = hsv2rgb(vec3(fract(uHue + z * 0.04 + a * 0.06), 0.75, 1.0));
  col *= pattern * uBrightness;

  // Distance fog — fade the far wall (small r → deep) but keep some color.
  float depthFade = smoothstep(0.0, 0.55, r);
  col *= depthFade;

  // Bright glow plug at the tunnel mouth.
  col += hsv2rgb(vec3(fract(uHue + 0.1), 0.4, 1.0)) * smoothstep(0.42, 0.0, r) * 0.65;

  // Subtle vignette
  float vig = smoothstep(1.25, 0.30, length(uv - 0.5));
  col *= vig * 0.92 + 0.08;

  gl_FragColor = vec4(col, uOpacity);
}
`;

function TunnelDemo({ params, opacityRef }: DemoComponentProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = usePointerUV();
  const { size, viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime:       { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer:    { value: new THREE.Vector2(0.5, 0.5) },
      uSpeed:      { value: params.speed as number },
      uArms:       { value: params.arms as number },
      uHue:        { value: params.hue as number },
      uTwist:      { value: params.twist as number },
      uBrightness: { value: params.brightness as number },
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
    u.uSpeed.value      = params.speed as number;
    u.uArms.value       = params.arms as number;
    u.uHue.value        = params.hue as number;
    u.uTwist.value      = params.twist as number;
    u.uBrightness.value = params.brightness as number;
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
      />
    </mesh>
  );
}

export const tunnelDemo: DemoDef = {
  id: 'tunnel',
  name: 'Tunnel',
  tagline: 'Inverse-radius pseudo-3D tunnel — pointer leans the camera.',
  accent: '#22d3ee',
  fullscreen: true,
  Component: TunnelDemo,
  controls: [
    { type: 'range', key: 'speed',      label: 'Scroll speed', min: 0,  max: 3.0, step: 0.01, default: 0.9 },
    { type: 'range', key: 'arms',       label: 'Arms',         min: 2,  max: 24,  step: 1,    default: 8 },
    { type: 'range', key: 'twist',      label: 'Twist',        min: -2, max: 2,   step: 0.01, default: 0.7 },
    { type: 'range', key: 'hue',        label: 'Hue',          min: 0,  max: 1.0, step: 0.001, default: 0.62 },
    { type: 'range', key: 'brightness', label: 'Brightness',   min: 0.3, max: 2.0, step: 0.01, default: 1.0 },
  ],
};
