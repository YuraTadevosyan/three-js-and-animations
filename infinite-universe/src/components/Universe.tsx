import { Canvas } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import { Scene } from './scene/Scene';
import { useUniverse } from '@/state/universeStore';
import { useKonami } from '@/hooks/useKonami';
import { IntroOverlay } from './ui/IntroOverlay';
import { Hud } from './ui/Hud';
import { FocusPanel } from './ui/FocusPanel';
import { Toast } from './ui/Toast';

/** Canvas + DOM overlays + global interactions. */
export function Universe() {
  const { started, shared, triggerWarp, focus, setFocus, speedLevel, setSpeedLevel } =
    useUniverse();
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelAt = useRef(0);

  // Konami code → hyperspace (only once the drift has begun).
  useKonami(() => {
    if (started) triggerWarp();
  });

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      shared.pointer.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -(((e.clientY - r.top) / r.height) * 2 - 1),
      );
    },
    [shared],
  );

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      const now = performance.now();
      if (now - wheelAt.current < 260) return;
      wheelAt.current = now;
      setSpeedLevel(speedLevel + (e.deltaY < 0 ? 1 : -1));
    },
    [speedLevel, setSpeedLevel],
  );

  // Esc releases a scanned world.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focus) setFocus(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus, setFocus]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      onPointerMove={onPointerMove}
      onWheel={onWheel}
    >
      <Canvas
        camera={{ position: [0, 0, 0], fov: 70, near: 0.1, far: 2000 }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Scene />
      </Canvas>

      <Hud />
      <FocusPanel />
      <Toast />
      {!started && <IntroOverlay />}
    </div>
  );
}
