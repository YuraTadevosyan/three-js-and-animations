import { useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const CHAPTERS = [
  'Camp Nou',
  'Intro',
  'Squad',
  'Staff',
  'Fans',
  'Full time',
];

// Side rail showing chapter dots. The active dot is the closest section's
// ScrollTrigger by index — cheaper than computing positions ourselves and
// always agrees with whatever pin/scrub is currently driving the scene.
export function ChapterRail() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onUpdate = () => {
      const triggers = ScrollTrigger.getAll().filter(
        (t) => t.vars.pin && t.vars.trigger instanceof Element,
      );
      // We pick the chapter whose trigger top is the latest one above the
      // viewport midpoint — equivalent to "which section is currently
      // dominant on screen".
      const mid = window.scrollY + window.innerHeight * 0.5;
      let best = 0;
      let bestY = -Infinity;
      const sections = document.querySelectorAll<HTMLElement>('[data-chapter]');
      sections.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        if (top <= mid && top > bestY) {
          best = i;
          bestY = top;
        }
      });
      setActive(best);
      void triggers;
    };
    ScrollTrigger.addEventListener('refresh', onUpdate);
    const onScroll = () => requestAnimationFrame(onUpdate);
    window.addEventListener('scroll', onScroll, { passive: true });
    onUpdate();
    return () => {
      ScrollTrigger.removeEventListener('refresh', onUpdate);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <ul className="chapter-rail" aria-hidden="true">
      {CHAPTERS.map((c, i) => (
        <li
          key={c}
          className="chapter-rail__dot"
          data-active={i === active}
          title={c}
        />
      ))}
    </ul>
  );
}
