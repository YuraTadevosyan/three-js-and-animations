'use client';

import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type NeonButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: 'solid' | 'ghost';
};

/**
 * Clipped-corner neon CTA. Renders as an anchor so it works for both in-page
 * jumps and external links without extra wiring.
 */
export const NeonButton = forwardRef<HTMLAnchorElement, NeonButtonProps>(
  ({ className, variant = 'solid', children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          'group relative inline-flex items-center gap-2 px-6 py-3',
          'font-mono text-sm uppercase tracking-[0.2em] transition-all duration-300',
          'clip-corner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan',
          variant === 'solid'
            ? 'bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 hover:shadow-neon'
            : 'border border-white/15 text-white/80 hover:border-neon-cyan/60 hover:text-neon-cyan',
          className,
        )}
        {...props}
      >
        <span className="relative z-[1]">{children}</span>
      </a>
    );
  },
);

NeonButton.displayName = 'NeonButton';
