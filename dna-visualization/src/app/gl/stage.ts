import type { Camera } from './camera';

/** Everything a stage needs to draw one frame. */
export interface FrameContext {
  gl: WebGL2RenderingContext;
  camera: Camera;
  /** Seconds since start. */
  time: number;
  /** Seconds since the previous frame, clamped against tab-switch spikes. */
  dt: number;
  /**
   * Progress through this stage's own slice of the journey.
   *
   * 0 at the moment the stage takes over, 1 as it hands off. Runs slightly
   * outside [0,1] while crossfading with its neighbours, which is exactly the
   * range where a stage should be flying past the lens or still tiny in the
   * distance.
   */
  local: number;
  /** Crossfade weight, 0 when fully hidden and 1 when this stage owns the frame. */
  alpha: number;
  /** Journey progress across every stage, 0..1. */
  progress: number;
  /** Pointer position in normalised device coords, -1..1. */
  pointerX: number;
  pointerY: number;
  /** Instance-count multiplier chosen by the adaptive quality controller. */
  quality: number;
  /** Drawing-buffer size in physical pixels. */
  width: number;
  height: number;
  /**
   * The framebuffer stages draw into. Anything that renders to its own target
   * mid-stage must rebind this (and reset the viewport) afterwards.
   */
  target: WebGLFramebuffer | null;
}

/**
 * One biological scale.
 *
 * Stages are constructed lazily on first approach and never disposed during the
 * session — building the p53 fold or a nucleus full of chromatin costs a few
 * milliseconds, and doing it while the user is mid-scroll would stutter.
 */
export interface Stage {
  /** Stable id, also used as the deep-link hash. */
  readonly id: string;
  /** Short name for the scale rail. */
  readonly label: string;
  /** Physical scale of what's on screen, e.g. `10⁻⁹ m`. */
  readonly scale: string;
  /** One factual sentence shown while the stage is dominant. */
  readonly caption: string;
  /** Optional secondary detail line. */
  readonly detail?: string;

  /** Allocate GPU resources. Called on first approach, and again after a
   * context loss — so it must be safe to run after `dispose()`. */
  init(gl: WebGL2RenderingContext): void;
  /** Advance simulation. Called only while the stage is visible. */
  update(ctx: FrameContext): void;
  /** Draw. The renderer has already cleared depth for this stage's slot. */
  render(ctx: FrameContext): void;
  /** Optional depth-of-field hint, blended by crossfade weight. */
  focus?(ctx: FrameContext): FocusHint;
  dispose(): void;
}

/**
 * Depth-of-field focus hint. A stage returning a focus distance and aperture
 * lets the composite pass blur what the viewer isn't meant to be reading.
 */
export interface FocusHint {
  distance: number;
  aperture: number;
}
