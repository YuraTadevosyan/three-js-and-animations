import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Thin horizontal bar at the bottom of the viewport. Width tracks the
// document scroll fraction so the user always knows how deep into the story
// they are without obstructing the content.
export function StoryProgress() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const tween = gsap.to(ref.current, {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.2,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div className="story-progress" aria-hidden="true">
      <div ref={ref} className="story-progress__bar" />
    </div>
  );
}

export function ensureProgressRefresh() {
  // Some fonts load after first paint and shift layouts — refresh on `load`
  // so all pinned distances stay accurate.
  if (typeof window === 'undefined') return;
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
