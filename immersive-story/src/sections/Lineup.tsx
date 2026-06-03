import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { SplitText } from '@/components/SplitText';
import { LINEUP, resolvePlayer, type Slot } from '@/data/lineup';

// The starting XI plotted on a half-pitch SVG. Dots animate in with stagger
// as the section scrolls into view; tapping (or hovering on desktop) a dot
// pops a small card with the player's name, number and role. Pure SVG — no
// pin, no scrub. The section is meant to be a quick formation reference
// between the squad carousel and the staff grid, not another long beat.
export function Lineup() {
  const ref = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-pitch-line]',
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          duration: 1.4,
          ease: 'power2.out',
          stagger: 0.04,
          scrollTrigger: { trigger: ref.current, start: 'top 75%' },
        },
      );
      gsap.fromTo(
        '[data-lineup-dot]',
        { scale: 0, opacity: 0, transformOrigin: 'center center' },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'back.out(1.6)',
          stagger: 0.06,
          scrollTrigger: { trigger: ref.current, start: 'top 70%' },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="chapter relative px-[6vw] py-[16vh]"
      data-chapter="3"
      aria-label="Starting eleven"
    >
      <div className="max-w-6xl mb-12">
        <div className="stripe max-w-[120px] mb-10" />
        <span className="eyebrow block mb-6">02 — The shape</span>
        <SplitText
          as="h2"
          splitBy="lines"
          stagger={0.1}
          duration={1.0}
          start="top 80%"
          className="display text-bone text-[clamp(2.8rem,7vw,7rem)] leading-[0.92]"
          text={`FOUR — THREE — THREE.`}
        />
        <p className="mt-8 max-w-xl text-bone/70 leading-relaxed text-[1.05rem]">
          The shape the manager keeps coming back to. Tap a dot to see the
          name behind the position.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Pitch column — the SVG draws the lines and dots at a fixed 100×100
            coord space then scales to whatever the container gives it. */}
        <div className="lg:col-span-8 relative w-full" onPointerLeave={() => setActive(null)}>
          <svg
            viewBox="0 0 100 100"
            className="w-full h-auto block"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="4-3-3 formation diagram"
          >
            {/* Pitch background. A solid pitch-green sits behind so the
                white markings read crisp regardless of section bg. */}
            <rect x="0" y="0" width="100" height="100" fill="#0e3a1c" rx="0.5" />
            <rect x="0" y="0" width="100" height="100" fill="url(#turf)" opacity="0.5" />
            <defs>
              <pattern id="turf" x="0" y="0" width="100" height="10" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="100" height="5" fill="#0e3a1c" />
                <rect x="0" y="5" width="100" height="5" fill="#10421f" />
              </pattern>
            </defs>

            {/* Markings — outer line, halfway line, centre circle, two
                boxes. data-pitch-line lets the GSAP stroke-draw target
                find them. */}
            <g
              fill="none"
              stroke="rgba(243,240,230,0.7)"
              strokeWidth="0.3"
              strokeLinecap="square"
            >
              <rect data-pitch-line x="2" y="2" width="96" height="96" pathLength="1" className="svg-line" />
              <line data-pitch-line x1="2" y1="50" x2="98" y2="50" pathLength="1" className="svg-line" />
              <circle data-pitch-line cx="50" cy="50" r="9" pathLength="1" className="svg-line" />
              <circle cx="50" cy="50" r="0.6" fill="rgba(243,240,230,0.7)" />
              {/* Penalty area (top — attacking goal). */}
              <rect data-pitch-line x="25" y="2" width="50" height="14" pathLength="1" className="svg-line" />
              <rect data-pitch-line x="38" y="2" width="24" height="6" pathLength="1" className="svg-line" />
              {/* Penalty area (bottom — GK end). */}
              <rect data-pitch-line x="25" y="84" width="50" height="14" pathLength="1" className="svg-line" />
              <rect data-pitch-line x="38" y="92" width="24" height="6" pathLength="1" className="svg-line" />
            </g>

            {/* Dots. Each is a small circle + the position label centred on it.
                On hover/tap we lift the dot and stroke it gold. */}
            {LINEUP.map((slot, i) => (
              <PitchDot
                key={slot.role}
                slot={slot}
                active={active === i}
                onActivate={() => setActive(i)}
              />
            ))}
          </svg>
        </div>

        {/* Side panel — the active dot's player card. When nothing is
            selected we show the formation summary. */}
        <div className="lg:col-span-4">
          <LineupCard slotIndex={active} />
        </div>
      </div>
    </section>
  );
}

function PitchDot({
  slot,
  active,
  onActivate,
}: {
  slot: Slot;
  active: boolean;
  onActivate: () => void;
}) {
  return (
    <g
      data-lineup-dot
      onPointerEnter={onActivate}
      onClick={onActivate}
      style={{ cursor: 'pointer' }}
    >
      <circle
        cx={slot.x}
        cy={slot.y}
        r={active ? 4.2 : 3.4}
        fill={active ? 'var(--gold)' : 'rgba(243,240,230,0.92)'}
        stroke={active ? 'rgba(243,240,230,0.95)' : 'rgba(5,8,15,0.6)'}
        strokeWidth="0.4"
      />
      <text
        x={slot.x}
        y={slot.y + 0.9}
        textAnchor="middle"
        fontSize="2.2"
        fontFamily="'JetBrains Mono', monospace"
        fontWeight="700"
        fill={active ? 'var(--ink)' : 'var(--ink)'}
        style={{ pointerEvents: 'none', letterSpacing: '0.05em' }}
      >
        {slot.label}
      </text>
      {/* Player number floating just below each dot — gives a glanceable
          read of the shape without needing hover. */}
      <text
        x={slot.x}
        y={slot.y + 6.5}
        textAnchor="middle"
        fontSize="2"
        fontFamily="'JetBrains Mono', monospace"
        fill="rgba(243,240,230,0.7)"
        style={{ pointerEvents: 'none', letterSpacing: '0.08em' }}
      >
        {(() => {
          const p = resolvePlayer(slot.name);
          return p ? String(p.number).padStart(2, '0') : '—';
        })()}
      </text>
      <title>{slot.name}</title>
    </g>
  );
}

function LineupCard({ slotIndex }: { slotIndex: number | null }) {
  if (slotIndex == null) {
    return (
      <div className="border border-bone/10 bg-bone/[0.025] p-6">
        <div className="caption mb-3 text-bone/55">Formation</div>
        <div className="display text-bone text-[2rem] leading-[1] mb-3">4 — 3 — 3</div>
        <p className="text-bone/70 text-[0.95rem] leading-relaxed">
          Goalkeeper plus a four-man back line. A pivot ahead of them. Two
          interiors hunting half-spaces. Three forwards stretching the field.
        </p>
        <div className="caption mt-5 text-bone/40">Hover or tap a dot</div>
      </div>
    );
  }
  const slot = LINEUP[slotIndex];
  const player = resolvePlayer(slot.name);
  return (
    <div className="border border-bone/10 bg-bone/[0.025] p-0 overflow-hidden">
      {player && (
        <div
          className="w-full aspect-[4/3] bg-cover"
          style={{ backgroundImage: `url(${player.image})`, backgroundPosition: 'center top' }}
        />
      )}
      <div className="p-6">
        <div className="caption mb-2 text-[var(--gold)]">
          {slot.role} · #{player?.number ?? '—'}
        </div>
        <div className="display text-bone text-[1.6rem] leading-[1] mb-2">
          {player?.name ?? slot.name}
        </div>
        <div className="caption text-bone/55">{player?.role ?? '—'} · {player?.nat ?? '—'}</div>
        {player?.bio && (
          <p className="mt-4 text-bone/70 text-[0.9rem] leading-snug line-clamp-4">
            {player.bio}
          </p>
        )}
      </div>
    </div>
  );
}
