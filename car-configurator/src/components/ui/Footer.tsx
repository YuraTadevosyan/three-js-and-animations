import { Github } from 'lucide-react';

export function Footer() {
  return (
    <div
      data-ui-enter="footer"
      className="pointer-events-auto flex items-center gap-3 text-[11px] text-white/35"
    >
      <span className="hidden font-mono uppercase tracking-[0.2em] sm:inline">
        R3F · drei · GSAP
      </span>
      <a
        href="https://github.com/YuraTadevosyan/three-js-and-animations"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 transition-colors hover:text-white"
      >
        <Github size={13} />
        Source
      </a>
    </div>
  );
}
