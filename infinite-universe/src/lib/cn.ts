import clsx, { type ClassValue } from 'clsx';

/** Tiny class-name combiner. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Format a raw travel distance as flavourful light-years. */
export function formatLightYears(distance: number): string {
  const ly = distance / 60;
  if (ly >= 1000) return `${(ly / 1000).toFixed(2)}k`;
  return ly.toFixed(1);
}
