import { FRAG_HEAD, FULLSCREEN_VS, SIMPLEX } from './chunks';
import { drawTriangle } from './post';
import { Program } from './program';

const BACKDROP_FS = /* glsl */ `${FRAG_HEAD}
${SIMPLEX}

in vec2 vUv;
out vec4 fragColor;

uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uGlow;
uniform float uTime;
uniform float uAlpha;
uniform float uDensity;
uniform float uAspect;
uniform vec2 uGlowPos;

void main() {
  vec2 uv = vUv;
  vec3 base = mix(uBottom, uTop, smoothstep(0.0, 1.0, uv.y));

  // Two noise layers drifting at different rates: the slow one gives large
  // soft masses, the fast one keeps the field from ever looking static.
  vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);
  float slow = fbm(vec3(p * 1.6, uTime * 0.014), 4);
  float fast = fbm(vec3(p * 4.1 + 11.3, uTime * 0.041), 3);
  float cloud = smoothstep(-0.35, 0.75, slow * 0.75 + fast * 0.25);

  base += uGlow * cloud * uDensity * 0.35;

  // A soft off-centre light source so the frame has a direction.
  float d = length((p - uGlowPos) * vec2(1.0, 1.25));
  base += uGlow * exp(-d * 2.4) * 0.22;

  // Keep the corners dark; the graded vignette later reinforces this.
  base *= 1.0 - 0.35 * smoothstep(0.25, 0.95, length(p) * 1.35);

  fragColor = vec4(base, uAlpha);
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
 */
export class Backdrop {
  private program: Program | null = null;

  init(gl: WebGL2RenderingContext): void {
    this.program?.dispose();
    this.program = new Program(gl, FULLSCREEN_VS, BACKDROP_FS, 'backdrop');
  }

  render(
    gl: WebGL2RenderingContext,
    palette: BackdropPalette,
    time: number,
    alpha: number,
    aspect: number,
  ): void {
    if (!this.program) return;

    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.program.use()
      .v3a('uTop', palette.top)
      .v3a('uBottom', palette.bottom)
      .v3a('uGlow', palette.glow)
      .f('uDensity', palette.density)
      .v2('uGlowPos', palette.glowX, palette.glowY)
      .f('uTime', time)
      .f('uAlpha', alpha)
      .f('uAspect', aspect);
    drawTriangle(gl);

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
  }

  dispose(): void {
    this.program?.dispose();
    this.program = null;
  }
}
