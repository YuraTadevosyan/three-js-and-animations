import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { UNIVERSE } from '@/lib/config';
import type { WorldDesc } from '@/lib/worldgen';

/**
 * Per-frame values shared between scene systems without triggering React
 * re-renders. Everything the render loop reads or writes 60× a second lives
 * here as a stable mutable object; React state is reserved for UI.
 */
export interface SharedFrame {
  /** Base speed multiplier from the user's selected cruise level. */
  speedMul: number;
  /** 0..1 hyperspace intensity (GSAP-ramped). */
  warp: number;
  /** Streaming + drift freeze while a world is being scanned. */
  paused: boolean;
  /** Camera position along the travel axis (written by the rig). */
  camZ: number;
  /** Total distance travelled, in world units. */
  distance: number;
  /** Count of worlds the camera has passed. */
  charted: number;
  /** Normalised pointer (-1..1) used to steer the drift. */
  pointer: THREE.Vector2;
  reducedMotion: boolean;
}

export interface EggToast {
  id: number;
  title: string;
  body: string;
}

interface UniverseValue {
  started: boolean;
  begin: () => void;
  focus: WorldDesc | null;
  setFocus: (w: WorldDesc | null) => void;
  speedLevel: number;
  cycleSpeed: () => void;
  setSpeedLevel: (i: number) => void;
  triggerWarp: () => void;
  toast: EggToast | null;
  pushToast: (title: string, body: string) => void;
  shared: SharedFrame;
}

const UniverseContext = createContext<UniverseValue | null>(null);

export function UniverseProvider({
  children,
  reducedMotion,
}: {
  children: ReactNode;
  reducedMotion: boolean;
}) {
  const [started, setStarted] = useState(false);
  const [focus, setFocusState] = useState<WorldDesc | null>(null);
  const [speedLevel, setSpeedLevelState] = useState(reducedMotion ? 0 : 1);
  const [toast, setToast] = useState<EggToast | null>(null);
  const toastId = useRef(0);
  const warpTl = useRef<gsap.core.Timeline | null>(null);

  const shared = useRef<SharedFrame>({
    speedMul: UNIVERSE.speedLevels[reducedMotion ? 0 : 1],
    warp: 0,
    paused: false,
    camZ: 0,
    distance: 0,
    charted: 0,
    pointer: new THREE.Vector2(0, 0),
    reducedMotion,
  }).current;

  const pushToast = useCallback((title: string, body: string) => {
    toastId.current += 1;
    setToast({ id: toastId.current, title, body });
    window.setTimeout(() => {
      setToast((t) => (t && t.id === toastId.current ? null : t));
    }, 5200);
  }, []);

  const begin = useCallback(() => setStarted(true), []);

  const setFocus = useCallback((w: WorldDesc | null) => {
    setFocusState(w);
    shared.paused = !!w;
  }, [shared]);

  const setSpeedLevel = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(UNIVERSE.speedLevels.length - 1, i));
      setSpeedLevelState(clamped);
      shared.speedMul = UNIVERSE.speedLevels[clamped];
    },
    [shared],
  );

  const cycleSpeed = useCallback(() => {
    setSpeedLevelState((prev) => {
      const next = (prev + 1) % UNIVERSE.speedLevels.length;
      shared.speedMul = UNIVERSE.speedLevels[next];
      return next;
    });
  }, [shared]);

  const triggerWarp = useCallback(() => {
    if (warpTl.current) warpTl.current.kill();
    warpTl.current = gsap
      .timeline()
      .to(shared, { warp: 1, duration: 0.7, ease: 'power2.in' })
      .to(shared, { warp: 0, duration: 1.8, ease: 'power2.out' }, '+=1.3');
    pushToast('Hyperspace engaged', 'Reality thins to streaks of light. Hold on.');
  }, [shared, pushToast]);

  const value = useMemo<UniverseValue>(
    () => ({
      started,
      begin,
      focus,
      setFocus,
      speedLevel,
      cycleSpeed,
      setSpeedLevel,
      triggerWarp,
      toast,
      pushToast,
      shared,
    }),
    [
      started,
      begin,
      focus,
      setFocus,
      speedLevel,
      cycleSpeed,
      setSpeedLevel,
      triggerWarp,
      toast,
      pushToast,
      shared,
    ],
  );

  return (
    <UniverseContext.Provider value={value}>{children}</UniverseContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUniverse(): UniverseValue {
  const ctx = useContext(UniverseContext);
  if (!ctx) throw new Error('useUniverse must be used within UniverseProvider');
  return ctx;
}
