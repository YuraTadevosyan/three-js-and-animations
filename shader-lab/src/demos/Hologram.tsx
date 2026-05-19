import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { DemoComponentProps, DemoDef } from '@/lib/types';
import { HSV2RGB } from '@/shaders/common';

const VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;
varying vec3 vLocalPos;
uniform float uTime;
uniform float uGlitch;

float hash11(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  vUv = uv;
  vec3 displaced = position;

  // Per-band jitter: split mesh into horizontal slabs that pop on glitches.
  float band = floor(position.y * 8.0);
  float gate = step(0.6, fract(uTime * 0.5 + hash11(band) * 4.0));
  float jitter = (hash11(band + floor(uTime * 18.0)) - 0.5) * uGlitch * 0.18 * gate;
  displaced.x += jitter;

  vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
  vec4 viewPos  = viewMatrix  * worldPos;

  vNormal   = normalize(normalMatrix * normal);
  vViewDir  = normalize(-viewPos.xyz);
  vLocalPos = displaced;

  gl_Position = projectionMatrix * viewPos;
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;
varying vec3 vLocalPos;

uniform float uTime;
uniform float uFresnel;
uniform float uScan;
uniform float uGrid;
uniform float uHue;
uniform float uGlitch;
uniform float uOpacity;

${HSV2RGB}

void main() {
  float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), uFresnel);

  vec3 base = hsv2rgb(vec3(uHue, 0.85, 1.0));
  vec3 rim  = hsv2rgb(vec3(fract(uHue + 0.18), 0.55, 1.0));

  // Scanlines anchored in local space so they ride the mesh, not the camera.
  float sc = 0.5 + 0.5 * sin(vLocalPos.y * uScan - uTime * 3.5);
  sc = smoothstep(0.45, 0.92, sc);

  // UV grid lines
  vec2 g = abs(fract(vUv * 28.0) - 0.5);
  float gridLine = smoothstep(0.48, 0.50, max(g.x, g.y)) * uGrid;

  // CRT flicker + glitch flash
  float flick = 0.88 + 0.12 * sin(uTime * 55.0 + vLocalPos.y * 120.0);
  float flash = (fract(sin(floor(uTime * 9.0) * 17.13) * 4321.0) - 0.5) * uGlitch * 0.35;

  vec3 color = mix(base, rim, fres);
  color += sc * rim * 0.55;
  color += gridLine * rim * 0.6;
  color *= flick;
  color += flash * rim;

  float alpha = clamp(0.18 + fres * 0.95 + sc * 0.35 + gridLine * 0.45, 0.0, 1.0) * uOpacity;
  gl_FragColor = vec4(color, alpha);
}
`;

function HologramDemo({ params, opacityRef }: DemoComponentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const haloRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime:    { value: 0 },
      uFresnel: { value: params.fresnel as number },
      uScan:    { value: params.scan as number },
      uGrid:    { value: params.grid as number },
      uHue:     { value: params.hue as number },
      uGlitch:  { value: params.glitch as number },
      uOpacity: { value: 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const haloUniforms = useMemo(
    () => ({
      uTime:    { value: 0 },
      uHue:     { value: params.hue as number },
      uOpacity: { value: 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((state, dt) => {
    const speed = (params.rotation as number) ?? 1;
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.6 * speed;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 * speed) * 0.25;
    }

    if (materialRef.current) {
      const u = materialRef.current.uniforms;
      u.uTime.value += dt;
      u.uFresnel.value = params.fresnel as number;
      u.uScan.value    = params.scan as number;
      u.uGrid.value    = params.grid as number;
      u.uHue.value     = params.hue as number;
      u.uGlitch.value  = params.glitch as number;
      u.uOpacity.value = opacityRef.current;
    }
    if (haloRef.current) {
      const u = haloRef.current.uniforms;
      u.uTime.value += dt;
      u.uHue.value     = params.hue as number;
      u.uOpacity.value = opacityRef.current;
    }
  });

  return (
    <group>
      {/* Soft additive halo behind the object */}
      <mesh position={[0, 0, -0.5]} renderOrder={0}>
        <planeGeometry args={[6, 6]} />
        <shaderMaterial
          ref={haloRef}
          uniforms={haloUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={/* glsl */ `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={/* glsl */ `
            precision highp float;
            varying vec2 vUv;
            uniform float uTime;
            uniform float uHue;
            uniform float uOpacity;
            ${HSV2RGB}
            void main() {
              float d = length(vUv - 0.5);
              float halo = smoothstep(0.5, 0.0, d);
              halo *= 0.6 + 0.4 * sin(uTime * 1.2);
              vec3 col = hsv2rgb(vec3(uHue, 0.65, 1.0));
              gl_FragColor = vec4(col * halo * 0.55, halo * 0.6 * uOpacity);
            }
          `}
        />
      </mesh>

      <group ref={groupRef}>
        <mesh renderOrder={1}>
          <icosahedronGeometry args={[1.15, 1]} />
          <shaderMaterial
            ref={materialRef}
            uniforms={uniforms}
            vertexShader={VERT}
            fragmentShader={FRAG}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Wireframe inner shell adds the holographic mesh feel */}
        <mesh renderOrder={2} scale={1.02}>
          <icosahedronGeometry args={[1.15, 1]} />
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={VERT}
            fragmentShader={FRAG}
            transparent
            depthWrite={false}
            wireframe
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
}

export const hologramDemo: DemoDef = {
  id: 'hologram',
  name: 'Glow Hologram',
  tagline: 'Fresnel + scanlines + jitter glitches on an icosahedron.',
  accent: '#34d399',
  Component: HologramDemo,
  controls: [
    { type: 'range', key: 'fresnel',  label: 'Fresnel',  min: 0.5, max: 6.0, step: 0.01, default: 2.4 },
    { type: 'range', key: 'scan',     label: 'Scan freq', min: 4,  max: 80,  step: 0.5,  default: 28  },
    { type: 'range', key: 'grid',     label: 'Grid',     min: 0,   max: 1.5, step: 0.01, default: 0.6 },
    { type: 'range', key: 'hue',      label: 'Hue',      min: 0,   max: 1.0, step: 0.001, default: 0.48 },
    { type: 'range', key: 'glitch',   label: 'Glitch',   min: 0,   max: 1.5, step: 0.01, default: 0.4 },
    { type: 'range', key: 'rotation', label: 'Rotation', min: 0,   max: 3.0, step: 0.01, default: 1.0 },
  ],
};
