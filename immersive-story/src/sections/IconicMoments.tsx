import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOMENTS, type Moment } from '@/data/moments';

// Horizontal-scroll timeline of iconic Barça nights. The section is pinned
// while a track of N viewport-wide panels translates leftward in lockstep
// with the user's vertical scroll. Built on the same scrub+pin primitive as
// the Squad carousel — only the track moves; the surrounding chrome (eyebrow,
// dot rail, counter) stays put.
export function IconicMoments() {
  const ref = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const dotsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current || !trackRef.current) return;
    const ctx = gsap.context(() => {
      const N = MOMENTS.length;

      gsap.to(trackRef.current, {
        // Move the track left by (N-1) panel-widths. xPercent is relative
        // to the track's own width, so -(100 * (N-1) / N) lands the last
        // panel exactly in the viewport at progress = 1.
        xPercent: -100 * ((N - 1) / N),
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: () => `+=${(N - 1) * window.innerWidth}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(N - 1, Math.round(self.progress * (N - 1)));
            if (counterRef.current) {
              counterRef.current.textContent =
                String(idx + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
            }
            if (dotsRef.current) {
              const dots = dotsRef.current.children;
              for (let i = 0; i < dots.length; i++) {
                (dots[i] as HTMLElement).dataset.active = String(i === idx);
              }
            }
          },
        },
      });
    }, ref);
    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      ref={ref}
      className="chapter relative w-screen h-screen overflow-hidden"
      data-chapter="8"
      aria-label="Iconic moments"
    >
      {/* Background wash so the panels read as a single dark stage. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(5,8,15,1) 0%, rgba(10,14,28,1) 100%), radial-gradient(ellipse at 20% 80%, rgba(0,77,152,0.18) 0%, transparent 55%)',
        }}
      />

      {/* Sticky chrome: eyebrow top-left, counter top-right, dot rail
          centred at the bottom. None of these move with the horizontal
          track — they sit above it via z-index. */}
      <div className="absolute top-[6vh] left-[6vw] z-20 pointer-events-none">
        <div className="stripe max-w-[100px] mb-4" />
        <span className="eyebrow">07 — Iconic nights</span>
      </div>
      <div className="absolute top-[6vh] right-[6vw] z-20 caption flex items-center gap-3">
        <span className="text-bone/55">Story</span>
        <span ref={counterRef} className="font-mono text-bone">
          01 / {String(MOMENTS.length).padStart(2, '0')}
        </span>
      </div>
      <div
        ref={dotsRef}
        className="absolute bottom-[6vh] left-1/2 -translate-x-1/2 z-20 flex items-center gap-3"
      >
        {MOMENTS.map((m, i) => (
          <span
            key={m.year + m.opponent}
            data-active={i === 0}
            className="w-[10px] h-[2px] bg-bone/25 data-[active=true]:bg-[var(--gold)] data-[active=true]:w-[28px] transition-all duration-500"
          />
        ))}
      </div>

      {/* Track: total width = N panels × 100vw. The translate moves it
          left one panel at a time as the user scrolls. */}
      <div
        ref={trackRef}
        className="relative h-screen flex will-change-transform"
        style={{ width: `${MOMENTS.length * 100}vw` }}
      >
        {MOMENTS.map((m, i) => (
          <MomentPanel key={m.year + m.opponent} moment={m} index={i} total={MOMENTS.length} />
        ))}
      </div>
    </section>
  );
}

function MomentPanel({
  moment,
  index,
  total,
}: {
  moment: Moment;
  index: number;
  total: number;
}) {
  return (
    <article
      className="w-screen h-screen flex-shrink-0 relative px-[8vw] py-[10vh] flex flex-col justify-center"
      aria-label={`${moment.year} — ${moment.opponent}`}
    >
      {/* Big watermark year, anchored bottom-right. Stroked so it doesn't
          fight the foreground text. */}
      <div
        aria-hidden="true"
        className="absolute right-[-2vw] bottom-[-6vh] display leading-[0.8] pointer-events-none select-none"
        style={{
          fontSize: 'clamp(14rem, 32vw, 36rem)',
          WebkitTextStroke: '2px rgba(243,240,230,0.08)',
          color: 'transparent',
        }}
      >
        {moment.year}
      </div>

      <div className="relative z-10 max-w-3xl">
        <div className="caption mb-3 text-bone/55">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} · {moment.date}
        </div>
        <div className="caption mb-6 text-[var(--gold)]">{moment.competition}</div>

        {/* Score / opponent line — the visual anchor of each panel. */}
        <div className="flex items-baseline gap-6 flex-wrap mb-8">
          <span
            className="display text-bone tabular-nums"
            style={{ fontSize: 'clamp(3.5rem, 8vw, 8rem)', lineHeight: 0.9 }}
          >
            {moment.score}
          </span>
          <span
            className="display text-bone/65"
            style={{ fontSize: 'clamp(1.2rem, 2.2vw, 2.4rem)', lineHeight: 1 }}
          >
            vs {moment.opponent}
          </span>
        </div>

        <h3
          className="display text-bone mb-6"
          style={{ fontSize: 'clamp(2rem, 4.2vw, 4.4rem)', lineHeight: 0.95 }}
        >
          {moment.title}
        </h3>
        <p className="text-bone/75 leading-relaxed text-[clamp(1rem,1.25vw,1.2rem)] max-w-2xl">
          {moment.caption}
        </p>
        <div className="mt-8 caption text-bone/45">{moment.venue}</div>
      </div>
    </article>
  );
}
