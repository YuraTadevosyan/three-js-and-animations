export const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

// Map a value from one range to another, with optional clamping. Used to
// translate the global 0..1 scroll progress into per-chapter sub-progress
// without writing the same lerp twice per chapter.
export const mapRange = (
  x: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  clamped = true,
) => {
  const t = (x - inMin) / (inMax - inMin);
  const tt = clamped ? clamp(t, 0, 1) : t;
  return outMin + (outMax - outMin) * tt;
};

export const lerpColor = (
  out: [number, number, number],
  a: [number, number, number],
  b: [number, number, number],
  t: number,
) => {
  out[0] = a[0] + (b[0] - a[0]) * t;
  out[1] = a[1] + (b[1] - a[1]) * t;
  out[2] = a[2] + (b[2] - a[2]) * t;
};
