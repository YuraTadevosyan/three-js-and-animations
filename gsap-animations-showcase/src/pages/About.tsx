import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const stack = [
  {
    name: 'React 19',
    description: 'Component model with strict-mode safe effects.',
  },
  {
    name: 'Vite',
    description: 'Lightning-fast dev server, ESM build, code splitting.',
  },
  {
    name: 'Tailwind CSS',
    description: 'Utility-first styling with custom shadcn theme tokens.',
  },
  {
    name: 'shadcn UI',
    description: 'Composable, accessible primitives styled by Tailwind.',
  },
  {
    name: 'GSAP + @gsap/react',
    description:
      'Battle-tested animation engine with the official React hook for safe cleanup.',
  },
  {
    name: 'React Router',
    description:
      'Client-side routing with lazy-loaded animation pages for low TTI.',
  },
]

const perfPrinciples = [
  'Animate transforms and opacity only — GPU-friendly, no layout thrash.',
  'Lazy load every animation page so the initial JS bundle stays small.',
  'Respect prefers-reduced-motion in every example.',
  'Use useGSAP for automatic cleanup on unmount and React Strict Mode.',
  'Manual chunk splitting for GSAP and React for long-term caching.',
  'Preconnect and preload fonts; serve scalable SVG art.',
]

export default function About() {
  return (
    <div className="container max-w-3xl py-8 sm:py-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About</h1>
      <p className="mt-3 text-muted-foreground">
        This project is a learning playground and reference for building rich
        motion in production React apps. Every example is small, focused, and
        meant to be copied as a starting point.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Stack</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {stack.map((s) => (
          <li key={s.name} className="rounded-lg border bg-card p-4">
            <h3 className="font-medium">{s.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {s.description}
            </p>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-semibold">Performance principles</h2>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {perfPrinciples.map((p) => (
          <li key={p} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {p}
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <Link
          to="/animations"
          className={cn(buttonVariants({ size: 'lg' }))}
        >
          See animations
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
