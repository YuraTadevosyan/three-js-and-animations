'use client';

import { useRef, type ReactNode } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useScene } from '@/store/useScene';
import { cn } from '@/lib/cn';

/**
 * Generic fade/slide-in-on-scroll wrapper. Children animate once when they
 * reach the lower third of the viewport. Direct children are staggered, so it
 * works equally well for a single block or a grid of cards.
 */
export function Reveal({
  children,
  className,
  y = 28,
  stagger = 0.08,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  stagger?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.children.length > 1 ? el.children : [el];

    if (useScene.getState().reducedMotion) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from(items, {
        opacity: 0,
        y,
        duration: 0.8,
        ease: 'power3.out',
        stagger,
        delay,
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [y, stagger, delay]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
