import type { WheelStyle } from '@/lib/config';

/** A small top-down SVG rim that mirrors a wheel style's spoke pattern. */
export function WheelPreview({
  style,
  color,
  size = 44,
}: {
  style: WheelStyle;
  color: string;
  size?: number;
}) {
  const c = size / 2;
  const spokes = style.spokes ?? 10; // OEM shows a dense forged look
  const forks = style.split ? [-7, 7] : [0];
  const step = 360 / spokes;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <defs>
        <radialGradient id={`wp-${style.id}`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor="#05060a" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r={c - 1} fill="#0b0b0d" />
      <circle cx={c} cy={c} r={c - 4} fill="none" stroke={`url(#wp-${style.id})`} strokeWidth={2.6} />
      {Array.from({ length: spokes }, (_, i) =>
        forks.map((f) => {
          const a = ((i * step + f) * Math.PI) / 180;
          return (
            <line
              key={`${i}-${f}`}
              x1={c}
              y1={c}
              x2={c + Math.cos(a) * (c - 6)}
              y2={c + Math.sin(a) * (c - 6)}
              stroke={`url(#wp-${style.id})`}
              strokeWidth={spokes >= 10 ? 1.5 : 2.4}
              strokeLinecap="round"
            />
          );
        }),
      )}
      <circle cx={c} cy={c} r={3.4} fill={color} />
      <circle cx={c} cy={c} r={1.4} fill="#1c4fa0" />
    </svg>
  );
}
