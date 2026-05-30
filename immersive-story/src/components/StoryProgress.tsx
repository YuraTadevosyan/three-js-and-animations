import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Bottom progress bar driven directly off the document's scroll position.
//
// The earlier version used `gsap.to({width:'100%'})` scrubbed across the
// document height. That broke whenever a pinned section reported its pin
// distance after a refresh — the tween's end-point shifted mid-scroll and
// the bar would stick or jump. Driving the bar from `onUpdate` with a
// transform avoids that entirely: progress is always the live ratio
// `scrollY / maxScroll`, the bar is repainted on the compositor only, and
// a single ScrollTrigger handles refresh / load / pin recompute uniformly.
export function StoryProgress() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Start at 0 — important if a previous tween left state behind.
    el.style.transformOrigin = 'left center';
    el.style.transform = 'scaleX(0)';

    // `start: 0, end: 'max'` makes the trigger span the entire document at
    // its current height; the live progress 0..1 is read back from
    // `self.progress` regardless of how that height changes later.
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        el.style.transform = `scaleX(${self.progress})`;
      },
      onRefresh: (self) => {
        // After a refresh the scroll position may have shifted; sync the
        // bar immediately rather than waiting for the next frame.
        el.style.transform = `scaleX(${self.progress})`;
      },
    });

    return () => st.kill();
  }, []);

  return (
    <div className="story-progress" aria-hidden="true">
      <div ref={ref} className="story-progress__bar" />
    </div>
  );
}

export function ensureProgressRefresh() {
  // Fonts and slow images can shift layout after first paint — refresh on
  // window load so the bar's "max scroll" matches the final document size.
  if (typeof window === 'undefined') return;
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
