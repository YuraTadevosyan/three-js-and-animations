// Static configuration for the car configurator: paint finishes, wheel styles,
// camera presets, and brake-caliper colors. Everything the UI offers is driven
// from these tables so the scene and the controls never drift apart.

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
  { id: 'alpine', name: 'Alpine White', hex: '#eef1f4', metalness: 0.55, roughness: 0.34 },
  { id: 'jet', name: 'Jet Black', hex: '#0a0b0d', metalness: 0.92, roughness: 0.18 },
  { id: 'estoril', name: 'Estoril Blue', hex: '#1f4ea8', metalness: 0.9, roughness: 0.26 },
  { id: 'laguna', name: 'Laguna Seca', hex: '#2bb6e6', metalness: 0.9, roughness: 0.24 },
  { id: 'imola', name: 'Imola Red', hex: '#b3060f', metalness: 0.88, roughness: 0.28 },
  { id: 'phoenix', name: 'Phoenix Yellow', hex: '#f2c20b', metalness: 0.85, roughness: 0.3 },
  { id: 'titanium', name: 'Titanium Silver', hex: '#9aa1a8', metalness: 0.95, roughness: 0.22 },
  { id: 'oxford', name: 'Oxford Green', hex: '#10362a', metalness: 0.9, roughness: 0.26 },
];

export type WheelStyleId = 'style32' | 'style67' | 'mContour' | 'classicBBS';

export interface WheelOption {
  id: WheelStyleId;
  name: string;
  /** Number of primary spokes drawn around the rim. */
  spokes: number;
  /** Whether each spoke forks into a double-spoke (M-style). */
  split: boolean;
  /** Rim face tint. */
  rimColor: string;
  /** Rim finish metalness. */
  metalness: number;
  /** Short marketing blurb shown in the selector. */
  blurb: string;
}

export const WHEELS: WheelOption[] = [
  {
    id: 'style32',
    name: 'Style 32',
    spokes: 5,
    split: true,
    rimColor: '#c9ced6',
    metalness: 0.95,
    blurb: 'Cross-spoke staggered — the E46 classic',
  },
  {
    id: 'style67',
    name: 'Style 67 M',
    spokes: 5,
    split: true,
    rimColor: '#3a3d44',
    metalness: 0.85,
    blurb: 'Shadow-grey M double-spoke',
  },
  {
    id: 'mContour',
    name: 'M Contour',
    spokes: 10,
    split: false,
    rimColor: '#7f868f',
    metalness: 0.92,
    blurb: 'Forged 10-spoke, track ready',
  },
  {
    id: 'classicBBS',
    name: 'BBS Mesh',
    spokes: 12,
    split: false,
    rimColor: '#d6b65c',
    metalness: 0.9,
    blurb: 'Gold mesh — JDM tuner heritage',
  },
];

export interface CaliperOption {
  id: string;
  name: string;
  hex: string;
}

export const CALIPERS: CaliperOption[] = [
  { id: 'red', name: 'Brembo Red', hex: '#cc1f1f' },
  { id: 'blue', name: 'M Blue', hex: '#1763d6' },
  { id: 'yellow', name: 'Track Yellow', hex: '#f0c000' },
  { id: 'graphite', name: 'Graphite', hex: '#2a2c30' },
];

export type CameraViewId = 'hero' | 'front' | 'side' | 'rear' | 'wheel' | 'top';

export interface CameraView {
  id: CameraViewId;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
}

// Camera presets, tuned around a car centred at the origin (~4.5m long).
export const CAMERA_VIEWS: CameraView[] = [
  { id: 'hero', name: 'Hero', position: [5.4, 2.0, 5.8], target: [0, 0.55, 0] },
  { id: 'front', name: 'Front', position: [0.2, 1.3, 7.4], target: [0, 0.6, 0.4] },
  { id: 'side', name: 'Profile', position: [8.2, 1.1, 0.1], target: [0, 0.6, 0] },
  { id: 'rear', name: 'Rear', position: [-1.6, 1.6, -7.2], target: [0, 0.6, -0.4] },
  { id: 'wheel', name: 'Wheel', position: [3.4, 0.7, 3.6], target: [1.35, 0.35, 1.45] },
  { id: 'top', name: 'Overhead', position: [0.01, 8.6, 2.2], target: [0, 0.3, 0] },
];

export const DEFAULT_PAINT = PAINTS[2]; // Estoril Blue
export const DEFAULT_WHEEL = WHEELS[0];
export const DEFAULT_CALIPER = CALIPERS[0];
export const DEFAULT_VIEW: CameraViewId = 'hero';
