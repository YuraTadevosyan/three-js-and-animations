import { useEffect, useState } from 'react';
import { useUniverse } from '@/state/universeStore';

export interface Telemetry {
  distance: number;
  charted: number;
  speedMul: number;
  warp: number;
}

/**
 * Samples the per-frame shared state a few times a second for the HUD, without
 * forcing React to re-render every animation frame.
 */
export function useTelemetry(active: boolean): Telemetry {
  const { shared } = useUniverse();
  const [tele, setTele] = useState<Telemetry>({
    distance: 0,
    charted: 0,
    speedMul: shared.speedMul,
    warp: 0,
  });

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = 0;
    const loop = (ts: number) => {
      raf = requestAnimationFrame(loop);
      if (ts - last < 150) return;
      last = ts;
      setTele({
        distance: shared.distance,
        charted: shared.charted,
        speedMul: shared.speedMul,
        warp: shared.warp,
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, shared]);

  return tele;
}
