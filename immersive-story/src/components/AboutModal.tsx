import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { pageScroll } from '@/hooks/useSmoothScroll';

// Tech stack used to build the scroll story. Grouped by role so the modal
// reads as a short tour of "what each library is doing in here" rather than
// a flat dependency dump.
const STACK = [
  {
    group: 'Framework',
    items: [
      {
        name: 'React 18',
        url: 'https://react.dev',
        note: 'Component tree, hooks for animation lifecycle.',
      },
      {
        name: 'TypeScript',
        url: 'https://www.typescriptlang.org',
        note: 'Squad + staff data is fully typed end-to-end.',
      },
      {
        name: 'Vite 5',
        url: 'https://vitejs.dev',
        note: 'Dev server, build, asset hashing. Code-split into 3 chunks.',
      },
    ],
  },
  {
    group: 'Motion',
    items: [
      {
        name: 'GSAP',
        url: 'https://gsap.com',
        note: 'All tweens, the master timeline driving the squad carousel.',
      },
      {
        name: 'ScrollTrigger',
        url: 'https://gsap.com/docs/v3/Plugins/ScrollTrigger/',
        note:
          'Pinning, scrub, parallax. One pin per scene; the squad uses a single scrubbed timeline that crossfades all 23 players in place.',
      },
      {
        name: 'Lenis',
        url: 'https://github.com/darkroomengineering/lenis',
        note: 'Smooth scroll. Hooked into GSAP\'s ticker so pinned sections stay aligned with the inertial scroll position.',
      },
    ],
  },
  {
    group: 'Styling',
    items: [
      {
        name: 'Tailwind CSS',
        url: 'https://tailwindcss.com',
        note: 'Layout + utility classes. Custom palette for the blaugrana colours.',
      },
      {
        name: 'PostCSS + Autoprefixer',
        url: 'https://postcss.org',
        note: 'Vendor prefixes for backdrop-filter, mix-blend-mode.',
      },
      {
        name: 'Archivo Black / Inter / JetBrains Mono',
        url: 'https://fonts.google.com',
        note: 'Bold display, body, and broadcast-style mono. Loaded from Google Fonts.',
      },
    ],
  },
  {
    group: 'Data + Imagery',
    items: [
      {
        name: 'Wikipedia REST API',
        url: 'https://en.wikipedia.org/api/rest_v1/',
        note:
          'Squad roster + manager pulled from the 2025-26 FC Barcelona season article. Per-player bios are the page-summary extracts.',
      },
      {
        name: 'Wikimedia Commons API',
        url: 'https://commons.wikimedia.org/wiki/Commons:API',
        note:
          'Every photo is a CC-licensed thumbnail downloaded from Commons. Artist + license metadata stored alongside each player.',
      },
    ],
  },
];

const TECHNIQUES = [
  {
    title: 'Single GSAP timeline carousel',
    body:
      'The squad section pins for ~11 viewport-heights and a master scrub-driven timeline alternates dwell → crossfade for all 23 players in place.',
  },
  {
    title: 'ScrollTrigger × Lenis bridge',
    body:
      'Lenis emits its own scroll position; we forward each tick to ScrollTrigger.update() and run Lenis\'s RAF off GSAP\'s ticker so they share one update loop.',
  },
  {
    title: 'No 3D, no canvas',
    body:
      'Original drafts used three.js + a procedural Camp Nou; final cut is all-DOM with real photos. Bundle is ~310 KB JS + CSS.',
  },
  {
    title: 'Procedural pitch lines (early draft)',
    body:
      'The pre-photo prototype drew the pitch markings into a 1024×1600 canvas texture and applied it to a single PlaneGeometry — kept as a fallback in git history.',
  },
];

export function AboutModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  // Animate open/close with GSAP so the entrance matches the rest of the
  // site. We rely on display:none/block via React rendering and only show
  // the markup when open, but still animate to give it weight.
  useEffect(() => {
    if (!open) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        overlayRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.35, ease: 'power2.out' },
      );
      gsap.fromTo(
        sheetRef.current,
        { y: 60, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.out' },
      );
    });
    return () => ctx.revert();
  }, [open]);

  // Esc to close + pause the smooth-scroll engine while the modal is open
  // so wheel/touch events inside the modal don't drift the page beneath.
  // Setting body.overflow:hidden alone isn't enough: Lenis translates the
  // body manually, so we have to call lenis.stop() explicitly.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    pageScroll.stop();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      pageScroll.start();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="About — Technologies"
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center"
      style={{ background: 'rgba(5,8,15,0.78)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={sheetRef}
        // data-lenis-prevent tells the smooth-scroll engine not to hijack
        // wheel/touch events inside this element, so the modal scrolls
        // natively while the page underneath stays frozen.
        data-lenis-prevent
        className="relative w-full max-w-4xl max-h-[92vh] md:max-h-[88vh] overflow-y-auto overscroll-contain bg-ink/95 border border-bone/15 mx-0 md:mx-6"
        style={{
          boxShadow: '0 -30px 120px -10px rgba(0,0,0,0.6)',
        }}
      >
        <header className="sticky top-0 z-10 bg-ink/95 backdrop-blur-sm flex items-start justify-between gap-6 px-6 md:px-10 py-5 md:py-7 border-b border-bone/10">
          <div>
            <div className="eyebrow text-bone/60 mb-2">About — Technologies</div>
            <h2 className="display text-bone text-[clamp(1.6rem,3vw,2.4rem)] leading-[0.95]">
              HOW THIS IS BUILT.
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 mt-1 inline-flex items-center justify-center w-9 h-9 rounded-full border border-bone/30 hover:border-bone hover:bg-bone/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </header>

        <div className="px-6 md:px-10 py-6 md:py-8">
          <p className="text-bone/75 leading-relaxed max-w-2xl text-[0.98rem]">
            A scroll-driven matchday story at Camp Nou. Single page, no router,
            no 3D — built on top of a smooth-scroll engine with a GSAP
            timeline per scene. Every photo is sourced from Wikimedia Commons
            under a Creative Commons licence; the squad roster, captain badges
            and bios are pulled from Wikipedia.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {STACK.map((group) => (
              <section key={group.group}>
                <div className="caption text-[var(--gold)] mb-4">{group.group}</div>
                <ul className="space-y-4">
                  {group.items.map((it) => (
                    <li key={it.name}>
                      <a
                        href={it.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="display text-bone hover:text-[var(--gold)] transition-colors text-[1.05rem] tracking-tight"
                      >
                        {it.name} ↗
                      </a>
                      <p className="mt-1 text-bone/65 text-[0.9rem] leading-relaxed">
                        {it.note}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <hr className="my-10 border-bone/10" />

          <div>
            <div className="caption text-[var(--gold)] mb-5">Notable techniques</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TECHNIQUES.map((t) => (
                <div key={t.title} className="stat">
                  <div className="text-bone display text-[0.9rem] tracking-tight leading-tight">
                    {t.title}
                  </div>
                  <div className="text-bone/65 text-[0.85rem] leading-relaxed mt-2">
                    {t.body}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="my-10 border-bone/10" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-bone/80">
            <div className="stat">
              <div className="stat__value">~310 KB</div>
              <div className="stat__label">JS + CSS</div>
            </div>
            <div className="stat">
              <div className="stat__value">23</div>
              <div className="stat__label">Player cards</div>
            </div>
            <div className="stat">
              <div className="stat__value">1</div>
              <div className="stat__label">Page · no router</div>
            </div>
            <div className="stat">
              <div className="stat__value">100%</div>
              <div className="stat__label">CC-licensed photos</div>
            </div>
          </div>

          <footer className="mt-10 flex items-center justify-between gap-4 text-bone/55 text-[0.78rem]">
            <span className="caption">Press Esc · or click outside to close</span>
            <a
              className="underline hover:text-bone"
              href="https://github.com/YuraTadevosyan/three-js-and-animations/tree/main/immersive-story"
              target="_blank"
              rel="noopener noreferrer"
            >
              View source ↗
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}
