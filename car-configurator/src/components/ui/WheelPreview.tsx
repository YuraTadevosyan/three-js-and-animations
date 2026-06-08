import type { WheelOption } from '@/lib/config';

/** A small top-down SVG rim that mirrors a wheel option's spoke pattern. */
export function WheelPreview({ wheel, size = 44 }: { wheel: WheelOption; size?: number }) {
  const c = size / 2;
  const spokes = Array.from({ length: wheel.spokes }, (_, i) => i);
  const step = 360 / wheel.spokes;
  const forks = wheel.split ? [-7, 7] : [0];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={c} cy={c} r={c - 1} fill="#0b0b0d" />
      <circle cx={c} cy={c} r={c - 4} fill="none" stroke={wheel.rimColor} strokeWidth={2.4} />
      {spokes.map((i) =>
        forks.map((f) => {
          const angle = ((i * step + f) * Math.PI) / 180;
          const x = c + Math.cos(angle) * (c - 6);
          const y = c + Math.sin(angle) * (c - 6);
          return (
            <line
              key={`${i}-${f}`}
              x1={c}
              y1={c}
              x2={x}
              y2={y}
              stroke={wheel.rimColor}
              strokeWidth={wheel.spokes >= 10 ? 1.4 : 2.2}
              strokeLinecap="round"
            />
          );
        }),
      )}
      <circle cx={c} cy={c} r={3} fill={wheel.rimColor} />
      <circle cx={c} cy={c} r={1.4} fill="#1c4fa0" />
    </svg>
  );
}
