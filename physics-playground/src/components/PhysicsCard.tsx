import { memo, useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ACCENTS, type CardDef, type IconName } from '@/lib/cards';
import { cn } from '@/lib/cn';

interface PhysicsCardProps {
  def: CardDef;
  /** Layout scale — drives the root font size so content scales with the body. */
  scale: number;
  /** Registers the outer element with the physics sync loop. */
  registerEl: (id: string, el: HTMLElement | null) => void;
  /** Only meaningful for the gravity toggle card — mirrors the live setting. */
  toggleOn?: boolean;
}

const ICON_PATHS: Record<IconName, ReactNode> = {
  cursor: <path d="M5 3l14 7-6 2-2 6z" />,
  bolt: <path d="M13 2L4 14h6l-1 8 9-12h-6z" />,
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5z" />
      <path d="M4 13l8 4.5L20 13" fill="none" stroke="currentColor" strokeWidth="2" />
    </>
  ),
};

/** Small accent dot used across the card variants. */
function Dot({ hex }: { hex: string }) {
  return (
    <span
      className="block h-[0.5em] w-[0.5em] shrink-0 rounded-full"
      style={{ background: hex, boxShadow: `0 0 0.5em ${hex}` }}
    />
  );
}

function CardContent({ def, toggleOn }: { def: CardDef; toggleOn?: boolean }) {
  const accent = ACCENTS[def.accent];

  switch (def.kind) {
    case 'feature':
      return (
        <div className="flex h-full flex-col justify-between p-[1.1em]">
          <div className="flex items-center gap-[0.5em]">
            <Dot hex={accent.hex} />
            <span className="font-mono text-[0.6em] uppercase tracking-[0.2em] text-ink-400">
              card
            </span>
          </div>
          <div>
            <h3 className="text-[1.04em] font-semibold leading-tight text-ink-100">
              {def.title}
            </h3>
            <p className="mt-[0.4em] text-[0.74em] leading-snug text-ink-400">
              {def.body}
            </p>
          </div>
        </div>
      );

    case 'stat':
      return (
        <div className="grid h-full place-items-center text-center">
          <div>
            <div
              className="text-[2.7em] font-bold leading-none"
              style={{ color: accent.hex }}
            >
              {def.title}
            </div>
            <div className="mt-[0.5em] text-[0.6em] uppercase tracking-[0.16em] text-ink-400">
              {def.body}
            </div>
          </div>
        </div>
      );

    case 'pill':
      return (
        <div className="flex h-full items-center justify-center gap-[0.55em] px-[0.9em]">
          <Dot hex={accent.hex} />
          <span className="whitespace-nowrap text-[0.86em] font-medium text-ink-100">
            {def.title}
          </span>
        </div>
      );

    case 'icon':
      return (
        <div className="grid h-full place-items-center" style={{ color: accent.hex }}>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{
              width: '2em',
              height: '2em',
              filter: `drop-shadow(0 0 0.4em ${accent.hex})`,
            }}
          >
            {def.icon && ICON_PATHS[def.icon]}
          </svg>
        </div>
      );

    case 'toggle':
      return (
        <div className="flex h-full items-center justify-between gap-[0.6em] px-[1em]">
          <span className="text-[0.82em] font-medium text-ink-200">
            {def.title}
          </span>
          <span
            className="relative block h-[1.2em] w-[2.2em] rounded-full transition-colors duration-300"
            style={{
              background: toggleOn ? accent.hex : 'rgba(255,255,255,0.14)',
            }}
          >
            <span
              className="absolute left-[0.15em] top-[0.15em] block h-[0.9em] w-[0.9em] rounded-full bg-white transition-transform duration-300"
              style={{
                transform: toggleOn ? 'translateX(1em)' : 'translateX(0)',
              }}
            />
          </span>
        </div>
      );
  }
}

function PhysicsCardImpl({ def, scale, registerEl, toggleOn }: PhysicsCardProps) {
  const faceRef = useRef<HTMLDivElement>(null);
  const accent = ACCENTS[def.accent];

  // Elastic hover — a springy GSAP pop on the visual face. Skipped on touch,
  // where there is no hover state to enter or leave.
  useEffect(() => {
    const face = faceRef.current;
    if (!face) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const enter = () =>
      gsap.to(face, { scale: 1.08, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    const leave = () =>
      gsap.to(face, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' });

    face.addEventListener('pointerenter', enter);
    face.addEventListener('pointerleave', leave);
    return () => {
      face.removeEventListener('pointerenter', enter);
      face.removeEventListener('pointerleave', leave);
      gsap.killTweensOf(face);
    };
  }, []);

  const rounded = def.kind === 'pill' ? '9999px' : '1.1em';

  return (
    <div
      className="physics-body"
      ref={(el) => registerEl(def.id, el)}
      style={{ width: def.w, height: def.h }}
    >
      <div
        ref={faceRef}
        data-cursor="card"
        className={cn('card-face h-full w-full overflow-hidden border')}
        style={{
          fontSize: `${15 * scale}px`,
          borderRadius: rounded,
          borderColor: `rgba(${accent.rgb}, 0.3)`,
          background: `linear-gradient(155deg, rgba(${accent.rgb}, 0.16), rgba(17, 20, 31, 0.94) 62%)`,
          boxShadow: `0 12px 30px -14px rgba(0,0,0,0.7), inset 0 1px 0 0 rgba(255,255,255,0.05)`,
          // Consumed by the .is-dragging shadow rule in index.css.
          ['--accent-rgb' as string]: accent.rgb,
        }}
      >
        <CardContent def={def} toggleOn={toggleOn} />
      </div>
    </div>
  );
}

export const PhysicsCard = memo(PhysicsCardImpl);
