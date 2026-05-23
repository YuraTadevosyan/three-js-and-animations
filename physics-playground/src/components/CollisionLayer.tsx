import { forwardRef, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';

export interface CollisionApi {
  /** Spawn an expanding ring at `(x, y)` tinted with an `r, g, b` string. */
  flash(x: number, y: number, rgb: string): void;
}

/**
 * Renders nothing on its own — exposes an imperative `flash()` so the physics
 * loop can spawn impact rings without re-rendering the React tree. Each ring is
 * a bare DOM node animated by GSAP, then removed on completion.
 */
export const CollisionLayer = forwardRef<CollisionApi>((_props, ref) => {
  const layerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      flash(x, y, rgb) {
        const layer = layerRef.current;
        if (!layer) return;
        const ring = document.createElement('div');
        ring.className = 'collision-ring';
        ring.style.left = `${x}px`;
        ring.style.top = `${y}px`;
        ring.style.setProperty('--ring-rgb', rgb);
        layer.appendChild(ring);
        gsap.fromTo(
          ring,
          { scale: 0, opacity: 0.85 },
          {
            scale: 1,
            opacity: 0,
            duration: 0.55,
            ease: 'power2.out',
            onComplete: () => ring.remove(),
          },
        );
      },
    }),
    [],
  );

  return (
    <div
      ref={layerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-30"
    />
  );
});

CollisionLayer.displayName = 'CollisionLayer';
