import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from '@/components/SplitText';

// Full-bleed fans section. The section itself is one viewport tall and gets
// pinned by ScrollTrigger for an extra ~120% scroll so the photo can drift
// and the stats can lift in. Critically there's no CSS `sticky` involved —
// pin + sticky fight each other and leave an empty black band below.
//
// Photo: "2010-11-29 Clasico03" (5222087110) on Wikimedia Commons, CC BY 2.0.
const FANS_IMG = `${import.meta.env.BASE_URL}images/camp-nou-fans.jpg`;

export function Fans() {
  const ref = useRef<HTMLElement | null>(null);
  const photoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      // Pin the whole section for an extra 120% of scroll. pinSpacing keeps
      // the next section flush against the bottom of this pin.
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top top',
        end: '+=120%',
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      });

      // Drift + zoom the photo across the pin's duration.
      gsap.fromTo(
        photoRef.current,
        { yPercent: -4, scale: 1.08 },
        {
          yPercent: 4,
          scale: 1.18,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top top',
            end: '+=120%',
            scrub: true,
          },
        },
      );

      gsap.fromTo(
        '[data-fans-stat]',
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top top',
            end: 'top+=400 top',
            scrub: 0.5,
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
      aria-label="The fans"
    >
      <div
        ref={photoRef}
        className="absolute inset-0 bg-center bg-cover will-change-transform"
        style={{
          backgroundImage: `url(${FANS_IMG})`,
          filter: 'saturate(0.95) contrast(1.05)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(5,8,15,0.55) 0%, rgba(5,8,15,0.25) 40%, rgba(5,8,15,0.85) 100%), radial-gradient(ellipse at 50% 60%, rgba(165,0,68,0.18), transparent 60%)',
        }}
      />

      <div className="relative z-10 h-screen px-[6vw] py-[10vh] flex flex-col justify-between">
        <span className="eyebrow">03 — The Fans</span>

        <div className="max-w-4xl">
          <SplitText
            as="h2"
            splitBy="lines"
            stagger={0.12}
            duration={1.0}
            start="top 85%"
            className="display text-bone text-[clamp(3rem,9vw,10rem)] leading-[0.88]"
            text={`NINETY-NINE\nTHOUSAND\nVOICES.`}
          />
          <p className="mt-8 max-w-xl text-bone/85 leading-relaxed text-[clamp(1.05rem,1.3vw,1.25rem)]">
            The stadium is built from concrete and steel. The matchday is
            built from breath. Every player walking out of the tunnel is
            walking into the same wave of noise.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-10 max-w-4xl">
          <div className="stat" data-fans-stat>
            <div className="stat__value">99,354</div>
            <div className="stat__label">Capacity</div>
          </div>
          <div className="stat" data-fans-stat>
            <div className="stat__value">112 dB</div>
            <div className="stat__label">Peak roar</div>
          </div>
          <div className="stat" data-fans-stat>
            <div className="stat__value">141k</div>
            <div className="stat__label">Socis</div>
          </div>
          <div className="stat" data-fans-stat>
            <div className="stat__value">5</div>
            <div className="stat__label">Continents</div>
          </div>
        </div>
      </div>
    </section>
  );
}
