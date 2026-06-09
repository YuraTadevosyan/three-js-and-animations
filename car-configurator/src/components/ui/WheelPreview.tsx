import type { WheelOption } from '@/lib/config';

/** A small alloy-finish chip that shows a wheel option's rim colour. */
export function WheelPreview({ wheel, size = 44 }: { wheel: WheelOption; size?: number }) {
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <defs>
        <radialGradient id={`rim-${wheel.id}`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="45%" stopColor={wheel.hex} />
          <stop offset="100%" stopColor="#05060a" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r={c - 1} fill="#0b0b0d" />
      <circle cx={c} cy={c} r={c - 3} fill={`url(#rim-${wheel.id})`} />
      {/* Five-spoke hint */}
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i * 72 - 90) * (Math.PI / 180);
        return (
          <line
            key={i}
            x1={c}
            y1={c}
            x2={c + Math.cos(a) * (c - 6)}
            y2={c + Math.sin(a) * (c - 6)}
            stroke="#05060a"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.55}
          />
        );
      })}
      <circle cx={c} cy={c} r={3.5} fill="#1c4fa0" />
    </svg>
  );
}
