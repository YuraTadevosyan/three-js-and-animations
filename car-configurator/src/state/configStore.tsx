import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  customColor,
  customFinish,
  customPaint,
  DEFAULT_HEADLIGHT,
  DEFAULT_PAINT,
  DEFAULT_PAINT_FINISH,
  DEFAULT_SCENE,
  DEFAULT_TAILLIGHT,
  DEFAULT_VIEW,
  DEFAULT_WHEEL_FINISH,
  DEFAULT_WHEEL_STYLE,
  DEFAULT_WINDOW_TINT,
  HEADLIGHT_COLORS,
  PAINT_FINISHES,
  PAINTS,
  SCENES,
  TAILLIGHT_COLORS,
  WHEEL_FINISHES,
  WHEEL_STYLES,
  type CameraViewId,
  type PaintFinish,
  type PaintOption,
  type SceneOption,
  type SimpleColor,
  type WheelFinish,
  type WheelStyle,
} from '@/lib/config';

interface ConfigState {
  paint: PaintOption;
  paintFinish: PaintFinish;
  wheelStyle: WheelStyle;
  wheelFinish: WheelFinish;
  headlightColor: SimpleColor;
  taillightColor: SimpleColor;
  windowTint: number;
  carbonOn: boolean;
  scene: SceneOption;
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
  setPaintFinish: (finish: PaintFinish) => void;
  setWheelStyle: (style: WheelStyle) => void;
  setWheelFinish: (finish: WheelFinish) => void;
  setCustomFinish: (hex: string) => void;
  setHeadlightColor: (color: SimpleColor) => void;
  setCustomHeadlight: (hex: string) => void;
  setTaillightColor: (color: SimpleColor) => void;
  setCustomTaillight: (hex: string) => void;
  setWindowTint: (tint: number) => void;
  toggleCarbon: () => void;
  setScene: (scene: SceneOption) => void;
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
  const [paintFinish, setPaintFinish] = useState<PaintFinish>(DEFAULT_PAINT_FINISH);
  const [wheelStyle, setWheelStyle] = useState<WheelStyle>(DEFAULT_WHEEL_STYLE);
  const [wheelFinish, setWheelFinish] = useState<WheelFinish>(DEFAULT_WHEEL_FINISH);
  const [headlightColor, setHeadlightColor] = useState<SimpleColor>(DEFAULT_HEADLIGHT);
  const [taillightColor, setTaillightColor] = useState<SimpleColor>(DEFAULT_TAILLIGHT);
  const [windowTint, setWindowTint] = useState(DEFAULT_WINDOW_TINT);
  const [carbonOn, setCarbonOn] = useState(true);
  const [scene, setScene] = useState<SceneOption>(DEFAULT_SCENE);
  const [view, setViewState] = useState<CameraViewId>(DEFAULT_VIEW);
  const [viewNonce, setViewNonce] = useState(0);
  const [headlightsOn, setHeadlightsOn] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);

  const setCustomPaint = useCallback((hex: string) => setPaint(customPaint(hex)), []);
  const setCustomFinish = useCallback(
    (hex: string) => setWheelFinish(customFinish(hex)),
    [],
  );
  const setCustomHeadlight = useCallback(
    (hex: string) => setHeadlightColor(customColor(hex)),
    [],
  );
  const setCustomTaillight = useCallback(
    (hex: string) => setTaillightColor(customColor(hex)),
    [],
  );
  const toggleCarbon = useCallback(() => setCarbonOn((on) => !on), []);

  const setView = useCallback((next: CameraViewId) => {
    setViewState(next);
    setViewNonce((n) => n + 1);
  }, []);

  const toggleHeadlights = useCallback(() => setHeadlightsOn((on) => !on), []);
  const toggleAutoSpin = useCallback(() => setAutoSpin((on) => !on), []);

  const randomize = useCallback(() => {
    setPaint(pick(PAINTS));
    setPaintFinish(pick(PAINT_FINISHES));
    setWheelStyle(pick(WHEEL_STYLES));
    setWheelFinish(pick(WHEEL_FINISHES));
    setHeadlightColor(pick(HEADLIGHT_COLORS));
    setTaillightColor(pick(TAILLIGHT_COLORS));
    setScene(pick(SCENES));
  }, []);

  const value = useMemo<ConfigContextValue>(
    () => ({
      paint,
      paintFinish,
      wheelStyle,
      wheelFinish,
      headlightColor,
      taillightColor,
      windowTint,
      carbonOn,
      scene,
      view,
      viewNonce,
      headlightsOn,
      autoSpin,
      setPaint,
      setCustomPaint,
      setPaintFinish,
      setWheelStyle,
      setWheelFinish,
      setCustomFinish,
      setHeadlightColor,
      setCustomHeadlight,
      setTaillightColor,
      setCustomTaillight,
      setWindowTint,
      toggleCarbon,
      setScene,
      setView,
      toggleHeadlights,
      toggleAutoSpin,
      randomize,
    }),
    [
      paint,
      paintFinish,
      wheelStyle,
      wheelFinish,
      headlightColor,
      taillightColor,
      windowTint,
      carbonOn,
      scene,
      view,
      viewNonce,
      headlightsOn,
      autoSpin,
      setCustomPaint,
      setCustomFinish,
      setCustomHeadlight,
      setCustomTaillight,
      toggleCarbon,
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
