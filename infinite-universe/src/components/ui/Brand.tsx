import { useRef } from 'react';
import { useUniverse } from '@/state/universeStore';

/** Wordmark + logo. Clicking the mark seven times reveals a hidden note. */
export function Brand() {
  const { pushToast } = useUniverse();
  const clicks = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  const onClick = () => {
    clicks.current += 1;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => (clicks.current = 0), 1600);
    if (clicks.current >= 7) {
      clicks.current = 0;
      pushToast(
        "Cartographer's mark",
        'You found the makers’ signature. Somewhere out here, an obelisk still remembers.',
      );
    }
  };

  return (
    <button
      onClick={onClick}
      className="group pointer-events-auto flex select-none items-center gap-2.5"
      aria-label="Infinite Universe"
    >
      <svg viewBox="0 0 40 40" className="h-8 w-8 shrink-0 drop-shadow-[0_0_10px_rgba(40,224,255,0.4)]">
        <circle cx="20" cy="20" r="8" className="fill-plasma/90" />
        <ellipse
          cx="20"
          cy="20"
          rx="15"
          ry="5"
          className="fill-none stroke-nebula/80"
          strokeWidth="1.6"
          transform="rotate(-24 20 20)"
        />
        <circle cx="8" cy="9" r="1" className="fill-white/80" />
        <circle cx="33" cy="30" r="1.2" className="fill-solar/90" />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight text-white/90">
        Infinite<span className="text-cosmic"> Universe</span>
      </span>
    </button>
  );
}
