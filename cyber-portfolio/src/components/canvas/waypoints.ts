import * as THREE from 'three';
import type { SectionId } from '@/store/useScene';

export type Waypoint = {
  /** Camera position for this section. */
  position: THREE.Vector3;
  /** Point the camera looks at. */
  target: THREE.Vector3;
};

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/**
 * One cinematic camera waypoint per section. The rig lerps between these as
 * the active section changes, so scrolling feels like a continuous dolly.
 */
export const WAYPOINTS: Record<SectionId, Waypoint> = {
  hero: { position: v(0, 1.55, 9.0), target: v(0, 0.6, 0) },
  about: { position: v(-4.3, 1.2, 6.0), target: v(-0.4, 0.45, 0) },
  projects: { position: v(4.7, 1.85, 5.8), target: v(0.4, 0.5, 0) },
  skills: { position: v(0, 4.1, 6.6), target: v(0, 0.15, 0) },
  contact: { position: v(0, 1.15, 11.2), target: v(0, 0.85, 0) },
};

export const SECTION_ORDER: SectionId[] = [
  'hero',
  'about',
  'projects',
  'skills',
  'contact',
];
