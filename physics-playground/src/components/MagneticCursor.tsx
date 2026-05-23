import { useEffect, useRef } from 'react';
import gsap from 'gsap';

type CursorMode = 'idle' | 'card' | 'button';

/**
 * A custom two-part cursor: a tight inner dot and a trailing outer ring. The
 * ring lerps with a longer `quickTo` duration than the dot, so it lags and
 * "catches up" — and it scales up over interactive elements (`data-cursor`).
 *
 * Rendered only on fine pointers; the parent skips it entirely on touch.
 */
export function MagneticCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Two interpolation speeds — the ring trails, the dot tracks tightly.
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3.out' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' });

    let mode: CursorMode = 'idle';

    const apply = (next: CursorMode) => {
      if (next === mode) return;
      mode = next;
      const scale = next === 'card' ? 1.9 : next === 'button' ? 1.45 : 1;
      gsap.to(ring, {
        scale,
        borderColor:
          next === 'idle' ? 'rgba(230,232,241,0.35)' : 'rgba(34,211,238,0.9)',
        duration: 0.4,
        ease: 'elastic.out(1, 0.55)',
      });
      gsap.to(dot, {
        scale: next === 'idle' ? 1 : 0.4,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const onMove = (e: PointerEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
      const hit = (e.target as HTMLElement | null)?.closest?.('[data-cursor]');
      apply((hit?.getAttribute('data-cursor') as CursorMode) ?? 'idle');
    };
    const onDown = () =>
      gsap.to(ring, { scale: '-=0.35', duration: 0.18, ease: 'power2.out' });
    const onUp = () => apply(mode === 'idle' ? 'idle' : mode); // re-resolve scale
    const onEnter = () => gsap.to([dot, ring], { opacity: 1, duration: 0.25 });
    const onLeave = () => gsap.to([dot, ring], { opacity: 0, duration: 0.25 });

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointerenter', onEnter);
    document.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerenter', onEnter);
      document.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf([dot, ring]);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      <div
        ref={ringRef}
        className="absolute h-9 w-9 rounded-full border opacity-0"
        style={{
          marginLeft: '-1.125rem',
          marginTop: '-1.125rem',
          borderColor: 'rgba(230,232,241,0.35)',
          backdropFilter: 'invert(4%)',
        }}
      />
      <div
        ref={dotRef}
        className="absolute h-1.5 w-1.5 rounded-full bg-accent-cyan opacity-0"
        style={{
          marginLeft: '-3px',
          marginTop: '-3px',
          boxShadow: '0 0 10px rgba(34,211,238,0.9)',
        }}
      />
    </div>
  );
}
