import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from '@/components/SplitText';
import { STAFF } from '@/data/staff';

// Coaching staff. A grid of taller-than-wide cards that animate in as the
// section scrolls into view. Each card has a hover-only photo zoom so the
// grid feels alive even after the entry animation has finished.
export function Staff() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-staff-card]',
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 70%',
          },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="chapter relative px-[6vw] py-[18vh]"
      data-chapter="3"
      aria-label="Coaching staff"
    >
      <div className="max-w-6xl mb-16">
        <div className="stripe max-w-[120px] mb-10" />
        <span className="eyebrow block mb-6">02 — Coaching staff</span>
        <SplitText
          as="h2"
          splitBy="lines"
          stagger={0.1}
          duration={1.0}
          start="top 80%"
          className="display text-bone text-[clamp(2.8rem,7vw,7rem)] leading-[0.92]"
          text={`THE\nDUGOUT.`}
        />
        <p className="mt-8 max-w-xl text-bone/70 leading-relaxed text-[1.05rem]">
          The people the camera ignores until extra time. Tactical model,
          recovery plan, set-pieces, the substitution at 73'.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {STAFF.map((s) => (
          <article
            key={s.name}
            data-staff-card
            className="staff-card group relative overflow-hidden aspect-[3/4]"
          >
            <div
              className="absolute inset-0 bg-center bg-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              style={{
                backgroundImage: `url(${s.image})`,
                filter: 'grayscale(0.4) contrast(1.05) saturate(0.9)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, transparent 35%, rgba(5,8,15,0.92) 100%), linear-gradient(180deg, rgba(0,77,152,0.18) 0%, transparent 40%)',
              }}
            />
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <div className="caption mb-2 text-[var(--gold)]">{s.title}</div>
              <h3 className="display text-bone text-[1.6rem] leading-[0.95]">
                {s.name}
              </h3>
              <div className="caption mt-2 text-bone/55">{s.role}</div>
              <p className="mt-3 text-bone/75 text-[0.85rem] leading-snug line-clamp-3">
                {s.bio}
              </p>
              {s.attribution.license && (
                <div className="caption mt-3 text-[0.6rem] text-bone/35 leading-snug">
                  Photo: {s.attribution.artist} · {s.attribution.license}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
