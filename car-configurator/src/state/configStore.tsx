import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  customFinish,
  customPaint,
  DEFAULT_PAINT,
  DEFAULT_VIEW,
  DEFAULT_WHEEL_FINISH,
  DEFAULT_WHEEL_STYLE,
  PAINTS,
  WHEEL_FINISHES,
  WHEEL_STYLES,
  type CameraViewId,
  type PaintOption,
  type WheelFinish,
  type WheelStyle,
} from '@/lib/config';

interface ConfigState {
  paint: PaintOption;
  wheelStyle: WheelStyle;
  wheelFinish: WheelFinish;
  view: CameraViewId;
  headlightsOn: boolean;
  autoSpin: boolean;
  /** Bumped each time the user explicitly picks a view, even the current one,
   *  so the camera rig can re-fly even when the id does not change. */
  viewNonce: number;
}

interface ConfigActions {
  setPaint: (paint: PaintOption) => void;
  setCustomPaint: (hex: string) => void;
  setWheelStyle: (style: WheelStyle) => void;
  setWheelFinish: (finish: WheelFinish) => void;
  setCustomFinish: (hex: string) => void;
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
  const [wheelStyle, setWheelStyle] = useState<WheelStyle>(DEFAULT_WHEEL_STYLE);
  const [wheelFinish, setWheelFinish] = useState<WheelFinish>(DEFAULT_WHEEL_FINISH);
  const [view, setViewState] = useState<CameraViewId>(DEFAULT_VIEW);
  const [viewNonce, setViewNonce] = useState(0);
  const [headlightsOn, setHeadlightsOn] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);

  const setCustomPaint = useCallback((hex: string) => setPaint(customPaint(hex)), []);
  const setCustomFinish = useCallback(
    (hex: string) => setWheelFinish(customFinish(hex)),
    [],
  );

  const setView = useCallback((next: CameraViewId) => {
    setViewState(next);
    setViewNonce((n) => n + 1);
  }, []);

  const toggleHeadlights = useCallback(() => setHeadlightsOn((on) => !on), []);
  const toggleAutoSpin = useCallback(() => setAutoSpin((on) => !on), []);

  const randomize = useCallback(() => {
    setPaint(pick(PAINTS));
    setWheelStyle(pick(WHEEL_STYLES));
    setWheelFinish(pick(WHEEL_FINISHES));
  }, []);

  const value = useMemo<ConfigContextValue>(
    () => ({
      paint,
      wheelStyle,
      wheelFinish,
      view,
      viewNonce,
      headlightsOn,
      autoSpin,
      setPaint,
      setCustomPaint,
      setWheelStyle,
      setWheelFinish,
      setCustomFinish,
      setView,
      toggleHeadlights,
      toggleAutoSpin,
      randomize,
    }),
    [
      paint,
      wheelStyle,
      wheelFinish,
      view,
      viewNonce,
      headlightsOn,
      autoSpin,
      setCustomPaint,
      setCustomFinish,
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
