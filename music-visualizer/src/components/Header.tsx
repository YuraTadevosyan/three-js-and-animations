import { AudioLines } from 'lucide-react';

import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/cn';

interface HeaderProps {
  route: string;
}

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm transition-colors',
        active
          ? 'bg-zinc-900/5 text-zinc-900 dark:bg-white/10 dark:text-white'
          : 'text-zinc-500 hover:text-zinc-900 dark:text-white/60 dark:hover:text-white',
      )}
    >
      {children}
    </a>
  );
}

export function Header({ route }: HeaderProps) {
  const isAbout = route === '#/about';
  return (
    <header className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
      <a
        href="#/"
        className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-white/90"
      >
        <span className="grid size-7 place-items-center rounded-md border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <AudioLines className="size-4 text-violet-500 dark:text-violet-300" />
        </span>
        <span>
          music<span className="text-zinc-400 dark:text-white/40">/visualizer</span>
        </span>
      </a>
      <nav aria-label="Primary" className="flex items-center gap-1">
        <NavLink href="#/" active={!isAbout}>
          Visualizer
        </NavLink>
        <NavLink href="#/about" active={isAbout}>
          About
        </NavLink>
        <ThemeToggle />
      </nav>
    </header>
  );
}
