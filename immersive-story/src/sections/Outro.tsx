import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from '@/components/SplitText';
import { SQUAD } from '@/data/squad';
import { STAFF } from '@/data/staff';

export function Outro() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-outro-credit]', {
        opacity: 0,
        y: 14,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="chapter relative px-[6vw] py-[18vh] min-h-screen"
      data-chapter="9"
      aria-label="Credits"
    >
      <div className="max-w-3xl">
        <div className="stripe max-w-[120px] mb-10" />
        <span className="eyebrow block mb-6">Full time</span>
        <SplitText
          as="h2"
          splitBy="lines"
          stagger={0.1}
          duration={1.0}
          start="top 85%"
          className="display text-bone text-[clamp(2.6rem,7vw,7rem)] leading-[0.92]"
          text={`VISCA\nEL BARÇA.`}
        />
        <p className="mt-10 max-w-xl text-bone/70 leading-relaxed text-[1.05rem]">
          Three whistles. The bowl empties row by row. Tomorrow the cycle
          starts again — training, travel, kick-off.
        </p>
      </div>

      <div className="mt-[12vh] grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 text-bone/70">
        <div data-outro-credit>
          <div className="caption mb-2">Story</div>
          <div className="display text-[1.4rem] leading-tight text-bone">
            Camp Nou — a matchday in four scenes.
          </div>
          <div className="text-[0.9rem] leading-relaxed mt-3">
            Roster + manager pulled from the 2025–26 FC Barcelona season page
            on Wikipedia. Photos are CC-licensed thumbnails downloaded from
            Wikimedia Commons.
          </div>
        </div>
        <div data-outro-credit>
          <div className="caption mb-2">Stack</div>
          <div className="text-[0.95rem] leading-relaxed">
            React · TypeScript · GSAP ScrollTrigger · Lenis · Tailwind CSS.
            All-DOM, no three.js. Web Audio API for the synth-ambience
            fallback. Total bundle ~290 KB.
          </div>
        </div>
        <div data-outro-credit>
          <div className="caption mb-2">Data sources</div>
          <div className="text-[0.9rem] leading-relaxed">
            <a className="underline hover:text-bone" href="https://en.wikipedia.org/wiki/2025%E2%80%9326_FC_Barcelona_season" target="_blank" rel="noopener noreferrer">2025-26 season article</a> ·
            {' '}
            <a className="underline hover:text-bone" href="https://en.wikipedia.org/wiki/Camp_Nou" target="_blank" rel="noopener noreferrer">Camp Nou</a> ·
            {' '}
            <a className="underline hover:text-bone" href="https://commons.wikimedia.org/wiki/Category:Camp_Nou" target="_blank" rel="noopener noreferrer">Commons</a>.
            Squad roster reflects the Wikipedia page at the time of the last
            fetch; rerun the import script to refresh.
          </div>
        </div>
      </div>

      <div data-outro-credit className="mt-[6vh]">
        <div className="caption mb-4">Image credits</div>
        <ul className="text-[0.78rem] text-bone/55 leading-relaxed columns-1 md:columns-2 lg:columns-3 gap-x-10">
          <li className="break-inside-avoid mb-1.5">
            <strong className="text-bone/80">Camp Nou aerial</strong> — Wikimedia Commons · CC BY-SA 4.0
          </li>
          <li className="break-inside-avoid mb-1.5">
            <strong className="text-bone/80">Clásico crowd</strong> · castro.pic (Flickr) · CC BY 2.0
          </li>
          {SQUAD.filter((p) => p.attribution.license).map((p) => (
            <li key={p.name} className="break-inside-avoid mb-1.5">
              <strong className="text-bone/80">{p.name}</strong> · {p.attribution.artist} · {p.attribution.license}
            </li>
          ))}
          {STAFF.filter((s) => s.attribution.license).map((s) => (
            <li key={s.name} className="break-inside-avoid mb-1.5">
              <strong className="text-bone/80">{s.name}</strong> · {s.attribution.artist} · {s.attribution.license}
            </li>
          ))}
        </ul>
        <p className="caption mt-4 text-[0.62rem] text-bone/40 max-w-2xl">
          All photos sourced via the Wikimedia Commons API and used in
          accordance with their respective Creative Commons licenses. No FC
          Barcelona club marks (crest, logos, kit graphics) are used.
        </p>
      </div>

      <div data-outro-credit className="mt-[4vh]">
        <div className="caption mb-3">Audio</div>
        <p className="text-[0.78rem] text-bone/55 leading-relaxed max-w-2xl">
          <strong className="text-bone/80">El Cant del Barça — Camp Nou, a cappella</strong> · sourced from a public Barça-Chelsea pre-match recording on YouTube · <em>Internet (copyright unclear)</em>. Used on this personal portfolio site under the same caveat as the player photos; not licensed for redistribution. If the file is missing or blocked, the button falls back to a Web-Audio-synthesised stadium ambience.
        </p>
      </div>

      <footer className="mt-[10vh] flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div className="caption">© Camp Nou · field 005</div>
        <a
          className="caption hover:text-bone transition-colors"
          href="https://github.com/YuraTadevosyan/three-js-and-animations"
          target="_blank"
          rel="noopener noreferrer"
        >
          ↗ source
        </a>
      </footer>
    </section>
  );
}
