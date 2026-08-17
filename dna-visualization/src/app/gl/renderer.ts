import { Camera } from './camera';
import { clamp, damp, mix, smoothstep } from './math';
import { PostProcess } from './post';
import type { FrameContext, Stage } from './stage';
import { probeCaps, RenderTarget, type GLCaps } from './targets';

export interface RendererCallbacks {
  onStageChange?(index: number): void;
  /** Eased journey position, every frame. Throttle before writing to signals. */
  onProgress?(progress: number): void;
  onStats?(fps: number, quality: number): void;
  onContextLost?(): void;
  onContextRestored?(): void;
}

/**
 * Owns the GL context, the scale crossfade, and the frame loop.
 *
 * The renderer is deliberately ignorant of biology: it knows only that it has
 * an ordered list of stages, a 0..1 journey position, and that neighbouring
 * stages overlap while one hands off to the next.
 */
export class Renderer {
  private readonly gl: WebGL2RenderingContext;
  private caps: GLCaps;
  private readonly camera = new Camera();
  // Not readonly: a context loss invalidates every GPU object these hold, so
  // they are thrown away and rebuilt rather than reused.
  private post: PostProcess;
  private sceneTarget: RenderTarget;
  private readonly initialised = new Set<Stage>();

  private rafHandle = 0;
  private running = false;
  private lastFrameTime = 0;
  private elapsed = 0;

  /** Where the scroll wants to be, 0..1. */
  private targetProgress = 0;
  /** Where we actually are, eased toward the target every frame. */
  private smoothProgress = 0;

  private pointerX = 0;
  private pointerY = 0;
  private smoothPointerX = 0;
  private smoothPointerY = 0;

  /** 0 until the first resize, which adopts the display's ratio. */
  private dpr = 0;
  private maxDpr = 2;
  private width = 1;
  private height = 1;

  private quality = 1;
  private frameMs = 16.7;
  private statsTimer = 0;
  private currentStage = -1;

  private focusDistance = 6;
  private aperture = 9;

  private contextLost = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly stages: Stage[],
    private readonly callbacks: RendererCallbacks = {},
  ) {
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false, // Resolved by the post chain instead; MSAA on an HDR
      depth: true,      // target costs more than it buys at this pixel count.
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
      desynchronized: true,
    });
    if (!gl) {
      throw new Error('WebGL2 is not available in this browser.');
    }
    this.gl = gl;
    this.caps = probeCaps(gl);

    this.sceneTarget = new RenderTarget(gl, this.caps, {
      hdr: true,
      depth: true,
      depthTexture: true,
      filter: 'linear',
    });
    this.post = new PostProcess(gl, this.caps);

    canvas.addEventListener('webglcontextlost', this.handleContextLost);
    canvas.addEventListener('webglcontextrestored', this.handleContextRestored);
  }

  get stageCount(): number {
    return this.stages.length;
  }

  get progress(): number {
    return this.smoothProgress;
  }

  /** Set the journey target. The renderer eases toward it. */
  setProgress(value: number): void {
    this.targetProgress = clamp(value, 0, 1);
  }

  /** Jump without easing — used on first paint and deep links. */
  snapProgress(value: number): void {
    this.targetProgress = clamp(value, 0, 1);
    this.smoothProgress = this.targetProgress;
  }

  setPointer(x: number, y: number): void {
    this.pointerX = clamp(x, -1, 1);
    this.pointerY = clamp(y, -1, 1);
  }

  resize(cssWidth: number, cssHeight: number, devicePixelRatio: number): void {
    this.maxDpr = clamp(devicePixelRatio, 1, 2);
    // Start at the display's full ratio and let the quality controller walk it
    // down if the GPU can't keep up — starting at 1 would render the opening
    // seconds soft on every retina screen and only sharpen later.
    this.dpr = this.dpr === 0 ? this.maxDpr : Math.min(this.dpr, this.maxDpr);
    this.applySize(cssWidth, cssHeight);
  }

  private cssWidth = 1;
  private cssHeight = 1;

  private applySize(cssWidth: number, cssHeight: number): void {
    this.cssWidth = Math.max(1, cssWidth);
    this.cssHeight = Math.max(1, cssHeight);
    const width = Math.max(1, Math.round(this.cssWidth * this.dpr));
    const height = Math.max(1, Math.round(this.cssHeight * this.dpr));
    if (width === this.width && height === this.height) return;

    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.sceneTarget.resize(width, height);
    this.post.resize(width, height);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastFrameTime = performance.now();
    this.rafHandle = requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
    if (this.rafHandle) cancelAnimationFrame(this.rafHandle);
    this.rafHandle = 0;
  }

  dispose(): void {
    this.stop();
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this.handleContextRestored);
    for (const stage of this.initialised) stage.dispose();
    this.initialised.clear();
    this.post.dispose();
    this.sceneTarget.dispose();
  }

  private readonly handleContextLost = (event: Event): void => {
    // Without preventDefault the browser will not attempt a restore at all.
    event.preventDefault();
    this.contextLost = true;
    this.stop();
    this.initialised.clear();
    this.callbacks.onContextLost?.();
  };

  private readonly handleContextRestored = (): void => {
    this.contextLost = false;

    // Every GPU object from the old context is dead. Stages rebuild lazily
    // because `initialised` was cleared on loss, but the post chain and the
    // scene buffer are owned here and have to be replaced explicitly —
    // resizing the old ones would just call texImage2D on dead handles.
    this.post.dispose();
    this.sceneTarget.dispose();

    this.caps = probeCaps(this.gl);
    this.sceneTarget = new RenderTarget(this.gl, this.caps, {
      hdr: true,
      depth: true,
      depthTexture: true,
      filter: 'linear',
    });
    this.post = new PostProcess(this.gl, this.caps);

    this.width = 0;
    this.height = 0;
    this.applySize(this.cssWidth, this.cssHeight);
    this.callbacks.onContextRestored?.();
    this.start();
  };

  private readonly frame = (now: number): void => {
    if (!this.running || this.contextLost) return;
    this.rafHandle = requestAnimationFrame(this.frame);

    // Clamp dt so returning from a background tab doesn't teleport the scene.
    const rawDt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;
    const dt = clamp(rawDt, 0.0005, 0.05);
    this.elapsed += dt;

    this.trackPerformance(rawDt * 1000, dt);
    this.render(dt);
  };

  /**
   * Adaptive quality.
   *
   * Two dials, pulled in order: instance density first (cheap to change, barely
   * visible), then resolution. Both recover slowly and drop fast, so a single
   * hitch doesn't permanently degrade the image but a sustained stall does get
   * relief within about a second.
   */
  private trackPerformance(frameMs: number, dt: number): void {
    this.frameMs = mix(this.frameMs, clamp(frameMs, 1, 100), 0.08);

    if (this.frameMs > 24) {
      this.quality = Math.max(0.45, this.quality - dt * 0.6);
      if (this.quality <= 0.5 && this.dpr > 1) {
        this.dpr = Math.max(1, this.dpr - dt * 0.5);
        this.applySize(this.cssWidth, this.cssHeight);
      }
    } else if (this.frameMs < 14) {
      this.quality = Math.min(1, this.quality + dt * 0.25);
      if (this.quality >= 0.99 && this.dpr < this.maxDpr) {
        this.dpr = Math.min(this.maxDpr, this.dpr + dt * 0.2);
        this.applySize(this.cssWidth, this.cssHeight);
      }
    }

    this.statsTimer += dt;
    if (this.statsTimer > 0.4) {
      this.statsTimer = 0;
      this.callbacks.onStats?.(1000 / Math.max(this.frameMs, 1e-3), this.quality);
    }
  }

  private render(dt: number): void {
    const gl = this.gl;

    // Ease the journey position. This single lerp is what turns a notchy wheel
    // event into the continuous glide between scales.
    this.smoothProgress = damp(this.smoothProgress, this.targetProgress, 4.2, dt);
    this.smoothPointerX = damp(this.smoothPointerX, this.pointerX, 6, dt);
    this.smoothPointerY = damp(this.smoothPointerY, this.pointerY, 6, dt);

    this.camera.update(
      this.width / this.height,
      this.smoothPointerX,
      this.smoothPointerY,
      this.elapsed,
      dt,
    );

    const count = this.stages.length;
    const position = this.smoothProgress * count;

    const dominant = clamp(Math.floor(position), 0, count - 1);
    if (dominant !== this.currentStage) {
      this.currentStage = dominant;
      this.callbacks.onStageChange?.(dominant);
    }
    this.callbacks.onProgress?.(this.smoothProgress);

    this.sceneTarget.bind();
    gl.clearColor(0.006, 0.011, 0.024, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let focusAccum = 0;
    let apertureAccum = 0;
    let weightAccum = 0;

    // Draw deepest-first: the scale we are falling *into* sits behind the one
    // we are leaving, which is what sells the dive as we pass through it.
    for (let i = count - 1; i >= 0; i--) {
      const stage = this.stages[i]!;
      const local = position - i;
      if (local < -0.5 || local > 1.55) continue;

      const fadeIn = i === 0 ? 1 : smoothstep(-0.45, -0.02, local);
      const fadeOut = i === count - 1 ? 1 : 1 - smoothstep(1.02, 1.5, local);
      const alpha = fadeIn * fadeOut;
      if (alpha <= 0.002) continue;

      if (!this.initialised.has(stage)) {
        stage.init(gl);
        this.initialised.add(stage);
      }

      const ctx: FrameContext = {
        gl,
        camera: this.camera,
        time: this.elapsed,
        dt,
        local,
        alpha,
        progress: this.smoothProgress,
        pointerX: this.smoothPointerX,
        pointerY: this.smoothPointerY,
        quality: this.quality,
        width: this.width,
        height: this.height,
      };

      this.resetDrawState();
      // Each scale gets its own depth range: they occupy the same world space
      // at wildly different sizes, so sharing a depth buffer would z-fight.
      gl.clear(gl.DEPTH_BUFFER_BIT);

      stage.update(ctx);
      stage.render(ctx);

      const hint = stage.focus?.(ctx);
      if (hint) {
        focusAccum += hint.distance * alpha;
        apertureAccum += hint.aperture * alpha;
        weightAccum += alpha;
      }
    }

    if (weightAccum > 0.001) {
      this.focusDistance = damp(this.focusDistance, focusAccum / weightAccum, 5, dt);
      this.aperture = damp(this.aperture, apertureAccum / weightAccum, 5, dt);
    }

    this.resetDrawState();
    this.post.render(this.sceneTarget, {
      time: this.elapsed,
      exposure: 1.06,
      bloomIntensity: 0.52,
      bloomThreshold: 0.72,
      aberration: 0.0022,
      vignette: 0.65,
      grain: 0.028,
      focusDistance: this.focusDistance,
      aperture: this.aperture,
      near: this.camera.near,
      far: this.camera.far,
    });
  }

  /** Return GL to the state stages are written to expect. */
  private resetDrawState(): void {
    const gl = this.gl;
    gl.viewport(0, 0, this.width, this.height);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
  }
}
