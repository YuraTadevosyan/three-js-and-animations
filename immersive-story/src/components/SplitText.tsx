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
  // When true, the animation plays once and stays; otherwise it scrubs in
  // and out — useful for hero text vs. mid-chapter reveals.
  once?: boolean;
};

// A self-contained ScrollTrigger-driven text reveal. Splits the text into
// lines, words or characters, applies an initial transform via classes, and
// animates them on enter. Lines are the cheapest and look best at hero size.
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
  once = true,
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

    const triggerEl =
      trigger === 'parent' ? (el.parentElement ?? el) : el;

    const ctx = gsap.context(() => {
      if (splitBy === 'chars') {
        gsap.fromTo(
          target,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration,
            ease: 'power4.out',
            stagger,
            delay,
            scrollTrigger: {
              trigger: triggerEl,
              start,
              toggleActions: once
                ? 'play none none none'
                : 'play reverse play reverse',
            },
          },
        );
      } else {
        gsap.fromTo(
          target,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration,
            ease: 'power4.out',
            stagger,
            delay,
            scrollTrigger: {
              trigger: triggerEl,
              start,
              toggleActions: once
                ? 'play none none none'
                : 'play reverse play reverse',
            },
          },
        );
      }
    }, el);

    return () => ctx.revert();
  }, [splitBy, stagger, delay, duration, start, trigger, once, text]);

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
          <span
            className="split-char"
            key={i}
            style={{ transitionDelay: `${i * 0.012}s` }}
          >
            {ch === ' ' ? ' ' : ch}
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
