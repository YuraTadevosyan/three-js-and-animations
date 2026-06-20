'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  /** Accent colour of the glow + corner ticks. */
  accent?: 'cyan' | 'magenta' | 'violet' | 'amber';
  /** Render the clipped-corner HUD frame. */
  framed?: boolean;
};

const ACCENT: Record<NonNullable<GlassCardProps['accent']>, string> = {
  cyan: 'before:bg-neon-cyan/60 text-neon-cyan',
  magenta: 'before:bg-neon-magenta/60 text-neon-magenta',
  violet: 'before:bg-neon-violet/60 text-neon-violet',
  amber: 'before:bg-neon-amber/60 text-neon-amber',
};

/**
 * The core glassmorphism surface: blurred translucent panel, hairline border,
 * inner highlight and a thin accent bar down the left edge. Reused everywhere.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, accent = 'cyan', framed = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'group relative overflow-hidden rounded-xl p-6',
          'border border-white/10 bg-white/[0.035] shadow-glass backdrop-blur-xl',
          'before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:content-[""]',
          framed && 'cyber-corners',
          ACCENT[accent],
          className,
        )}
        {...props}
      >
        <div className="text-inherit/100 relative z-[1] text-white">{children}</div>
      </div>
    );
  },
);

GlassCard.displayName = 'GlassCard';
