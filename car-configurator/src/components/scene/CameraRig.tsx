import { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';

import { CAMERA_VIEWS } from '@/lib/config';
import { useConfig } from '@/state/configStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Drives a cinematic camera: a sweeping intro on mount, GSAP fly-to whenever a
 * preset view is chosen, and free OrbitControls in between. While a tween runs,
 * the controls are disabled so the user and GSAP never fight for the camera.
 */
export function CameraRig() {
  const controls = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const { camera } = useThree();
  const { view, viewNonce } = useConfig();
  const reducedMotion = useReducedMotion();
  const tween = useRef<gsap.core.Timeline | null>(null);
  const didIntro = useRef(false);

  const flyTo = (id: string, duration: number) => {
    const preset = CAMERA_VIEWS.find((v) => v.id === id);
    const ctl = controls.current;
    if (!preset || !ctl) return;

    tween.current?.kill();
    ctl.enabled = false;

    const tl = gsap.timeline({
      defaults: { duration, ease: 'power3.inOut' },
      onUpdate: () => ctl.update(),
      onComplete: () => {
        ctl.enabled = true;
      },
    });
    tl.to(
      camera.position,
      { x: preset.position[0], y: preset.position[1], z: preset.position[2] },
      0,
    );
    tl.to(
      ctl.target,
      { x: preset.target[0], y: preset.target[1], z: preset.target[2] },
      0,
    );
    tween.current = tl;
  };

  // Cinematic intro from a dramatic low angle into the hero shot.
  useEffect(() => {
    if (didIntro.current) return;
    didIntro.current = true;
    const ctl = controls.current;
    if (!ctl) return;

    if (reducedMotion) {
      flyTo('hero', 0);
      return;
    }
    camera.position.set(9.5, 1.1, 9.5);
    ctl.target.set(0, 0.5, 0);
    ctl.update();
    flyTo('hero', 2.4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly whenever the user picks a preset (viewNonce re-triggers same id).
  useEffect(() => {
    if (!didIntro.current) return;
    flyTo(view, reducedMotion ? 0 : 1.4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, viewNonce]);

  useEffect(() => () => void tween.current?.kill(), []);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={3.2}
      maxDistance={14}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2 - 0.04}
      target={[0, 0.55, 0]}
    />
  );
}
