import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from '@/components/SplitText';
import { TROPHIES, TROPHIES_TOTAL, type Trophy } from '@/data/trophies';

// The Cabinet. A pinned section whose long scroll counts up every trophy
// from 0 → N and the grand total at the bottom. One ScrollTrigger drives the
// whole tween — each numeric span's textContent is rewritten in onUpdate, so
// the counters always agree with whatever the scrubbed progress is (no
// drift if the user scrolls fast or reverses).
export function Trophies() {
  const ref = useRef<HTMLElement | null>(null);
  const valuesRef = useRef<HTMLSpanElement[]>([]);
  const totalRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      // Pin for an extra 100% of scroll. Inside the pin window we run a
      // single scrubbed dummy tween whose onUpdate rewrites every counter.
      const state = { p: 0 };
      gsap.to(state, {
        p: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: '+=120%',
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          const p = state.p;
          // First 70% of the scroll counts up individual cells, the last
          // 30% reveals the grand total. Counter values use an
          // ease-in-out feel by running the linear progress through a
          // smoothstep curve so the digits roll fast in the middle.
          const smoothed = p * p * (3 - 2 * p);
          valuesRef.current.forEach((el, i) => {
            const trophy = TROPHIES[i];
            if (!trophy || !el) return;
            // Stagger each cell so they don't all count up at the same
            // time — the eye reads them like a tally being ticked off.
            const slot = i / TROPHIES.length;
            const local = gsap.utils.clamp(0, 1, (smoothed - slot * 0.4) / 0.6);
            el.textContent = String(Math.round(local * trophy.count));
          });
          if (totalRef.current) {
            // Grand total kicks in after individual counters are ~done.
            const totalLocal = gsap.utils.clamp(0, 1, (smoothed - 0.55) / 0.45);
            totalRef.current.textContent = String(
              Math.round(totalLocal * TROPHIES_TOTAL),
            );
          }
        },
      });

      gsap.fromTo(
        '[data-trophy-tile]',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.06,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
          },
        },
      );
    }, ref);
    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      ref={ref}
      className="chapter relative w-full h-screen overflow-hidden"
      data-chapter="4"
      aria-label="Trophy cabinet"
    >
      {/* Subtle blaugrana gradient backdrop so the section reads as its own
          beat rather than a continuation of the staff grid above. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 15% 20%, rgba(0,77,152,0.22) 0%, transparent 55%), radial-gradient(ellipse at 85% 80%, rgba(165,0,68,0.22) 0%, transparent 55%), linear-gradient(180deg, rgba(5,8,15,1) 0%, rgba(5,8,15,1) 100%)',
        }}
      />

      <div className="relative z-10 h-screen px-[6vw] py-[6vh] md:py-[8vh] flex flex-col">
        <div className="stripe max-w-[120px] mb-8" />
        <span className="eyebrow block mb-4">03 — The cabinet</span>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 flex-1 min-h-0">
          {/* Headline column. Always anchored to the top of the available
              flex space so the right-side tiles can breathe. */}
          <div className="lg:col-span-5 flex flex-col">
            <SplitText
              as="h2"
              splitBy="lines"
              stagger={0.1}
              duration={1.0}
              start="top 80%"
              className="display text-bone text-[clamp(2.8rem,7vw,7rem)] leading-[0.9]"
              text={`THE\nCABINET.`}
            />
            <p className="mt-8 max-w-md text-bone/70 leading-relaxed text-[1.02rem]">
              One hundred and twenty-six years. Seven competitions worth
              winning. The honours roll, counted up.
            </p>

            {/* Grand total — anchored at the bottom of the headline column
                so on tall screens it sits neatly under the description. */}
            <div className="mt-auto pt-10">
              <div className="caption mb-2 text-bone/55">Major honours</div>
              <div className="flex items-baseline gap-4">
                <span
                  ref={totalRef}
                  className="display text-bone"
                  style={{
                    fontSize: 'clamp(4rem, 9vw, 10rem)',
                    lineHeight: 0.85,
                    color: 'var(--gold)',
                  }}
                >
                  0
                </span>
                <span className="caption text-bone/55">trophies</span>
              </div>
            </div>
          </div>

          {/* Trophy tiles. A simple grid — domestic / european / global
              are colour-coded via the left accent bar on each tile. */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 self-center">
            {TROPHIES.map((t, i) => (
              <TrophyTile
                key={t.name}
                trophy={t}
                valueRef={(el) => {
                  if (el) valuesRef.current[i] = el;
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const TIER_COLOR: Record<Trophy['tier'], string> = {
  domestic: 'var(--gold)',
  european: 'var(--blue)',
  global: 'var(--red)',
};

const TIER_LABEL: Record<Trophy['tier'], string> = {
  domestic: 'Domestic',
  european: 'European',
  global: 'Global',
};

function TrophyTile({
  trophy,
  valueRef,
}: {
  trophy: Trophy;
  valueRef: (el: HTMLSpanElement | null) => void;
}) {
  return (
    <article
      data-trophy-tile
      className="relative bg-bone/[0.025] border border-bone/10 p-4 md:p-5 flex flex-col gap-3"
    >
      <span
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: TIER_COLOR[trophy.tier] }}
      />
      <div className="flex items-center justify-between caption">
        <span className="text-bone/55">{TIER_LABEL[trophy.tier]}</span>
        <span className="text-bone/35">since {trophy.since}</span>
      </div>
      <span
        ref={valueRef}
        className="display text-bone leading-none tabular-nums"
        style={{ fontSize: 'clamp(2.6rem, 5.4vw, 5.2rem)' }}
      >
        0
      </span>
      <span className="text-bone/85 text-[0.95rem] leading-snug">
        {trophy.name}
      </span>
    </article>
  );
}
