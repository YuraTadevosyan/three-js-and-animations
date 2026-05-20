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
uniform float uTwist;
uniform float uMorph;
uniform float uHue;
uniform float uRoughness;
uniform float uSpeed;
uniform float uOpacity;

${HSV2RGB}

// ---- Signed distance primitives ----------------------------------------
float sdSphere(vec3 p, float r) { return length(p) - r; }
float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// ---- The scene ---------------------------------------------------------
float scene(vec3 p) {
  // Twist around the Y axis — twist strength modulated by time.
  float k = uTwist * 0.6;
  float c = cos(k * p.y);
  float s = sin(k * p.y);
  p.xz = mat2(c, -s, s, c) * p.xz;

  // Crossfade sphere ↔ rounded box.
  float morph = 0.5 + 0.5 * sin(uTime * uSpeed * 0.6);
  morph = mix(morph, uMorph, 0.5);

  float sph = sdSphere(p, 0.95);
  float box = sdBox(p, vec3(0.7)) - 0.10; // rounded

  // Smooth-blend the two primitives.
  float blended = smin(sph, box, 0.35);

  // Surface roughness — high-frequency sin ripple.
  float bumps = sin(p.x * 9.0 + uTime) * sin(p.y * 9.0) * sin(p.z * 9.0) * uRoughness * 0.05;

  return blended + bumps + (morph - 0.5) * 0.1;
}

vec3 calcNormal(vec3 p) {
  const float e = 0.0015;
  vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * scene(p + k.xyy * e) +
    k.yyx * scene(p + k.yyx * e) +
    k.yxy * scene(p + k.yxy * e) +
    k.xxx * scene(p + k.xxx * e)
  );
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  vec2 p = (uv - 0.5) * aspect * 2.0;

  // Pointer orbits the camera around the origin.
  float yaw   = (uPointer.x - 0.5) * 3.0;
  float pitch = (uPointer.y - 0.5) * 1.5;

  // Build ray in view space, then rotate by yaw/pitch.
  vec3 rd = normalize(vec3(p, 1.6));
  // pitch (X axis)
  float cp = cos(pitch), sp = sin(pitch);
  rd.yz = mat2(cp, -sp, sp, cp) * rd.yz;
  // yaw (Y axis)
  float cy = cos(yaw), sy = sin(yaw);
  rd.xz = mat2(cy, -sy, sy, cy) * rd.xz;

  vec3 ro = vec3(0.0, 0.0, -3.2);
  // Move camera origin around the same orbit.
  ro.yz = mat2(cp, -sp, sp, cp) * ro.yz;
  ro.xz = mat2(cy, -sy, sy, cy) * ro.xz;

  // March
  float t = 0.0;
  bool hit = false;
  for (int i = 0; i < 80; i++) {
    vec3 pos = ro + rd * t;
    float d = scene(pos);
    if (d < 0.0015) { hit = true; break; }
    if (t > 12.0) break;
    // Slight under-step to keep things stable around twist discontinuities.
    t += d * 0.92;
  }

  vec3 col;
  if (hit) {
    vec3 pos = ro + rd * t;
    vec3 n   = calcNormal(pos);
    vec3 L   = normalize(vec3(0.45, 0.7, -0.6));

    float diff = max(dot(n, L), 0.0);
    float fres = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
    float spec = pow(max(dot(reflect(-L, n), -rd), 0.0), 32.0);

    vec3 base = hsv2rgb(vec3(uHue, 0.65, 1.0));
    vec3 rim  = hsv2rgb(vec3(fract(uHue + 0.15), 0.4, 1.0));

    col = base * (0.18 + diff * 0.85);
    col += rim * fres * 0.85;
    col += vec3(1.0, 0.95, 0.85) * spec * 0.8;

    // Cheap AO using local distance.
    float ao = clamp(scene(pos + n * 0.15) / 0.15, 0.0, 1.0);
    col *= mix(0.55, 1.0, ao);
  } else {
    // Background gradient driven by ray direction.
    float bg = 0.5 + 0.5 * rd.y;
    col = mix(vec3(0.015, 0.02, 0.04), vec3(0.05, 0.06, 0.12), bg);
    // Soft halo where the silhouette would have been.
    col += hsv2rgb(vec3(uHue, 0.5, 1.0)) * smoothstep(0.85, 0.0, length(p)) * 0.12;
  }

  // Vignette
  float vig = smoothstep(1.25, 0.30, length(uv - 0.5));
  col *= vig * 0.92 + 0.08;

  gl_FragColor = vec4(col, uOpacity);
}
`;

function RaymarchDemo({ params, opacityRef }: DemoComponentProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = usePointerUV(0.10); // slower smoothing — orbit feels snappier
  const { size, viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime:       { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer:    { value: new THREE.Vector2(0.5, 0.5) },
      uTwist:      { value: params.twist as number },
      uMorph:      { value: params.morph as number },
      uHue:        { value: params.hue as number },
      uRoughness:  { value: params.roughness as number },
      uSpeed:      { value: params.speed as number },
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
    u.uTwist.value     = params.twist as number;
    u.uMorph.value     = params.morph as number;
    u.uHue.value       = params.hue as number;
    u.uRoughness.value = params.roughness as number;
    u.uSpeed.value     = params.speed as number;
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

export const raymarchDemo: DemoDef = {
  id: 'raymarch',
  name: 'Raymarch',
  tagline: 'SDF sphere↔box morph with twist — pointer orbits the camera.',
  accent: '#fb7185',
  fullscreen: true,
  Component: RaymarchDemo,
  controls: [
    { type: 'range', key: 'twist',     label: 'Twist',     min: 0,   max: 3.0, step: 0.01, default: 1.2 },
    { type: 'range', key: 'morph',     label: 'Sphere ↔ Box', min: 0, max: 1, step: 0.01, default: 0.5 },
    { type: 'range', key: 'roughness', label: 'Roughness', min: 0,   max: 1.5, step: 0.01, default: 0.4 },
    { type: 'range', key: 'speed',     label: 'Morph speed', min: 0, max: 2.0, step: 0.01, default: 0.7 },
    { type: 'range', key: 'hue',       label: 'Hue',       min: 0,   max: 1.0, step: 0.001, default: 0.78 },
  ],
};
