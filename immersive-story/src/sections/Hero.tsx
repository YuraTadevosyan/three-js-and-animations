import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from '@/components/SplitText';

// Full-bleed Camp Nou hero. The photo is a fixed-position background that
// slowly ken-burns while the title's lines lift in. As the section scrolls
// off-screen the photo zooms further and crossfades to a black overlay.
//
// Photo: "2014. Més que un club. Camp Nou. Barcelona B36" by Lmbuga
// (Luis Miguel Bugallo Sánchez), Wikimedia Commons, CC BY-SA 3.0.
const CAMP_NOU_IMG = `${import.meta.env.BASE_URL}images/camp-nou-hero.jpg`;

export function Hero() {
  const ref = useRef<HTMLElement | null>(null);
  const photoRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      // Slow ken-burns while the hero is in view.
      gsap.fromTo(
        photoRef.current,
        { scale: 1.05 },
        {
          scale: 1.22,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        },
      );

      // The dark overlay deepens as the hero scrolls away.
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0.25 },
        {
          opacity: 0.65,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        },
      );

      gsap.to(hintRef.current, {
        opacity: 0,
        y: 16,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
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
      className="chapter chapter-pin relative overflow-hidden"
      data-chapter="0"
      aria-label="Camp Nou"
    >
      <div
        ref={photoRef}
        className="absolute inset-0 bg-center bg-cover will-change-transform"
        style={{ backgroundImage: `url(${CAMP_NOU_IMG})` }}
      />
      <div
        ref={overlayRef}
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 30%, rgba(0,77,152,0.2) 0%, transparent 55%), radial-gradient(ellipse at 75% 80%, rgba(165,0,68,0.25) 0%, transparent 55%), linear-gradient(180deg, rgba(5,8,15,0.25) 0%, rgba(5,8,15,0.85) 100%)',
        }}
      />

      <div className="relative z-10 h-full flex flex-col justify-between px-[6vw] py-[6vh]">
        <div className="flex items-center justify-between">
          <span className="scoreboard">
            <span className="scoreboard__crest" />
            <span>Live · Camp Nou · 21:00</span>
          </span>
          <span className="eyebrow hidden md:inline over-photo">Capacity 99,354</span>
        </div>

        <div className="max-w-[min(1300px,96vw)]">
          <span className="eyebrow block mb-6">The new Camp Nou</span>
          <SplitText
            as="h1"
            splitBy="lines"
            stagger={0.14}
            duration={1.2}
            delay={0.15}
            start="top 95%"
            className="display text-bone text-[clamp(3.6rem,11vw,16rem)] leading-[0.84]"
            text={`MÉS\nQUE UN\nCLUB.`}
          />
          <SplitText
            as="p"
            splitBy="words"
            stagger={0.022}
            duration={0.9}
            delay={0.8}
            start="top 95%"
            className="mt-10 max-w-xl text-[1.05rem] leading-relaxed text-bone/75"
            text="A scroll-driven matchday at the new Camp Nou. Step inside the bowl, meet the squad, the staff, and the crowd that lifts every player onto the pitch."
          />
        </div>

        <div className="flex items-end justify-between gap-6">
          <div className="grid grid-cols-3 gap-6 md:gap-10">
            <div className="stat">
              <div className="stat__value">1899</div>
              <div className="stat__label">Founded</div>
            </div>
            <div className="stat">
              <div className="stat__value">99k</div>
              <div className="stat__label">Capacity</div>
            </div>
            <div className="stat">
              <div className="stat__value">5★</div>
              <div className="stat__label">UEFA</div>
            </div>
          </div>
          <div ref={hintRef} className="scroll-hint">
            <span>Scroll</span>
            <span className="scroll-hint__line" />
          </div>
        </div>
      </div>
    </section>
  );
}
