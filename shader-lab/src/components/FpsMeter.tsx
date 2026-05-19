import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight RAF-driven FPS meter that updates state at most twice per second
 * so it doesn't itself contribute to render churn.
 */
export function FpsMeter() {
  const [fps, setFps] = useState(0);
  const framesRef = useRef(0);
  const lastRef   = useRef(performance.now());

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      framesRef.current++;
      const elapsed = now - lastRef.current;
      if (elapsed >= 500) {
        setFps(Math.round((framesRef.current * 1000) / elapsed));
        framesRef.current = 0;
        lastRef.current = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span className="font-mono tabular-nums text-ink-300">
      {fps.toString().padStart(2, '0')} fps
    </span>
  );
}
