import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// A blended-difference cursor dot. Position is lerped each frame from the
// raw pointer so it lags slightly — the same lag the orb has, which keeps
// the DOM and WebGL motion feeling coherent.
export function Cursor() {
  const ref = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };
    window.addEventListener('pointermove', onMove);

    const tick = (time: number) => {
      void time;
      current.current.x += (target.current.x - current.current.x) * 0.18;
      current.current.y += (target.current.y - current.current.y) * 0.18;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      }
    };
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      gsap.ticker.remove(tick);
    };
  }, []);

  return <div ref={ref} className="cursor-dot" aria-hidden="true" />;
}
