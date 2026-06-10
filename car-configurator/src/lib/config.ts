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
  taillight: 'red_glass', // used to detect which end is the rear
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
