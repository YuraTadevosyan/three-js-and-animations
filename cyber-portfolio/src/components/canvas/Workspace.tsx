'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from '@/store/useScene';

const screenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fake "terminal" screen — scrolling rows of glowing code, scanlines, flicker.
const screenFragment = /* glsl */ `
  uniform float uTime;
  uniform float uPower;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    vec2 uv = vUv;
    vec3 base = vec3(0.0, 0.015, 0.03);
    float rows = 24.0;
    float row = floor(uv.y * rows);
    float t = uTime * 0.7;

    // Each row is an indented "line of code" of random width.
    float indent = hash(row * 5.3) * 0.12;
    float width = 0.18 + 0.62 * hash(row * 3.1 + floor(t * 0.5 + row * 0.07));
    float code = step(indent, uv.x) * step(uv.x, indent + width);
    float bright = 0.45 + 0.55 * hash(row * 9.1 + floor(t));
    vec3 codeCol = mix(vec3(0.0, 1.0, 0.9), vec3(0.1, 0.6, 1.0), hash(row));

    vec3 col = base + codeCol * code * bright;
    col *= 0.78 + 0.22 * sin(uv.y * rows * 6.2831);   // scanlines
    col *= 0.92 + 0.08 * sin(uTime * 36.0);            // CRT flicker
    float vig = smoothstep(1.15, 0.25, distance(uv, vec2(0.5)));
    col *= vig * uPower;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function NeonBar({
  position,
  args,
  color,
}: {
  position: [number, number, number];
  args: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.2}
        toneMapped={false}
      />
    </mesh>
  );
}

export function Workspace() {
  const group = useRef<THREE.Group>(null);
  const holo = useRef<THREE.Mesh>(null);
  const screenMat = useRef<THREE.ShaderMaterial>(null);
  const [hovered, setHovered] = useState(false);

  const screenUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPower: { value: 1 } }),
    [],
  );

  useFrame((state, delta) => {
    const { pointer, activeIndex, reducedMotion } = useScene.getState();
    const t = state.clock.elapsedTime;

    if (screenMat.current) {
      screenMat.current.uniforms.uTime.value = t;
      const targetPower = hovered ? 1.35 : 1;
      screenMat.current.uniforms.uPower.value +=
        (targetPower - screenMat.current.uniforms.uPower.value) * 0.1;
    }

    if (group.current) {
      // Bob + tilt toward the pointer; tilt fades out in deeper sections.
      const tilt = reducedMotion ? 0 : 1;
      const sectionCalm = 1 - Math.min(activeIndex, 3) * 0.18;
      group.current.position.y = -0.6 + Math.sin(t * 0.8) * 0.04;
      const targetRotY = pointer.x * 0.25 * tilt * sectionCalm;
      const targetRotX = pointer.y * 0.12 * tilt * sectionCalm;
      group.current.rotation.y += (targetRotY - group.current.rotation.y) * 0.05;
      group.current.rotation.x += (targetRotX - group.current.rotation.x) * 0.05;
    }

    if (holo.current) {
      holo.current.rotation.y += delta * 0.4;
      holo.current.position.y = 1.7 + Math.sin(t * 1.2) * 0.08;
    }
  });

  return (
    <group
      ref={group}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      dispose={null}
    >
      {/* Desk */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.12, 1.8]} />
        <meshStandardMaterial color="#0b1020" metalness={0.6} roughness={0.35} />
      </mesh>
      <NeonBar position={[0, -0.02, 0.92]} args={[4.2, 0.04, 0.04]} color="#00f0ff" />
      <NeonBar position={[0, -0.02, -0.92]} args={[4.2, 0.04, 0.04]} color="#ff2bd6" />

      {/* Desk legs */}
      {[
        [-1.95, -0.55, 0.8],
        [1.95, -0.55, 0.8],
        [-1.95, -0.55, -0.8],
        [1.95, -0.55, -0.8],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <boxGeometry args={[0.08, 1.0, 0.08]} />
          <meshStandardMaterial color="#0a0d18" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}

      {/* Monitor stand + body */}
      <mesh position={[0, 0.42, -0.35]}>
        <boxGeometry args={[0.16, 0.7, 0.1]} />
        <meshStandardMaterial color="#10131f" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.0, -0.35]}>
        <boxGeometry args={[2.7, 1.2, 0.1]} />
        <meshStandardMaterial color="#05070d" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Glowing terminal screen */}
      <mesh position={[0, 1.0, -0.29]}>
        <planeGeometry args={[2.5, 1.04]} />
        <shaderMaterial
          ref={screenMat}
          uniforms={screenUniforms}
          vertexShader={screenVertex}
          fragmentShader={screenFragment}
          toneMapped={false}
        />
      </mesh>

      {/* Keyboard */}
      <mesh position={[0, 0.08, 0.45]} rotation={[-0.06, 0, 0]}>
        <boxGeometry args={[1.5, 0.05, 0.5]} />
        <meshStandardMaterial
          color="#0a0d18"
          emissive="#1b6bff"
          emissiveIntensity={hovered ? 0.9 : 0.45}
          metalness={0.5}
          roughness={0.6}
        />
      </mesh>

      {/* Floating holographic panel */}
      <mesh ref={holo} position={[1.7, 1.7, -0.1]} rotation={[0, -0.4, 0]}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial
          color="#9d4dff"
          emissive="#9d4dff"
          emissiveIntensity={1.4}
          wireframe
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>

      {/* Floor pad glow under the desk */}
      <NeonBar position={[0, -0.58, 0]} args={[4.6, 0.02, 2.0]} color="#1b6bff" />
    </group>
  );
}
