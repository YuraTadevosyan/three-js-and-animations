import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SQUAD, type Player } from '@/data/squad';

// Pinned carousel. All player cards are stacked absolutely in the same
// viewport-sized stage; a master scrubbed timeline crossfades between them
// as the user scrolls. Each card alternates dwell (full opacity, photo
// ken-burnsing slowly) → crossfade out / in. After the last card the pin
// releases and the next section flows.
//
// The total scroll-length of the pin is (N-1) * DWELL + N * STEP viewport
// heights, where DWELL is the per-card hold and STEP is the per-transition
// fade. Tuned so 23 players take ~14 screens of scroll — long enough to
// breathe, short enough to not feel endless.
const DWELL = 0.55;
const STEP = 0.45;

export function Squad() {
  const ref = useRef<HTMLElement | null>(null);
  const cardsWrapRef = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current || !cardsWrapRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-player-card]', cardsWrapRef.current!);
      const N = cards.length;
      // One scroll unit ≈ 1vh in pin-distance; total pin length below.
      const totalUnits = (N - 1) * (DWELL + STEP) + DWELL;
      const pinLength = () => totalUnits * window.innerHeight;

      // Initial state: only card 0 visible.
      gsap.set(cards, { autoAlpha: 0 });
      gsap.set(cards[0], { autoAlpha: 1 });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: () => `+=${pinLength()}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            // 0..N-1 fractional index of the currently-dominant card.
            const idx = self.progress * (N - 1);
            const active = Math.min(N - 1, Math.round(idx));
            if (counterRef.current) {
              counterRef.current.textContent =
                String(active + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
            }
            if (progressBarRef.current) {
              progressBarRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        },
      });

      // Build the master timeline:
      //   dwell on card 0 → fade 0 out + fade 1 in → dwell on 1 → ... → dwell on N-1
      // The fade-out and fade-in happen at the same timeline position so
      // they crossfade rather than blink.
      for (let i = 0; i < N - 1; i++) {
        tl.to({}, { duration: DWELL }); // hold on card i
        const slideFromRight = i % 2 === 0;
        tl.to(
          cards[i],
          { autoAlpha: 0, x: slideFromRight ? -40 : 40, duration: STEP },
          '>',
        );
        tl.fromTo(
          cards[i + 1],
          { autoAlpha: 0, x: slideFromRight ? 60 : -60 },
          { autoAlpha: 1, x: 0, duration: STEP },
          '<',
        );
        // The incoming card's per-card reveal: photo eases in scale +
        // watermark number lifts + lines stagger. Each piece is anchored
        // to '<' so it shares the crossfade window.
        const photo = cards[i + 1].querySelector('[data-player-photo]');
        const num = cards[i + 1].querySelector('[data-player-number]');
        const lines = cards[i + 1].querySelectorAll('[data-player-line]');
        if (photo) {
          tl.fromTo(
            photo,
            { scale: 1.12, yPercent: 4 },
            { scale: 1.0, yPercent: 0, duration: STEP, ease: 'power3.out' },
            '<',
          );
        }
        if (num) {
          tl.fromTo(
            num,
            { yPercent: 22, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: STEP, ease: 'power4.out' },
            '<+0.05',
          );
        }
        if (lines.length) {
          tl.fromTo(
            lines,
            { y: 26, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: STEP * 0.9,
              stagger: 0.05,
              ease: 'power3.out',
            },
            '<+0.1',
          );
        }
      }
      tl.to({}, { duration: DWELL }); // final hold on last card

      // Animate the first card's photo + lines in on entry as well, so the
      // initial pin doesn't feel pre-rendered.
      const firstPhoto = cards[0].querySelector('[data-player-photo]');
      const firstNum = cards[0].querySelector('[data-player-number]');
      const firstLines = cards[0].querySelectorAll('[data-player-line]');
      if (firstPhoto) {
        gsap.fromTo(
          firstPhoto,
          { scale: 1.12, yPercent: 4 },
          {
            scale: 1.0,
            yPercent: 0,
            ease: 'power3.out',
            duration: 1.2,
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 90%',
              end: 'top 30%',
              scrub: 0.6,
            },
          },
        );
      }
      if (firstNum) {
        gsap.fromTo(
          firstNum,
          { yPercent: 22, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 80%',
              end: 'top 40%',
              scrub: 0.6,
            },
          },
        );
      }
      if (firstLines.length) {
        gsap.fromTo(
          firstLines,
          { y: 26, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      }
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
      data-chapter="2"
      aria-label="Squad"
    >
      {/* Stage — every card stacks on top here, only one fully visible. */}
      <div ref={cardsWrapRef} className="relative w-full h-full">
        {SQUAD.map((p, i) => (
          <PlayerCard key={p.number} player={p} index={i} total={SQUAD.length} />
        ))}
      </div>

      {/* Counter + thin progress rail across the bottom of the pinned frame. */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8 z-30 caption flex items-center gap-3 mix-blend-difference text-bone">
        <span>Squad</span>
        <span ref={counterRef} className="font-mono text-bone">
          01 / {String(SQUAD.length).padStart(2, '0')}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-bone/10 z-30">
        <div
          ref={progressBarRef}
          className="h-full origin-left"
          style={{
            transform: 'scaleX(0)',
            background:
              'linear-gradient(90deg, var(--blue), var(--red), var(--gold))',
          }}
        />
      </div>
    </section>
  );
}

function PlayerCard({
  player,
  index,
  total,
}: {
  player: Player;
  index: number;
  total: number;
}) {
  return (
    <article
      data-player-card
      className="absolute inset-0 w-full h-full"
      aria-label={`${player.number} — ${player.name}`}
    >
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-12">
        {/* Photo column. On phones it's the top 55vh; on desktop the left 7/12. */}
        <div className="md:col-span-7 relative overflow-hidden h-[55vh] md:h-full">
          <div
            data-player-photo
            className="absolute inset-0 bg-cover will-change-transform"
            style={{
              // bg-position: top keeps heads in frame on tall portrait
              // crops (most FCB CDN photos are 2:3 portraits where centring
              // cuts off the face). Horizontally centred.
              backgroundPosition: 'center top',
              backgroundImage: `url(${player.image})`,
              filter: 'saturate(0.88) contrast(1.06)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(5,8,15,0.0) 55%, rgba(5,8,15,0.85) 100%), linear-gradient(90deg, rgba(0,77,152,0.18) 0%, transparent 35%)',
            }}
          />

          {/* Big stroked shirt-number behind the photo edge. */}
          <div
            data-player-number
            className="absolute right-[-2vw] bottom-[-4vh] display leading-[0.8] pointer-events-none select-none"
            style={{
              fontSize: 'clamp(12rem, 26vw, 26rem)',
              WebkitTextStroke: '2px rgba(243,240,230,0.85)',
              color: 'transparent',
            }}
          >
            {String(player.number).padStart(2, '0')}
          </div>
        </div>

        {/* Right column — index, role, name, bio, photo credit. */}
        <div className="md:col-span-5 relative px-[6vw] md:px-[3vw] py-[5vh] md:py-[10vh] flex flex-col justify-center bg-ink/85 md:bg-ink/70 backdrop-blur-sm">
          <div data-player-line className="eyebrow mb-3">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} · {player.position} · {player.nat}
          </div>
          <div
            data-player-line
            className="caption mb-6 text-[var(--gold)] flex items-center gap-3 flex-wrap"
          >
            <span>#{player.number} · {player.role}</span>
            {player.captain && (
              <span className="px-2 py-0.5 border border-[var(--gold)] text-[0.62rem] tracking-[0.2em]">
                Captain
              </span>
            )}
          </div>
          <h3
            data-player-line
            className="display text-bone text-[clamp(2.2rem,4.8vw,5rem)] leading-[0.92]"
          >
            {player.name}
          </h3>
          <p
            data-player-line
            className="mt-6 text-bone/75 leading-relaxed text-[0.98rem] max-w-md"
          >
            {player.bio}
          </p>
          {player.attribution.license && (
            <div data-player-line className="mt-6 caption text-[0.6rem] text-bone/40 max-w-md leading-snug">
              Photo: {player.attribution.artist} · {player.attribution.license} · Wikimedia Commons
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
