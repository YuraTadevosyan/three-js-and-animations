import { FRAG_HEAD, FULLSCREEN_VS, HASH, TONEMAP } from './chunks';
import { Program } from './program';
import { RenderTarget, type GLCaps } from './targets';

/**
 * The post chain: bloom, depth-of-field, then grade.
 *
 * Bloom is the Call-of-Duty/Jimenez scheme — a soft-knee prefilter, a 13-tap
 * downsample pyramid, then a 9-tap tent upsample accumulated back up. It costs
 * more passes than one big gaussian but it is the reason the glow is smooth
 * instead of blocky: every level is filtered on the way down *and* on the way
 * up, so there is no visible ringing where a bright base pair meets black.
 */
const MIP_COUNT = 6;

const PREFILTER_FS = /* glsl */ `${FRAG_HEAD}
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uScene;
uniform float uThreshold;
uniform float uKnee;

void main() {
  vec3 c = texture(uScene, vUv).rgb;

  // Soft knee: fade contribution in across a band around the threshold rather
  // than clipping at it, so a highlight drifting past the cutoff doesn't pop.
  float brightness = max(c.r, max(c.g, c.b));
  float soft = brightness - uThreshold + uKnee;
  soft = clamp(soft, 0.0, 2.0 * uKnee);
  soft = soft * soft / (4.0 * uKnee + 1e-5);
  float weight = max(soft, brightness - uThreshold) / max(brightness, 1e-5);

  fragColor = vec4(c * weight, 1.0);
}
`;

const DOWNSAMPLE_FS = /* glsl */ `${FRAG_HEAD}
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uTexel;

void main() {
  vec2 t = uTexel;

  vec3 a = texture(uSource, vUv + t * vec2(-2.0,  2.0)).rgb;
  vec3 b = texture(uSource, vUv + t * vec2( 0.0,  2.0)).rgb;
  vec3 c = texture(uSource, vUv + t * vec2( 2.0,  2.0)).rgb;
  vec3 d = texture(uSource, vUv + t * vec2(-2.0,  0.0)).rgb;
  vec3 e = texture(uSource, vUv).rgb;
  vec3 f = texture(uSource, vUv + t * vec2( 2.0,  0.0)).rgb;
  vec3 g = texture(uSource, vUv + t * vec2(-2.0, -2.0)).rgb;
  vec3 h = texture(uSource, vUv + t * vec2( 0.0, -2.0)).rgb;
  vec3 i = texture(uSource, vUv + t * vec2( 2.0, -2.0)).rgb;
  vec3 j = texture(uSource, vUv + t * vec2(-1.0,  1.0)).rgb;
  vec3 k = texture(uSource, vUv + t * vec2( 1.0,  1.0)).rgb;
  vec3 l = texture(uSource, vUv + t * vec2(-1.0, -1.0)).rgb;
  vec3 m = texture(uSource, vUv + t * vec2( 1.0, -1.0)).rgb;

  vec3 result = e * 0.125;
  result += (a + c + g + i) * 0.03125;
  result += (b + d + f + h) * 0.0625;
  result += (j + k + l + m) * 0.125;

  fragColor = vec4(result, 1.0);
}
`;

const UPSAMPLE_FS = /* glsl */ `${FRAG_HEAD}
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uTexel;
uniform float uRadius;

void main() {
  vec2 t = uTexel * uRadius;

  vec3 a = texture(uSource, vUv + t * vec2(-1.0,  1.0)).rgb;
  vec3 b = texture(uSource, vUv + t * vec2( 0.0,  1.0)).rgb;
  vec3 c = texture(uSource, vUv + t * vec2( 1.0,  1.0)).rgb;
  vec3 d = texture(uSource, vUv + t * vec2(-1.0,  0.0)).rgb;
  vec3 e = texture(uSource, vUv).rgb;
  vec3 f = texture(uSource, vUv + t * vec2( 1.0,  0.0)).rgb;
  vec3 g = texture(uSource, vUv + t * vec2(-1.0, -1.0)).rgb;
  vec3 h = texture(uSource, vUv + t * vec2( 0.0, -1.0)).rgb;
  vec3 i = texture(uSource, vUv + t * vec2( 1.0, -1.0)).rgb;

  vec3 result = e * 4.0;
  result += (b + d + f + h) * 2.0;
  result += (a + c + g + i);
  fragColor = vec4(result / 16.0, 1.0);
}
`;

/** Separable gaussian used only for the out-of-focus copy of the scene. */
const BLUR_FS = /* glsl */ `${FRAG_HEAD}
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uDirection;

void main() {
  // 9-tap gaussian collapsed to 5 texture fetches using linear-filter tricks.
  const float o1 = 1.3846153846;
  const float o2 = 3.2307692308;
  const float w0 = 0.2270270270;
  const float w1 = 0.3162162162;
  const float w2 = 0.0702702703;

  vec3 result = texture(uSource, vUv).rgb * w0;
  result += texture(uSource, vUv + uDirection * o1).rgb * w1;
  result += texture(uSource, vUv - uDirection * o1).rgb * w1;
  result += texture(uSource, vUv + uDirection * o2).rgb * w2;
  result += texture(uSource, vUv - uDirection * o2).rgb * w2;

  fragColor = vec4(result, 1.0);
}
`;

const COMPOSITE_FS = /* glsl */ `${FRAG_HEAD}
${HASH}
${TONEMAP}

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform sampler2D uBlurred;
uniform sampler2D uDepth;

uniform float uTime;
uniform float uBloomIntensity;
uniform float uExposure;
uniform float uAberration;
uniform float uVignette;
uniform float uGrain;
uniform float uFocusDistance;
uniform float uAperture;
uniform float uNear;
uniform float uFar;
uniform vec2 uResolution;

void main() {
  vec2 uv = vUv;
  vec2 centred = uv - 0.5;
  float r2 = dot(centred, centred);

  // Circle of confusion from linear view depth. Sky/background (depth 1) is
  // pinned to full blur rather than being treated as an object at the far plane.
  float rawDepth = texture(uDepth, uv).r;
  float viewZ = linearizeDepth(rawDepth, uNear, uFar);
  float coc = clamp(abs(viewZ - uFocusDistance) / max(uAperture, 1e-3), 0.0, 1.0);
  coc = rawDepth >= 0.9999 ? max(coc, 0.55) : coc;
  coc = smoothstep(0.0, 1.0, coc);

  // Lateral chromatic aberration: the offset grows with radius, so the centre
  // of frame — where the subject is — stays clean.
  vec2 ca = centred * uAberration * (0.35 + r2);

  vec3 sharp;
  sharp.r = texture(uScene, uv + ca).r;
  sharp.g = texture(uScene, uv).g;
  sharp.b = texture(uScene, uv - ca).b;

  vec3 soft;
  soft.r = texture(uBlurred, uv + ca).r;
  soft.g = texture(uBlurred, uv).g;
  soft.b = texture(uBlurred, uv - ca).b;

  vec3 color = mix(sharp, soft, coc);
  color += texture(uBloom, uv).rgb * uBloomIntensity;

  color *= uExposure;
  color = acesFilmic(color);

  float vignette = 1.0 - smoothstep(0.18, 0.95, r2 * 2.0);
  color *= mix(1.0, vignette, uVignette);

  // Grain in sRGB space, scaled down in highlights so it reads as sensor noise
  // rather than dirt on the lens.
  float grain = hash13(vec3(gl_FragCoord.xy, uTime * 60.0)) - 0.5;
  color = linearToSrgb(color);
  color += grain * uGrain * (1.0 - dot(color, vec3(0.2126, 0.7152, 0.0722)) * 0.7);

  fragColor = vec4(color, 1.0);
}
`;

export interface CompositeParams {
  exposure: number;
  bloomIntensity: number;
  bloomThreshold: number;
  aberration: number;
  vignette: number;
  grain: number;
  focusDistance: number;
  aperture: number;
  near: number;
  far: number;
  time: number;
}

export class PostProcess {
  private readonly prefilter: Program;
  private readonly downsample: Program;
  private readonly upsample: Program;
  private readonly blur: Program;
  private readonly composite: Program;

  private readonly mips: RenderTarget[] = [];
  private readonly blurA: RenderTarget;
  private readonly blurB: RenderTarget;

  private width = 1;
  private height = 1;

  constructor(private readonly gl: WebGL2RenderingContext, caps: GLCaps) {
    this.prefilter = new Program(gl, FULLSCREEN_VS, PREFILTER_FS, 'post:prefilter');
    this.downsample = new Program(gl, FULLSCREEN_VS, DOWNSAMPLE_FS, 'post:downsample');
    this.upsample = new Program(gl, FULLSCREEN_VS, UPSAMPLE_FS, 'post:upsample');
    this.blur = new Program(gl, FULLSCREEN_VS, BLUR_FS, 'post:blur');
    this.composite = new Program(gl, FULLSCREEN_VS, COMPOSITE_FS, 'post:composite');

    for (let i = 0; i < MIP_COUNT; i++) {
      this.mips.push(new RenderTarget(gl, caps, { hdr: true, filter: 'linear' }));
    }
    this.blurA = new RenderTarget(gl, caps, { hdr: true, filter: 'linear' });
    this.blurB = new RenderTarget(gl, caps, { hdr: true, filter: 'linear' });
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    for (let i = 0; i < MIP_COUNT; i++) {
      // Mip 0 is half resolution; each level halves again, floored at 1px.
      const divisor = 2 << i;
      this.mips[i]!.resize(Math.max(1, Math.floor(width / divisor)), Math.max(1, Math.floor(height / divisor)));
    }
    this.blurA.resize(Math.max(1, width >> 1), Math.max(1, height >> 1));
    this.blurB.resize(Math.max(1, width >> 1), Math.max(1, height >> 1));
  }

  /** Run the chain and write the graded result to the default framebuffer. */
  render(scene: RenderTarget, params: CompositeParams): void {
    const gl = this.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.depthMask(false);

    // 1. Isolate highlights into mip 0.
    const first = this.mips[0]!;
    first.bind();
    this.prefilter.use()
      .f('uThreshold', params.bloomThreshold)
      .f('uKnee', 0.55)
      .tex('uScene', 0, scene.texture);
    drawTriangle(gl);

    // 2. Downsample pyramid.
    for (let i = 1; i < MIP_COUNT; i++) {
      const source = this.mips[i - 1]!;
      const target = this.mips[i]!;
      target.bind();
      this.downsample.use()
        .v2('uTexel', 1 / source.width, 1 / source.height)
        .tex('uSource', 0, source.texture);
      drawTriangle(gl);
    }

    // 3. Tent upsample, accumulating each level additively into the one above.
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    for (let i = MIP_COUNT - 1; i > 0; i--) {
      const source = this.mips[i]!;
      const target = this.mips[i - 1]!;
      target.bind();
      this.upsample.use()
        .v2('uTexel', 1 / source.width, 1 / source.height)
        .f('uRadius', 1.0)
        .tex('uSource', 0, source.texture);
      drawTriangle(gl);
    }
    gl.disable(gl.BLEND);

    // 4. Half-res blurred copy of the whole scene, for depth of field.
    this.blurA.bind();
    this.blur.use()
      .v2('uDirection', 1 / this.blurA.width, 0)
      .tex('uSource', 0, scene.texture);
    drawTriangle(gl);

    this.blurB.bind();
    this.blur.use()
      .v2('uDirection', 0, 1 / this.blurB.height)
      .tex('uSource', 0, this.blurA.texture);
    drawTriangle(gl);

    // 5. Grade to the canvas.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    this.composite.use()
      .f('uTime', params.time)
      .f('uBloomIntensity', params.bloomIntensity)
      .f('uExposure', params.exposure)
      .f('uAberration', params.aberration)
      .f('uVignette', params.vignette)
      .f('uGrain', params.grain)
      .f('uFocusDistance', params.focusDistance)
      .f('uAperture', params.aperture)
      .f('uNear', params.near)
      .f('uFar', params.far)
      .v2('uResolution', this.width, this.height)
      .tex('uScene', 0, scene.texture)
      .tex('uBloom', 1, this.mips[0]!.texture)
      .tex('uBlurred', 2, this.blurB.texture)
      .tex('uDepth', 3, scene.depth instanceof WebGLTexture ? scene.depth : null);
    drawTriangle(gl);

    gl.depthMask(true);
    gl.enable(gl.DEPTH_TEST);
  }

  dispose(): void {
    this.prefilter.dispose();
    this.downsample.dispose();
    this.upsample.dispose();
    this.blur.dispose();
    this.composite.dispose();
    for (const mip of this.mips) mip.dispose();
    this.blurA.dispose();
    this.blurB.dispose();
  }
}

/** Draw the attribute-less fullscreen triangle from {@link FULLSCREEN_VS}. */
export function drawTriangle(gl: WebGL2RenderingContext): void {
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
