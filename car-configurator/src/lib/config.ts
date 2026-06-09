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
];

export type WheelStyleId = 'gunmetal' | 'satin' | 'silver' | 'bronze';

export interface WheelOption {
  id: WheelStyleId;
  name: string;
  /** Rim + caliper finish colour. */
  hex: string;
  metalness: number;
  roughness: number;
  /** Short marketing blurb shown in the selector. */
  blurb: string;
}

// On this model the rim and caliper share one material, so the "wheels" control
// is a finish selector rather than a geometry swap.
export const WHEELS: WheelOption[] = [
  { id: 'gunmetal', name: 'Gunmetal', hex: '#3b3e45', metalness: 0.95, roughness: 0.32, blurb: 'OEM M forged satin' },
  { id: 'satin', name: 'Satin Black', hex: '#141519', metalness: 0.85, roughness: 0.45, blurb: 'Murdered-out stealth' },
  { id: 'silver', name: 'Hyper Silver', hex: '#b9bec6', metalness: 1.0, roughness: 0.22, blurb: 'Polished motorsport' },
  { id: 'bronze', name: 'Bronze', hex: '#9a7338', metalness: 0.95, roughness: 0.3, blurb: 'JDM tuner bronze' },
];

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
export const DEFAULT_WHEEL = WHEELS[0];
export const DEFAULT_VIEW: CameraViewId = 'hero';
