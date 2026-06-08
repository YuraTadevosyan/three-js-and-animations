import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  CALIPERS,
  DEFAULT_CALIPER,
  DEFAULT_PAINT,
  DEFAULT_VIEW,
  DEFAULT_WHEEL,
  PAINTS,
  WHEELS,
  type CaliperOption,
  type CameraViewId,
  type PaintOption,
  type WheelOption,
} from '@/lib/config';

interface ConfigState {
  paint: PaintOption;
  wheel: WheelOption;
  caliper: CaliperOption;
  view: CameraViewId;
  headlightsOn: boolean;
  autoSpin: boolean;
  /** Bumped each time the user explicitly picks a view, even the current one,
   *  so the camera rig can re-fly even when the id does not change. */
  viewNonce: number;
}

interface ConfigActions {
  setPaint: (paint: PaintOption) => void;
  setWheel: (wheel: WheelOption) => void;
  setCaliper: (caliper: CaliperOption) => void;
  setView: (view: CameraViewId) => void;
  toggleHeadlights: () => void;
  toggleAutoSpin: () => void;
  randomize: () => void;
}

type ConfigContextValue = ConfigState & ConfigActions;

const ConfigContext = createContext<ConfigContextValue | null>(null);

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [paint, setPaint] = useState<PaintOption>(DEFAULT_PAINT);
  const [wheel, setWheel] = useState<WheelOption>(DEFAULT_WHEEL);
  const [caliper, setCaliper] = useState<CaliperOption>(DEFAULT_CALIPER);
  const [view, setViewState] = useState<CameraViewId>(DEFAULT_VIEW);
  const [viewNonce, setViewNonce] = useState(0);
  const [headlightsOn, setHeadlightsOn] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);

  const setView = useCallback((next: CameraViewId) => {
    setViewState(next);
    setViewNonce((n) => n + 1);
  }, []);

  const toggleHeadlights = useCallback(
    () => setHeadlightsOn((on) => !on),
    [],
  );
  const toggleAutoSpin = useCallback(() => setAutoSpin((on) => !on), []);

  const randomize = useCallback(() => {
    setPaint(pick(PAINTS));
    setWheel(pick(WHEELS));
    setCaliper(pick(CALIPERS));
  }, []);

  const value = useMemo<ConfigContextValue>(
    () => ({
      paint,
      wheel,
      caliper,
      view,
      viewNonce,
      headlightsOn,
      autoSpin,
      setPaint,
      setWheel,
      setCaliper,
      setView,
      toggleHeadlights,
      toggleAutoSpin,
      randomize,
    }),
    [
      paint,
      wheel,
      caliper,
      view,
      viewNonce,
      headlightsOn,
      autoSpin,
      setView,
      toggleHeadlights,
      toggleAutoSpin,
      randomize,
    ],
  );

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return ctx;
}
