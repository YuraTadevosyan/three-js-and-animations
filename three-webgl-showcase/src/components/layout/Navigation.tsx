import { Link } from '@tanstack/react-router';

const links = [
  { to: '/examples', label: 'Examples' },
  { to: '/about', label: 'About' },
] as const;

export function Navigation() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        aria-label="Primary"
        className="container flex h-14 items-center justify-between"
      >
        <Link to="/" className="font-semibold tracking-tight">
          three<span className="text-muted-foreground">/webgl</span>
        </Link>
        <ul className="flex items-center gap-1 text-sm">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: 'text-foreground bg-accent' }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
