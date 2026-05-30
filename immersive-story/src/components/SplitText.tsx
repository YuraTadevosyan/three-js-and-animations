import { useEffect, useRef } from 'react';
import gsap from 'gsap';

type SplitMode = 'words' | 'chars' | 'lines';

type Props = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  className?: string;
  splitBy?: SplitMode;
  stagger?: number;
  delay?: number;
  duration?: number;
  start?: string;
  trigger?: 'self' | 'parent';
  once?: boolean;
};

// A scroll-revealed text component. Splits the text into words/lines/chars
// and animates them in when the element enters the viewport.
//
// Previously this used ScrollTrigger, which silently failed for elements
// inside pinned sections (the trigger's measured position fought with the
// pin's pin-spacer). The pattern below is more reliable:
//   1. CSS leaves the text fully visible — so if JS errors or doesn't load,
//      the page is still readable (no permanently-hidden lines).
//   2. On mount we use gsap.set to hide the pieces, then watch the host
//      element with IntersectionObserver. The IO callback fires as soon as
//      the host enters the viewport — even for elements that are already
//      on-screen at mount, IO reports the initial intersection on the next
//      microtask.
//   3. When the host enters, a single gsap.to animation reveals everything.
//      It runs once and the observer disconnects.
export function SplitText({
  text,
  as = 'h2',
  className = '',
  splitBy = 'words',
  stagger = 0.06,
  delay = 0,
  duration = 1.0,
  start = 'top 80%',
  trigger = 'self',
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const target =
      splitBy === 'chars'
        ? el.querySelectorAll<HTMLElement>('.split-char')
        : splitBy === 'lines'
          ? el.querySelectorAll<HTMLElement>('.split-line__inner')
          : el.querySelectorAll<HTMLElement>('.split-word__inner');

    if (target.length === 0) return;

    // Map `start: 'top X%'` to an IntersectionObserver rootMargin. With
    // `top 80%` the trigger is when the element's top reaches 80% from the
    // top of the viewport — equivalent to shrinking the viewport's bottom
    // by 20% so IO fires earlier.
    const m = /top\s+(\d+)/.exec(start);
    const pct = m ? parseFloat(m[1]) : 80;
    const bottomShrink = Math.max(0, 100 - pct);
    const rootMargin = `0px 0px -${bottomShrink}% 0px`;

    const triggerEl =
      trigger === 'parent' ? (el.parentElement ?? el) : el;

    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      if (splitBy === 'chars') {
        gsap.to(target, {
          yPercent: 0,
          opacity: 1,
          duration,
          ease: 'power4.out',
          stagger,
          delay,
        });
      } else {
        gsap.to(target, {
          yPercent: 0,
          duration,
          ease: 'power4.out',
          stagger,
          delay,
        });
      }
    };

    // Hide immediately — overrides any CSS so even if .split-line__inner
    // doesn't have an initial transform anymore, the reveal animation has
    // a "from" state to play out of.
    if (splitBy === 'chars') {
      gsap.set(target, { yPercent: 110, opacity: 0 });
    } else {
      gsap.set(target, { yPercent: 110 });
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            play();
            io.disconnect();
            return;
          }
        }
      },
      { rootMargin, threshold: 0 },
    );
    io.observe(triggerEl);

    // Safety net: if the observer somehow never fires within 4 seconds
    // (e.g. a browser bug, scroll container that obscures viewport
    // intersection), reveal anyway so we never leave the text hidden.
    const fallback = window.setTimeout(() => {
      if (!played) {
        play();
        io.disconnect();
      }
    }, 4000);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
      // Clearing inline styles puts everything back to CSS defaults —
      // which after this edit means "visible".
      gsap.set(target, { clearProps: 'all' });
    };
  }, [splitBy, stagger, delay, duration, start, trigger, text]);

  const Tag = as;
  const setRef = (n: HTMLElement | null) => {
    ref.current = n;
  };

  if (splitBy === 'lines') {
    const lines = text.split('\n');
    return (
      <Tag ref={setRef as never} className={className}>
        {lines.map((line, i) => (
          <span className="split-line" key={i}>
            <span className="split-line__inner">{line}</span>
            {i < lines.length - 1 ? <br /> : null}
          </span>
        ))}
      </Tag>
    );
  }

  if (splitBy === 'chars') {
    return (
      <Tag ref={setRef as never} className={className}>
        {text.split('').map((ch, i) => (
          <span className="split-char" key={i}>
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag ref={setRef as never} className={className}>
      {text.split(' ').map((word, i) => (
        <span className="split-word" key={i}>
          <span className="split-word__inner">{word}</span>
        </span>
      ))}
    </Tag>
  );
}
