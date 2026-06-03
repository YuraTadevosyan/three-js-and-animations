import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from '@/components/SplitText';
import { MASIA } from '@/data/masia';
import { SQUAD } from '@/data/squad';

// La Masia. A typographic grid of the academy graduates currently in the
// first team. Reuses the same staff-card visual pattern with the player
// photos pulled from SQUAD by name — no new images, no fetch.
export function Masia() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-masia-card]',
        { y: 70, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: { trigger: ref.current, start: 'top 75%' },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="chapter relative px-[6vw] py-[18vh]"
      data-chapter="5"
      aria-label="La Masia"
    >
      {/* Subtle wash so the section reads as its own breath between Staff
          and Trophies. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 80% 20%, rgba(237,187,0,0.12) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(0,77,152,0.15) 0%, transparent 55%)',
        }}
      />
      <div className="relative z-10 max-w-6xl mb-16">
        <div className="stripe max-w-[120px] mb-10" />
        <span className="eyebrow block mb-6">04 — La Masia</span>
        <SplitText
          as="h2"
          splitBy="lines"
          stagger={0.1}
          duration={1.0}
          start="top 80%"
          className="display text-bone text-[clamp(2.8rem,7vw,7rem)] leading-[0.92]"
          text={`MADE\nIN-HOUSE.`}
        />
        <p className="mt-8 max-w-xl text-bone/70 leading-relaxed text-[1.05rem]">
          Six of the players you just met came up through the academy on the
          edge of Sant Joan Despí. The pipeline isn't a marketing line — it's
          half the starting eleven.
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {MASIA.map((m) => {
          const p = SQUAD.find((s) => s.name === m.name);
          return (
            <article
              key={m.name}
              data-masia-card
              className="staff-card group relative overflow-hidden aspect-[3/4]"
            >
              {p && (
                <div
                  className="absolute inset-0 bg-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${p.image})`,
                    backgroundPosition: 'center top',
                    filter: 'saturate(0.95) contrast(1.05)',
                  }}
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 30%, rgba(5,8,15,0.94) 100%), linear-gradient(180deg, rgba(237,187,0,0.16) 0%, transparent 30%)',
                }}
              />

              {/* Debut year, big, top-right corner. */}
              <div
                className="absolute top-4 right-4 display leading-none text-[var(--gold)]"
                style={{ fontSize: 'clamp(1.6rem, 2.4vw, 2.4rem)' }}
              >
                ’{String(m.debut).slice(-2)}
              </div>

              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <div className="caption mb-2 text-[var(--gold)]">
                  Senior debut · {m.debut}
                </div>
                <h3 className="display text-bone text-[1.5rem] leading-[0.95]">
                  {p?.name ?? m.name}
                </h3>
                {p && (
                  <div className="caption mt-2 text-bone/55">
                    #{p.number} · {p.role}
                  </div>
                )}
                <p className="mt-3 text-bone/75 text-[0.85rem] leading-snug">
                  {m.note}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
