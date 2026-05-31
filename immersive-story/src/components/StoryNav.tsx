import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Fixed nav that auto-hides when the user scrolls down and slides back in
// when they scroll up. Always visible at the very top of the page so the
// hero never opens behind a half-hidden bar.
const HIDE_AFTER = 80;       // px from top before we ever start hiding
const SCROLL_DELTA = 8;      // min px of movement before changing direction

export function StoryNav({
  onAboutClick,
}: {
  onAboutClick: () => void;
}) {
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!navRef.current) return;
    let lastY = window.scrollY;
    let hidden = false;
    let ticking = false;

    const setVisible = (visible: boolean) => {
      if (visible === !hidden) return;
      hidden = !visible;
      // Anim the bar above the viewport. We translate the bar itself rather
      // than toggling opacity so it physically clears the space — looks
      // crisp against bright photos on the hero.
      gsap.to(navRef.current!, {
        yPercent: visible ? 0 : -100,
        duration: 0.45,
        ease: 'power3.out',
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const diff = y - lastY;

        // Always show near the very top so the first-view nav isn't hidden.
        if (y < HIDE_AFTER) {
          setVisible(true);
        } else if (Math.abs(diff) > SCROLL_DELTA) {
          // Direction change only if movement exceeds a small dead-band —
          // avoids the bar flickering on inertial scroll wobble.
          setVisible(diff < 0);
        }
        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header ref={navRef} className="story-nav">
      <div>
        <span className="dot" /> Live · Camp Nou
      </div>
      <nav className="flex items-center gap-5">
        <button
          type="button"
          onClick={onAboutClick}
          className="hover:text-bone transition-colors"
          aria-label="Open about — technologies"
        >
          About
        </button>
        <a
          href="https://github.com/YuraTadevosyan/three-js-and-animations"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source ↗
        </a>
      </nav>
    </header>
  );
}
