import { ExternalLink, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-3 py-6 text-sm text-muted-foreground sm:flex-row">
        <p className="flex items-center gap-1.5">
          Built with <Heart className="h-3.5 w-3.5 text-primary" /> using React,
          Tailwind CSS, shadcn UI & GSAP.
        </p>
        <a
          href="https://gsap.com/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          gsap.com
        </a>
      </div>
    </footer>
  )
}
