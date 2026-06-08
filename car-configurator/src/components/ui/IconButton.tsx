import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  active?: boolean;
}

/** Square glass icon button used across the toolbar, with an active glow state. */
export function IconButton({
  icon,
  label,
  active = false,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        'group relative grid h-11 w-11 place-items-center rounded-xl border transition-all duration-300',
        'border-white/10 text-white/70 hover:text-white hover:border-white/20',
        active
          ? 'border-neon/50 bg-neon/10 text-neon shadow-[0_0_22px_-4px_rgba(61,215,255,0.65)]'
          : 'bg-white/[0.03] hover:bg-white/[0.06]',
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
}
