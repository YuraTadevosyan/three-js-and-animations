'use client';

import { createElement, useRef, type ElementType } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useScene } from '@/store/useScene';
import { cn } from '@/lib/cn';

type RevealTextProps = {
  text: string;
  as?: ElementType;
  /** Split granularity for the reveal stagger. */
  splitBy?: 'word' | 'char';
  className?: string;
  delay?: number;
  stagger?: number;
  /** Play immediately on mount instead of waiting for scroll (hero use). */
  immediate?: boolean;
};

/**
 * Masked text reveal: each word/char rises out of an overflow-hidden mask with
 * a stagger. Plays when scrolled into view, or immediately for the hero.
 * Respects prefers-reduced-motion by rendering the final state instantly.
 */
export function RevealText({
  text,
  as = 'div',
  splitBy = 'word',
  className,
  delay = 0,
  stagger = 0.045,
  immediate = false,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);

  const tokens =
    splitBy === 'char' ? Array.from(text) : text.split(/(\s+)/);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!targets.length) return;

    if (useScene.getState().reducedMotion) {
      gsap.set(targets, { yPercent: 0, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(targets, { yPercent: 115, opacity: 0 });
      gsap.to(targets, {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'expo.out',
        stagger,
        delay,
        scrollTrigger: immediate
          ? undefined
          : { trigger: el, start: 'top 85%', once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [text, immediate, delay, stagger]);

  return createElement(
    as,
    { ref, className: cn('inline-block', className) },
    // Full text for screen readers; the animated spans below are aria-hidden.
    <span key="sr" className="sr-only">
      {text}
    </span>,
    tokens.map((tok, i) =>
      /\s+/.test(tok) && splitBy === 'word' ? (
        <span key={i}> </span>
      ) : (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          aria-hidden="true"
        >
          <span data-reveal className="inline-block will-change-transform">
            {tok === ' ' ? ' ' : tok}
          </span>
        </span>
      ),
    ),
  );
}
