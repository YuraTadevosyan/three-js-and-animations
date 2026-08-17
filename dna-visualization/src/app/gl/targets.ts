/**
 * Offscreen render targets for the HDR scene buffer and the bloom chain.
 */

export interface GLCaps {
  /** Half-float colour attachments are renderable (needed for HDR + bloom). */
  halfFloat: boolean;
  /** Linear filtering works on those attachments (needed for the blur chain). */
  halfFloatLinear: boolean;
  maxSamples: number;
}

/**
 * Probe the extensions the post chain wants.
 *
 * WebGL2 exposes RGBA16F as a *texture* format unconditionally, but rendering
 * into one needs EXT_color_buffer_half_float (or the full-float variant), and
 * filtering one needs OES_texture_float_linear. Both are near-universal on
 * desktop and common on mobile; when either is missing we fall back to RGBA8
 * and simply lose highlight headroom rather than the whole scene.
 */
export function probeCaps(gl: WebGL2RenderingContext): GLCaps {
  const halfFloat =
    !!gl.getExtension('EXT_color_buffer_half_float') || !!gl.getExtension('EXT_color_buffer_float');
  const halfFloatLinear = !!gl.getExtension('OES_texture_float_linear') || halfFloat;
  return {
    halfFloat,
    halfFloatLinear,
    maxSamples: gl.getParameter(gl.MAX_SAMPLES) as number,
  };
}

export interface TargetOptions {
  /** Use RGBA16F instead of RGBA8, when supported. */
  hdr?: boolean;
  /** Attach a depth buffer. Set `depthTexture` to sample it later. */
  depth?: boolean;
  /** Make the depth attachment a sampleable texture (for depth-of-field). */
  depthTexture?: boolean;
  filter?: 'nearest' | 'linear';
  wrap?: number;
}

export class RenderTarget {
  readonly framebuffer: WebGLFramebuffer;
  texture: WebGLTexture;
  depth: WebGLTexture | WebGLRenderbuffer | null = null;
  width = 0;
  height = 0;

  private readonly internalFormat: number;
  private readonly type: number;
  private readonly filter: number;
  private readonly wrap: number;

  constructor(
    private readonly gl: WebGL2RenderingContext,
    caps: GLCaps,
    private readonly options: TargetOptions = {},
  ) {
    const wantsHdr = !!options.hdr && caps.halfFloat;
    this.internalFormat = wantsHdr ? gl.RGBA16F : gl.RGBA8;
    this.type = wantsHdr ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;

    const wantsLinear = options.filter !== 'nearest';
    // Never request LINEAR on a half-float texture the driver can't filter.
    this.filter = wantsLinear && (!wantsHdr || caps.halfFloatLinear) ? gl.LINEAR : gl.NEAREST;
    this.wrap = options.wrap ?? gl.CLAMP_TO_EDGE;

    const framebuffer = gl.createFramebuffer();
    const texture = gl.createTexture();
    if (!framebuffer || !texture) throw new Error('render target allocation failed');
    this.framebuffer = framebuffer;
    this.texture = texture;
  }

  resize(width: number, height: number): void {
    width = Math.max(1, width | 0);
    height = Math.max(1, height | 0);
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;

    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.internalFormat, width, height, 0, gl.RGBA, this.type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrap);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);

    if (this.options.depth) {
      if (this.options.depthTexture) {
        if (!(this.depth instanceof WebGLTexture)) {
          if (this.depth) gl.deleteRenderbuffer(this.depth as WebGLRenderbuffer);
          this.depth = gl.createTexture();
        }
        gl.bindTexture(gl.TEXTURE_2D, this.depth as WebGLTexture);
        gl.texImage2D(
          gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, width, height, 0,
          gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depth as WebGLTexture, 0,
        );
      } else {
        if (!this.depth) this.depth = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depth as WebGLRenderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, width, height);
        gl.framebufferRenderbuffer(
          gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depth as WebGLRenderbuffer,
        );
      }
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  /** Bind for drawing and set the viewport to match. */
  bind(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, this.width, this.height);
  }

  dispose(): void {
    const gl = this.gl;
    gl.deleteFramebuffer(this.framebuffer);
    gl.deleteTexture(this.texture);
    if (this.depth instanceof WebGLTexture) gl.deleteTexture(this.depth);
    else if (this.depth) gl.deleteRenderbuffer(this.depth);
    this.depth = null;
  }
}
