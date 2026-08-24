import { FRAG_HEAD, FULLSCREEN_VS, SIMPLEX } from './chunks';
import { drawTriangle } from './post';
import { Program } from './program';
import type { FrameContext } from './stage';
import { probeCaps, RenderTarget } from './targets';

/** The backdrop renders at 1/RESOLUTION_DIVISOR of the drawing buffer. */
const RESOLUTION_DIVISOR = 4;

const BACKDROP_FS = /* glsl */ `${FRAG_HEAD}
${SIMPLEX}

in vec2 vUv;
out vec4 fragColor;

uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uGlow;
uniform float uTime;
uniform float uDensity;
uniform float uAspect;
uniform vec2 uGlowPos;

void main() {
  vec2 uv = vUv;
  vec3 base = mix(uBottom, uTop, smoothstep(0.0, 1.0, uv.y));

  // Two noise layers drifting at different rates: the slow one gives large
  // soft masses, the fast one keeps the field from ever looking static.
  vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);
  float slow = fbm(vec3(p * 1.6, uTime * 0.014), 3);
  float fast = fbm(vec3(p * 4.1 + 11.3, uTime * 0.041), 2);
  float cloud = smoothstep(-0.35, 0.75, slow * 0.75 + fast * 0.25);

  // These coefficients are deliberately small. ACES plus the sRGB transfer
  // lift dark values hard on the way to the screen — a linear 0.4 here comes
  // out around sRGB 0.76 — so a backdrop that looks conservative in linear
  // space still reads as a bright wash, and overlay text dies on it.
  base += uGlow * cloud * uDensity * 0.15;

  // A soft off-centre light source so the frame has a direction.
  float d = length((p - uGlowPos) * vec2(1.0, 1.25));
  base += uGlow * exp(-d * 2.4) * 0.09;

  // Keep the corners dark; the graded vignette later reinforces this.
  base *= 1.0 - 0.35 * smoothstep(0.25, 0.95, length(p) * 1.35);

  fragColor = vec4(base, 1.0);
}
`;

const UPSCALE_FS = /* glsl */ `${FRAG_HEAD}
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uAlpha;

void main() {
  fragColor = vec4(texture(uSource, vUv).rgb, uAlpha);
}
`;

export interface BackdropPalette {
  top: readonly [number, number, number];
  bottom: readonly [number, number, number];
  glow: readonly [number, number, number];
  density: number;
  glowX: number;
  glowY: number;
}

/**
 * The full-frame environment behind a stage.
 *
 * Drawn per stage rather than once globally: each scale carries its own colour
 * temperature, and fading a stage's backdrop with the stage itself is what
 * makes the palette shift continuously instead of switching at a boundary.
 *
 * Rendered at a quarter of the drawing buffer and upscaled. The content is a
 * gradient plus low-frequency noise, so quarter resolution is visually free —
 * but at full resolution its five simplex-noise evaluations per pixel, run
 * once per visible stage, are by far the most expensive thing in the frame.
 * On a retina display that alone can miss the frame budget, at which point the
 * quality controller starts shedding resolution and the *whole image* softens.
 */
export class Backdrop {
  private program: Program | null = null;
  private upscale: Program | null = null;
  private target: RenderTarget | null = null;

  init(gl: WebGL2RenderingContext): void {
    this.dispose();
    this.program = new Program(gl, FULLSCREEN_VS, BACKDROP_FS, 'backdrop');
    this.upscale = new Program(gl, FULLSCREEN_VS, UPSCALE_FS, 'backdrop:upscale');
    // Linear filtering does the smoothing on the way back up.
    this.target = new RenderTarget(gl, probeCaps(gl), { hdr: true, filter: 'linear' });
  }

  render(ctx: FrameContext, palette: BackdropPalette): void {
    const { gl } = ctx;
    if (!this.program || !this.upscale || !this.target) return;

    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);

    // --- Pass 1: the noise, at reduced resolution -------------------------
    this.target.resize(
      Math.max(4, Math.floor(ctx.width / RESOLUTION_DIVISOR)),
      Math.max(4, Math.floor(ctx.height / RESOLUTION_DIVISOR)),
    );
    this.target.bind();
    gl.disable(gl.BLEND);

    this.program.use()
      .v3a('uTop', palette.top)
      .v3a('uBottom', palette.bottom)
      .v3a('uGlow', palette.glow)
      .f('uDensity', palette.density)
      .v2('uGlowPos', palette.glowX, palette.glowY)
      .f('uTime', ctx.time)
      .f('uAspect', ctx.width / ctx.height);
    drawTriangle(gl);

    // --- Pass 2: back into the scene, faded by the stage crossfade --------
    gl.bindFramebuffer(gl.FRAMEBUFFER, ctx.target);
    gl.viewport(0, 0, ctx.width, ctx.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.upscale.use()
      .f('uAlpha', ctx.alpha)
      .tex('uSource', 0, this.target.texture);
    drawTriangle(gl);

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
  }

  dispose(): void {
    this.program?.dispose();
    this.program = null;
    this.upscale?.dispose();
    this.upscale = null;
    this.target?.dispose();
    this.target = null;
  }
}
