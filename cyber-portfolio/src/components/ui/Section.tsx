'use client';

import { useRef, type ReactNode } from 'react';
import { ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useScene, type SectionId } from '@/store/useScene';
import { cn } from '@/lib/cn';

type SectionProps = {
  id: SectionId;
  children: ReactNode;
  className?: string;
  /** Tailwind for vertical/horizontal alignment of the inner container. */
  align?: 'center' | 'start' | 'end';
};

/**
 * A full-viewport section that reports itself as active to the scene store
 * whenever it crosses the middle of the screen. That single signal drives the
 * camera rig, the navbar highlight and any section-reactive 3D behaviour.
 */
export function Section({ id, children, className, align = 'center' }: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const setActive = useScene((s) => s.setActive);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => self.isActive && setActive(id),
    });
    return () => st.kill();
  }, [id, setActive]);

  return (
    <section
      ref={ref}
      id={id}
      data-section={id}
      className={cn(
        'relative flex min-h-[100svh] w-full flex-col px-6 py-24 md:px-12 lg:px-20',
        align === 'center' && 'justify-center',
        align === 'start' && 'justify-start',
        align === 'end' && 'justify-end',
        className,
      )}
    >
      {children}
    </section>
  );
}
