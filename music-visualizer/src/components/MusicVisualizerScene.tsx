import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  Color,
  type Group,
  type PerspectiveCamera,
  type Points,
  type PointsMaterial,
  type ShaderMaterial,
} from 'three';

import vertexShader from '@/shaders/visualizer.vert.glsl?raw';
import fragmentShader from '@/shaders/visualizer.frag.glsl?raw';
import type { AudioAnalysis } from '@/hooks/useAudioAnalyser';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const PARTICLE_COUNT = 2400;

type Theme = 'light' | 'dark';

export type ModelKind =
  | 'icosahedron'
  | 'tetrahedron'
  | 'torus'
  | 'cone'
  | 'capsule'
  | 'torusKnot';

function CoreGeometry({
  kind,
  detail,
}: {
  kind: ModelKind;
  detail: 'high' | 'low';
}) {
  const high = detail === 'high';
  switch (kind) {
    case 'icosahedron':
      return <icosahedronGeometry args={[1.1, high ? 64 : 4]} />;
    case 'tetrahedron':
      return <tetrahedronGeometry args={[1.2, high ? 8 : 1]} />;
    case 'torus':
      return (
        <torusGeometry
          args={[0.78, 0.32, high ? 32 : 8, high ? 96 : 24]}
        />
      );
    case 'cone':
      return (
        <coneGeometry args={[0.95, 1.9, high ? 96 : 16, high ? 32 : 4]} />
      );
    case 'capsule':
      return (
        <capsuleGeometry args={[0.6, 1.0, high ? 16 : 4, high ? 48 : 12]} />
      );
    case 'torusKnot':
      return (
        <torusKnotGeometry
          args={[0.85, 0.28, high ? 256 : 64, high ? 24 : 8]}
        />
      );
  }
}

interface ThemeBase {
  bg: string;
  fog: [number, number];
  ambient: number;
  bloomIntensity: number;
  bloomThreshold: number;
  vignetteDarkness: number;
  particleOpacityBase: number;
  particleOpacityRange: number;
  wireOpacity: number;
}

const THEMES: Record<Theme, ThemeBase> = {
  dark: {
    bg: '#05030d',
    fog: [5, 12],
    ambient: 0.15,
    bloomIntensity: 1.1,
    bloomThreshold: 0.18,
    vignetteDarkness: 0.85,
    particleOpacityBase: 0.45,
    particleOpacityRange: 0.55,
    wireOpacity: 0.08,
  },
  light: {
    bg: '#ffffff',
    fog: [6, 13],
    ambient: 0.45,
    bloomIntensity: 0.45,
    bloomThreshold: 0.5,
    vignetteDarkness: 0.2,
    particleOpacityBase: 0.3,
    particleOpacityRange: 0.55,
    wireOpacity: 0.18,
  },
};

interface ModelColors {
  colorLow: string;
  colorMid: string;
  colorHigh: string;
  particle: string;
  wire: string;
}

// Each model gets its own color identity so the geometry change is felt visually,
// not just by topology. Two variants per model so the tones still read on a light bg.
const MODEL_COLORS: Record<ModelKind, Record<Theme, ModelColors>> = {
  icosahedron: {
    dark: {
      colorLow: '#1e1b4b',
      colorMid: '#a78bfa',
      colorHigh: '#22d3ee',
      particle: '#c4b5fd',
      wire: '#22d3ee',
    },
    light: {
      colorLow: '#c7d2fe',
      colorMid: '#7c3aed',
      colorHigh: '#0891b2',
      particle: '#6366f1',
      wire: '#7c3aed',
    },
  },
  // Frost — sharp icy cyan/sky for the angular tetrahedron.
  tetrahedron: {
    dark: {
      colorLow: '#0f172a',
      colorMid: '#38bdf8',
      colorHigh: '#cffafe',
      particle: '#67e8f9',
      wire: '#cffafe',
    },
    light: {
      colorLow: '#cffafe',
      colorMid: '#0284c7',
      colorHigh: '#0e7490',
      particle: '#0284c7',
      wire: '#0e7490',
    },
  },
  // Neon — pink/cyan ring vibe for the torus.
  torus: {
    dark: {
      colorLow: '#4c0519',
      colorMid: '#ec4899',
      colorHigh: '#06b6d4',
      particle: '#f9a8d4',
      wire: '#06b6d4',
    },
    light: {
      colorLow: '#fce7f3',
      colorMid: '#be185d',
      colorHigh: '#0891b2',
      particle: '#be185d',
      wire: '#0891b2',
    },
  },
  // Magma — fiery red/orange for the directional cone.
  cone: {
    dark: {
      colorLow: '#450a0a',
      colorMid: '#f87171',
      colorHigh: '#fb923c',
      particle: '#fca5a5',
      wire: '#fb923c',
    },
    light: {
      colorLow: '#fecaca',
      colorMid: '#dc2626',
      colorHigh: '#ea580c',
      particle: '#dc2626',
      wire: '#b91c1c',
    },
  },
  // Mint — fresh teal/lime for the soft capsule.
  capsule: {
    dark: {
      colorLow: '#042f2e',
      colorMid: '#2dd4bf',
      colorHigh: '#a3e635',
      particle: '#5eead4',
      wire: '#a3e635',
    },
    light: {
      colorLow: '#ccfbf1',
      colorMid: '#0d9488',
      colorHigh: '#65a30d',
      particle: '#0d9488',
      wire: '#15803d',
    },
  },
  // Aurora — deep blue → sky for the twisted knot.
  torusKnot: {
    dark: {
      colorLow: '#1e3a8a',
      colorMid: '#38bdf8',
      colorHigh: '#67e8f9',
      particle: '#93c5fd',
      wire: '#67e8f9',
    },
    light: {
      colorLow: '#bfdbfe',
      colorMid: '#2563eb',
      colorHigh: '#0e7490',
      particle: '#2563eb',
      wire: '#0e7490',
    },
  },
};

// How much each model's surface should respond to the audio. Smaller values
// preserve the original silhouette where displacement would otherwise overwhelm it.
const MODEL_DISPLACEMENT: Record<ModelKind, number> = {
  icosahedron: 1.0,
  tetrahedron: 0.8,
  torus: 0.5,
  cone: 0.65,
  capsule: 0.7,
  torusKnot: 0.45,
};

interface Palette extends ThemeBase, ModelColors {
  displacementScale: number;
}

function buildPalette(
  theme: Theme,
  model: ModelKind,
  customColors?: CustomColors | null,
): Palette {
  const base = MODEL_COLORS[model][theme];
  return {
    ...THEMES[theme],
    ...base,
    ...(customColors
      ? {
          colorLow: customColors.colorLow,
          colorMid: customColors.colorMid,
          colorHigh: customColors.colorHigh,
        }
      : null),
    displacementScale: MODEL_DISPLACEMENT[model],
  };
}

export interface CustomColors {
  colorLow: string;
  colorMid: string;
  colorHigh: string;
}

interface SceneProps {
  sampleAnalysis: () => AudioAnalysis;
  theme: Theme;
  model: ModelKind;
  customColors?: CustomColors | null;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

interface PaletteProps {
  palette: Palette;
}

function ReactiveCore({
  sampleAnalysis,
  palette,
  model,
}: {
  sampleAnalysis: () => AudioAnalysis;
  model: ModelKind;
} & PaletteProps) {
  const matRef = useRef<ShaderMaterial>(null);
  const groupRef = useRef<Group>(null);
  const reduced = useReducedMotion();
  const pulseRef = useRef(0);

  // Created once. Color values mutate via the effect below when the theme or
  // model changes; the same applies to the displacement-scale scalar.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBass: { value: 0 },
      uMid: { value: 0 },
      uHigh: { value: 0 },
      uBeatPulse: { value: 0 },
      uDisplacementScale: { value: palette.displacementScale },
      uColorLow: { value: new Color(palette.colorLow) },
      uColorMid: { value: new Color(palette.colorMid) },
      uColorHigh: { value: new Color(palette.colorHigh) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    uniforms.uColorLow.value.set(palette.colorLow);
    uniforms.uColorMid.value.set(palette.colorMid);
    uniforms.uColorHigh.value.set(palette.colorHigh);
    uniforms.uDisplacementScale.value = palette.displacementScale;
  }, [
    palette.colorLow,
    palette.colorMid,
    palette.colorHigh,
    palette.displacementScale,
    uniforms,
  ]);

  useFrame((_, delta) => {
    const mat = matRef.current;
    const group = groupRef.current;
    if (!mat || !group) return;

    const dt = Math.min(delta, 0.05);
    const a = sampleAnalysis();

    if (a.beat) pulseRef.current = 1;
    pulseRef.current = Math.max(0, pulseRef.current - dt * 3.4);

    mat.uniforms.uTime.value += reduced ? dt * 0.3 : dt;
    mat.uniforms.uBass.value += (a.bass - mat.uniforms.uBass.value) * 0.35;
    mat.uniforms.uMid.value += (a.mid - mat.uniforms.uMid.value) * 0.35;
    mat.uniforms.uHigh.value += (a.high - mat.uniforms.uHigh.value) * 0.35;
    mat.uniforms.uBeatPulse.value = pulseRef.current;

    if (!reduced) {
      group.rotation.y += dt * (0.12 + a.mid * 0.6);
      group.rotation.x += dt * (0.05 + a.high * 0.35);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <CoreGeometry kind={model} detail="high" />
        <shaderMaterial
          ref={matRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
      <mesh scale={1.02}>
        <CoreGeometry kind={model} detail="low" />
        <meshBasicMaterial
          color={palette.wire}
          wireframe
          transparent
          opacity={palette.wireOpacity}
        />
      </mesh>
    </group>
  );
}

function ParticleAura({
  sampleAnalysis,
  palette,
}: { sampleAnalysis: () => AudioAnalysis } & PaletteProps) {
  const ref = useRef<Points>(null);
  const reduced = useReducedMotion();

  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const r = 1.6 + Math.random() * 2.6;
      arr[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      arr[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
      arr[i * 3 + 2] = Math.cos(phi) * r;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    const points = ref.current;
    if (!points) return;
    const a = sampleAnalysis();
    const dt = Math.min(delta, 0.05);
    if (!reduced) {
      points.rotation.y += dt * (0.04 + a.mid * 0.4);
      points.rotation.x += dt * (0.02 + a.high * 0.25);
    }
    const mat = points.material as PointsMaterial;
    mat.size = 0.018 + a.level * 0.06 + (a.beat ? 0.02 : 0);
    mat.opacity =
      palette.particleOpacityBase + a.level * palette.particleOpacityRange;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        sizeAttenuation
        color={palette.particle}
        transparent
        opacity={palette.particleOpacityBase}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

function BeatCamera({ sampleAnalysis }: { sampleAnalysis: () => AudioAnalysis }) {
  const reduced = useReducedMotion();
  const pulseRef = useRef(0);
  const baseZ = 4.4;

  useFrame((state, delta) => {
    const cam = state.camera as PerspectiveCamera;
    const dt = Math.min(delta, 0.05);
    const a = sampleAnalysis();
    if (a.beat) pulseRef.current = 1;
    pulseRef.current = Math.max(0, pulseRef.current - dt * 2.6);

    const t = state.clock.elapsedTime;
    const swayX = reduced ? 0 : Math.sin(t * 0.35) * 0.35;
    const swayY = reduced ? 0 : Math.cos(t * 0.28) * 0.22;
    const zoom = baseZ - a.level * 0.4 - pulseRef.current * 0.45;

    cam.position.x += (swayX - cam.position.x) * 0.05;
    cam.position.y += (swayY - cam.position.y) * 0.05;
    cam.position.z += (zoom - cam.position.z) * 0.08;
    cam.lookAt(0, 0, 0);
  });

  return null;
}

export default function MusicVisualizerScene({
  sampleAnalysis,
  theme,
  model,
  customColors,
  onCanvasReady,
}: SceneProps) {
  const palette = useMemo(
    () => buildPalette(theme, model, customColors),
    [theme, model, customColors],
  );

  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 4.4], fov: 55 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        onCanvasReady?.(gl.domElement);
      }}
    >
      <color attach="background" args={[palette.bg]} />
      <fog attach="fog" args={[palette.bg, palette.fog[0], palette.fog[1]]} />
      <ambientLight intensity={palette.ambient} />

      <ReactiveCore
        sampleAnalysis={sampleAnalysis}
        palette={palette}
        model={model}
      />
      <ParticleAura sampleAnalysis={sampleAnalysis} palette={palette} />
      <BeatCamera sampleAnalysis={sampleAnalysis} />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={palette.bloomIntensity}
          luminanceThreshold={palette.bloomThreshold}
          luminanceSmoothing={0.85}
          kernelSize={KernelSize.LARGE}
          mipmapBlur
        />
        <Vignette
          eskil={false}
          offset={0.25}
          darkness={palette.vignetteDarkness}
        />
      </EffectComposer>
    </Canvas>
  );
}
