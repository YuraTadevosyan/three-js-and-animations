// Static configuration for the car configurator. Everything the UI offers is
// driven from these tables, and the material ids match the GLB the scene loads
// (NFS Most Wanted BMW M3 GTR E46).

/** Path to the car model, respecting the GitHub Pages base path. */
export const CAR_MODEL_URL = `${import.meta.env.BASE_URL}models/bmw-m3-gtr.glb`;

/** Material names inside the GLB that the configurator drives. */
export const MAT = {
  paint: 'mMAT_Carpaint_Blue1',
  wheel: 'mMAT_Tire_Brake_048', // rims + calipers share this material
  lights: 'mMAT_Lights_014',
  taillight: 'red_glass', // also used to detect which end is the rear
  glass: 'mMAT_Glass_013',
  carbon: 'mMAT_Carbon1', // hood vents / spoiler / diffuser carbon
} as const;

export interface PaintOption {
  id: string;
  /** Display name (BMW individual palette flavour). */
  name: string;
  /** Base coat colour as a hex string. */
  hex: string;
  /** 0 = matte clearcoat, 1 = liquid-metal flake. */
  metalness: number;
  /** Surface micro-roughness of the clearcoat. */
  roughness: number;
}

export const PAINTS: PaintOption[] = [
  { id: 'alpine', name: 'Alpine White', hex: '#eef1f4', metalness: 0.6, roughness: 0.3 },
  { id: 'jet', name: 'Jet Black', hex: '#0a0b0d', metalness: 0.9, roughness: 0.16 },
  { id: 'estoril', name: 'Estoril Blue', hex: '#1f4ea8', metalness: 0.85, roughness: 0.22 },
  { id: 'laguna', name: 'Laguna Seca', hex: '#2bb6e6', metalness: 0.85, roughness: 0.22 },
  { id: 'imola', name: 'Imola Red', hex: '#b3060f', metalness: 0.85, roughness: 0.24 },
  { id: 'phoenix', name: 'Phoenix Yellow', hex: '#f2c20b', metalness: 0.8, roughness: 0.26 },
  { id: 'titanium', name: 'Titanium Silver', hex: '#9aa1a8', metalness: 0.95, roughness: 0.2 },
  { id: 'oxford', name: 'Oxford Green', hex: '#10362a', metalness: 0.88, roughness: 0.24 },
  { id: 'frozen', name: 'Frozen Grey', hex: '#6b7077', metalness: 0.4, roughness: 0.62 },
  { id: 'sakhir', name: 'Sakhir Orange', hex: '#d8591b', metalness: 0.85, roughness: 0.24 },
  { id: 'daytona', name: 'Daytona Violet', hex: '#5b2a8c', metalness: 0.88, roughness: 0.22 },
  { id: 'british', name: 'British Racing', hex: '#0c3b2e', metalness: 0.9, roughness: 0.2 },
];

/** Build a one-off paint from the custom colour picker. */
export function customPaint(hex: string): PaintOption {
  return { id: 'custom', name: 'Custom', hex, metalness: 0.88, roughness: 0.22 };
}
export const CUSTOM_PAINT_DEFAULT = '#15d6a0';

// Paint finish controls the surface (the colour stays the same). These map to
// metalness / roughness / env-reflection on the body material.
export interface PaintFinish {
  id: string;
  name: string;
  metalness: number;
  roughness: number;
  env: number;
}

export const PAINT_FINISHES: PaintFinish[] = [
  { id: 'gloss', name: 'Gloss', metalness: 0.85, roughness: 0.16, env: 1.6 },
  { id: 'metallic', name: 'Metallic', metalness: 1.0, roughness: 0.3, env: 1.75 },
  { id: 'satin', name: 'Satin', metalness: 0.5, roughness: 0.5, env: 1.0 },
  { id: 'matte', name: 'Matte', metalness: 0.0, roughness: 0.92, env: 0.4 },
  { id: 'pearl', name: 'Pearl', metalness: 0.9, roughness: 0.22, env: 1.9 },
  { id: 'chrome', name: 'Chrome', metalness: 1.0, roughness: 0.04, env: 2.3 },
];

export const DEFAULT_PAINT_FINISH = PAINT_FINISHES[0];

// ---- Wheels: geometry style + finish colour are two independent choices ----

export type WheelStyleId = 'oem' | 'tuner3' | 'split5' | 'ten' | 'mesh';

export interface WheelStyle {
  id: WheelStyleId;
  name: string;
  /**
   * 'oem'   — keep the car's own rims.
   * 'model' — mount a real wheel GLB at each hub.
   * 'proc'  — mount generated geometry (fallback / stylised).
   */
  kind: 'oem' | 'model' | 'proc';
  blurb: string;
  /** Spoke count used only to draw the little UI preview. */
  spokes?: number;
  split?: boolean;
  /** model: GLB url + which axis the wheel spins around in that file. */
  url?: string;
  axis?: 'x' | 'y' | 'z';
}

// Drop more wheel GLBs into public/models/wheels/ and add an entry here.
export const WHEEL_STYLES: WheelStyle[] = [
  { id: 'oem', name: 'GTR Forged', kind: 'oem', spokes: 10, blurb: 'Factory M3 GTR alloy' },
  {
    id: 'tuner3',
    name: 'Tuner Mesh',
    kind: 'model',
    url: `${import.meta.env.BASE_URL}models/wheels/tuner-wheel-3.glb`,
    axis: 'z',
    spokes: 12,
    blurb: 'Real 3D multi-spoke',
  },
];

/** Every real wheel model, for preloading. */
export const WHEEL_MODEL_URLS = WHEEL_STYLES.filter((w) => w.url).map((w) => w.url!);

export interface WheelFinish {
  id: string;
  name: string;
  hex: string;
  metalness: number;
  roughness: number;
}

export const WHEEL_FINISHES: WheelFinish[] = [
  { id: 'gunmetal', name: 'Gunmetal', hex: '#3b3e45', metalness: 0.95, roughness: 0.32 },
  { id: 'satin', name: 'Satin Black', hex: '#141519', metalness: 0.85, roughness: 0.45 },
  { id: 'silver', name: 'Hyper Silver', hex: '#b9bec6', metalness: 1.0, roughness: 0.22 },
  { id: 'chrome', name: 'Chrome', hex: '#e8ecf2', metalness: 1.0, roughness: 0.08 },
  { id: 'bronze', name: 'Bronze', hex: '#9a7338', metalness: 0.95, roughness: 0.3 },
  { id: 'gold', name: 'Gold', hex: '#caa53d', metalness: 0.95, roughness: 0.26 },
  { id: 'white', name: 'Pearl White', hex: '#e8eaee', metalness: 0.6, roughness: 0.35 },
  { id: 'red', name: 'Race Red', hex: '#c01818', metalness: 0.7, roughness: 0.3 },
  { id: 'blue', name: 'M Blue', hex: '#1763d6', metalness: 0.75, roughness: 0.3 },
];

/** Build a one-off rim finish from the custom colour picker. */
export function customFinish(hex: string): WheelFinish {
  return { id: 'custom', name: 'Custom', hex, metalness: 0.9, roughness: 0.3 };
}
export const CUSTOM_FINISH_DEFAULT = '#c0392b';

// Wheel surface — the *type* of finish (gloss / metallic / matte …), independent
// of the rim colour. Mirrors the body PAINT_FINISHES and overrides the
// metalness / roughness / reflections applied to the rim + caliper materials.
export interface WheelSurface {
  id: string;
  name: string;
  metalness: number;
  roughness: number;
  env: number;
}

export const WHEEL_SURFACES: WheelSurface[] = [
  { id: 'gloss', name: 'Gloss', metalness: 0.9, roughness: 0.18, env: 1.5 },
  { id: 'metallic', name: 'Metallic', metalness: 1.0, roughness: 0.34, env: 1.7 },
  { id: 'satin', name: 'Satin', metalness: 0.7, roughness: 0.52, env: 1.0 },
  { id: 'matte', name: 'Matte', metalness: 0.15, roughness: 0.88, env: 0.4 },
  { id: 'brushed', name: 'Brushed', metalness: 1.0, roughness: 0.6, env: 1.15 },
  { id: 'chrome', name: 'Chrome', metalness: 1.0, roughness: 0.04, env: 2.2 },
];

export const DEFAULT_WHEEL_SURFACE = WHEEL_SURFACES[0];

// ---- Simple colour options (headlights, taillights) ----

export interface SimpleColor {
  id: string;
  name: string;
  hex: string;
}

/** Build a one-off colour from a custom picker. */
export function customColor(hex: string): SimpleColor {
  return { id: 'custom', name: 'Custom', hex };
}

export const HEADLIGHT_COLORS: SimpleColor[] = [
  { id: 'xenon', name: 'Xenon White', hex: '#eaf4ff' },
  { id: 'ice', name: 'Ice Blue', hex: '#a9d4ff' },
  { id: 'cyan', name: 'Cyan', hex: '#3dd7ff' },
  { id: 'violet', name: 'Violet', hex: '#b58bff' },
  { id: 'amber', name: 'Amber', hex: '#ffb24d' },
  { id: 'toxic', name: 'Toxic Green', hex: '#9bff5a' },
];

export const TAILLIGHT_COLORS: SimpleColor[] = [
  { id: 'red', name: 'Classic Red', hex: '#ff1f1f' },
  { id: 'smoked', name: 'Smoked', hex: '#5e1414' },
  { id: 'crystal', name: 'Crystal Red', hex: '#ff5a5a' },
  { id: 'amber', name: 'Amber', hex: '#ff8a1a' },
  { id: 'ice', name: 'Ice Blue', hex: '#9fd0ff' },
  { id: 'toxic', name: 'Toxic Green', hex: '#39ff8b' },
];

export const DEFAULT_HEADLIGHT = HEADLIGHT_COLORS[0];
export const DEFAULT_TAILLIGHT = TAILLIGHT_COLORS[0];
/** Window tint, 0 = factory glass … 1 = blacked-out limo. */
export const DEFAULT_WINDOW_TINT = 0.3;

// ---- Headlight beam mode: off / low (ближний) / high (дальний) ----

export type BeamMode = 'off' | 'low' | 'high';

export interface BeamSetting {
  id: BeamMode;
  /** Short label for the segmented control. */
  name: string;
  /** Full label for the section hint. */
  full: string;
  /** Headlight material emissive intensity. */
  emissive: number;
  /** Forward spotlight intensity. */
  beam: number;
  /** Spot cone half-angle (rad) — high beam is tighter for a longer throw. */
  angle: number;
  /** Beam reach in world units. */
  distance: number;
  /** Vertical aim of the beam target: low beam dips toward the road, high
   *  beam flattens out and reaches further. */
  aimY: number;
}

export const BEAM_MODES: BeamSetting[] = [
  { id: 'off', name: 'Off', full: 'Off', emissive: 0, beam: 0, angle: 0.5, distance: 18, aimY: -0.4 },
  { id: 'low', name: 'Low', full: 'Low beam', emissive: 2.2, beam: 16, angle: 0.6, distance: 13, aimY: -1.6 },
  { id: 'high', name: 'High', full: 'High beam', emissive: 3.8, beam: 32, angle: 0.42, distance: 28, aimY: 0.4 },
];

export const DEFAULT_BEAM_MODE: BeamMode = 'off';

/** Next mode in the off → low → high → off cycle (used by the toolbar button). */
export function nextBeamMode(mode: BeamMode): BeamMode {
  const order: BeamMode[] = ['off', 'low', 'high'];
  return order[(order.indexOf(mode) + 1) % order.length];
}

/** Look up a beam setting by id (falls back to Off). */
export function beamSetting(mode: BeamMode): BeamSetting {
  return BEAM_MODES.find((b) => b.id === mode) ?? BEAM_MODES[0];
}

// ---- Background scenes (garage moods) ----

export interface SceneOption {
  id: string;
  name: string;
  /** Scene background + fog colour. */
  background: string;
  fog: string;
  /** Reflections-environment background. */
  envBg: string;
  /** Reflective floor tint. */
  floor: string;
  /** Two neon accent colours (rim lights + wall strips). */
  accentA: string;
  accentB: string;
  /** Key light tint. */
  key: string;
  /** Ambient fill intensity. */
  ambient: number;
  /** Wall colour. */
  wall: string;
}

export const SCENES: SceneOption[] = [
  { id: 'garage', name: 'NFS Garage', background: '#06070b', fog: '#06070b', envBg: '#05060a', floor: '#0a0c12', accentA: '#3dd7ff', accentB: '#ff5a47', key: '#eef4ff', ambient: 0.42, wall: '#0a0b10' },
  { id: 'cyber', name: 'Cyberpunk', background: '#08040f', fog: '#08040f', envBg: '#0a0512', floor: '#120a1a', accentA: '#ff2db5', accentB: '#7a3dff', key: '#ecd9ff', ambient: 0.4, wall: '#0c0716' },
  { id: 'sunset', name: 'Sunset Strip', background: '#140a07', fog: '#170b07', envBg: '#160a08', floor: '#150d0a', accentA: '#ff7a1a', accentB: '#ff3d6e', key: '#ffe0c2', ambient: 0.5, wall: '#140b08' },
  { id: 'midnight', name: 'Midnight', background: '#02030a', fog: '#02030a', envBg: '#02030a', floor: '#05070f', accentA: '#2b6bff', accentB: '#13e0ff', key: '#cfe0ff', ambient: 0.32, wall: '#04060e' },
];

export const DEFAULT_SCENE = SCENES[0];

export type CameraViewId = 'hero' | 'front' | 'side' | 'rear' | 'wheel' | 'top';

export interface CameraView {
  id: CameraViewId;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
}

// Camera presets, tuned around the auto-fitted model (~4.5m long, centred at
// the origin and sitting on the floor, front facing +Z).
export const CAMERA_VIEWS: CameraView[] = [
  { id: 'hero', name: 'Hero', position: [5.4, 2.0, 5.8], target: [0, 0.6, 0] },
  { id: 'front', name: 'Front', position: [0.2, 1.3, 7.4], target: [0, 0.7, 0.4] },
  { id: 'side', name: 'Profile', position: [8.2, 1.2, 0.1], target: [0, 0.7, 0] },
  { id: 'rear', name: 'Rear', position: [-1.6, 1.7, -7.2], target: [0, 0.7, -0.4] },
  { id: 'wheel', name: 'Wheel', position: [3.6, 0.8, 3.4], target: [1.2, 0.45, 1.4] },
  { id: 'top', name: 'Overhead', position: [0.01, 8.8, 2.4], target: [0, 0.3, 0] },
];

export const DEFAULT_PAINT = PAINTS[2]; // Estoril Blue
export const DEFAULT_WHEEL_STYLE = WHEEL_STYLES[0];
export const DEFAULT_WHEEL_FINISH = WHEEL_FINISHES[0];
export const DEFAULT_VIEW: CameraViewId = 'hero';
