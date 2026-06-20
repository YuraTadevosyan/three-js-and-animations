'use client';

import { RevealText } from './RevealText';
import { cn } from '@/lib/cn';

/**
 * Consistent section header: a monospace "// index — label" kicker over a
 * large revealed title. Keeps every section visually in the same system.
 */
export function SectionHeading({
  index,
  kicker,
  title,
  className,
}: {
  index: string;
  kicker: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-10', className)}>
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-neon-cyan/80">
        <span className="text-white/40">{index}</span> // {kicker}
      </p>
      <RevealText
        as="h2"
        text={title}
        className="font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl md:text-6xl"
      />
    </div>
  );
}
