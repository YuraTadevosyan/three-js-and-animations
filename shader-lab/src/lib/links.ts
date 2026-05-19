/**
 * Absolute URL of the parent landing page that indexes all showcases.
 *
 * Derived from Vite's BASE_URL — e.g. `/three-js-and-animations/shader-lab/`
 * → `/three-js-and-animations/`. Always an absolute path (leading slash) so it
 * resolves consistently regardless of where the app is mounted; never a
 * relative `./three-js-and-animations` (that would compound into
 * `/.../shader-lab/three-js-and-animations`).
 */
export const LANDING_URL: string = import.meta.env.BASE_URL.replace(/[^/]+\/$/, '') || '/';
