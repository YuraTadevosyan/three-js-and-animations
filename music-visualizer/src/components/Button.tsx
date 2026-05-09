import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-violet-500 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-violet-400',
  secondary:
    'border border-zinc-900/10 bg-zinc-900/5 text-zinc-900 backdrop-blur hover:bg-zinc-900/10 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15',
  ghost:
    'text-zinc-700 hover:bg-zinc-900/5 hover:text-zinc-900 dark:text-white/80 dark:hover:bg-white/5 dark:hover:text-white',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 rounded-md px-3 text-sm',
  md: 'h-10 rounded-md px-4 text-sm',
  icon: 'size-10 rounded-full',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#05030d]',
        'disabled:pointer-events-none disabled:opacity-50',
        '[&_svg]:size-4 [&_svg]:shrink-0',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
