import * as THREE from 'three';
import { UNIVERSE } from '@/lib/config';
import { FrameDirector } from './FrameDirector';
import { CameraRig } from './CameraRig';
import { Nebula } from './Nebula';
import { Starfield } from './Starfield';
import { Dust } from './Dust';
import { Worlds } from './Worlds';
import { Effects } from './Effects';

/** Everything that lives inside the R3F canvas. */
export function Scene() {
  return (
    <>
      <color attach="background" args={['#02030a']} />
      <fog attach="fog" args={[new THREE.Color('#03040d'), UNIVERSE.fogNear, UNIVERSE.fogFar]} />

      <FrameDirector />
      <CameraRig />

      <Nebula />
      <Starfield />
      <Dust />
      <Worlds />

      <Effects />
    </>
  );
}
