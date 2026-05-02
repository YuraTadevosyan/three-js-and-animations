import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, Moon, Sun, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/animations', label: 'Animations' },
  { to: '/about', label: 'About' },
]

export function Navbar() {
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setOpen(false)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">GSAP Showcase</span>
          <span className="sm:hidden">GSAP</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-foreground bg-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="container flex flex-col gap-1 border-t border-border/60 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-foreground bg-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
