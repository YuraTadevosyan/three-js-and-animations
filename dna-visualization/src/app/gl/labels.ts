import { FRAG_HEAD, VERT_HEAD } from './chunks';
import type { MeshData } from './geometry';
import type { Mat4 } from './math';
import { ATTR, Mesh } from './mesh';
import { Program } from './program';
import type { FrameContext } from './stage';

/**
 * Billboarded text, drawn from a canvas-generated atlas.
 *
 * The interactome needs its nodes named to mean anything, and DOM labels would
 * mean projecting sixteen positions to screen coordinates and writing signals
 * every frame — which in a zoneless app is sixteen change-detection triggers
 * per frame for text that only moves. Rasterising the names once into a
 * texture keeps the whole thing on the GPU.
 */

const ROW_HEIGHT = 44;
const PADDING = 8;
const FONT = '600 24px "IBM Plex Sans", system-ui, -apple-system, sans-serif';

const LABEL_VS = /* glsl */ `${VERT_HEAD}
layout(location = ${ATTR.position}) in vec3 aCorner;
layout(location = ${ATTR.instance0}) in vec4 aAnchor; // xyz = world position, w = scale
layout(location = ${ATTR.instance1}) in vec4 aRect;   // uv rect in the atlas
layout(location = ${ATTR.instance2}) in vec4 aStyle;  // rgb tint, a = opacity

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uViewProjection;
uniform float uAtlasAspect;

out vec2 vUv;
out vec4 vStyle;

void main() {
  vec4 world = uModel * vec4(aAnchor.xyz, 1.0);

  vec3 right = vec3(uView[0][0], uView[1][0], uView[2][0]);
  vec3 up    = vec3(uView[0][1], uView[1][1], uView[2][1]);

  // aRect.zw is the label's size in *normalised* atlas units, so recovering
  // the pixel aspect needs the atlas's own aspect folded back in. Without this
  // every label would stretch to the same width regardless of its length.
  float width = aAnchor.w * (aRect.z / aRect.w) * uAtlasAspect;
  world.xyz += right * (aCorner.x * width) + up * (aCorner.y * aAnchor.w);

  vUv = vec2(aRect.x + (aCorner.x + 0.5) * aRect.z, aRect.y + (0.5 - aCorner.y) * aRect.w);
  vStyle = aStyle;

  gl_Position = uViewProjection * world;
}
`;

const LABEL_FS = /* glsl */ `${FRAG_HEAD}
in vec2 vUv;
in vec4 vStyle;
out vec4 fragColor;

uniform sampler2D uAtlas;

void main() {
  float mask = texture(uAtlas, vUv).a;
  if (mask < 0.02) discard;

  // Additive so labels read as emissive readouts and pick up bloom.
  fragColor = vec4(vStyle.rgb * mask * vStyle.a, 1.0);
}
`;

interface AtlasEntry {
  /** Normalised uv rect: x, y, width, height. */
  rect: [number, number, number, number];
}

function quad(): MeshData {
  return {
    positions: new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]),
    normals: new Float32Array(12),
    indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
  };
}

export class LabelSet {
  private program: Program | null = null;
  private mesh: Mesh | null = null;
  private texture: WebGLTexture | null = null;
  private readonly entries = new Map<string, AtlasEntry>();
  private count = 0;
  private atlasWidth = 1;
  private atlasHeight = 1;
  private textureOwner: WebGL2RenderingContext | null = null;

  constructor(private readonly labels: readonly string[]) {}

  init(gl: WebGL2RenderingContext): void {
    this.dispose();
    this.textureOwner = gl;
    this.program = new Program(gl, LABEL_VS, LABEL_FS, 'labels');
    this.mesh = Mesh.fromData(gl, quad(), { position: ATTR.position });
    this.mesh.attribute('anchor', ATTR.instance0, new Float32Array(4), 4, 1);
    this.mesh.attribute('rect', ATTR.instance1, new Float32Array(4), 4, 1);
    this.mesh.attribute('style', ATTR.instance2, new Float32Array(4), 4, 1);
    this.buildAtlas(gl);
  }

  private buildAtlas(gl: WebGL2RenderingContext): void {
    const canvas = document.createElement('canvas');
    const measureContext = canvas.getContext('2d');
    if (!measureContext) return;

    measureContext.font = FONT;
    const widths = this.labels.map((label) => Math.ceil(measureContext.measureText(label).width) + PADDING * 2);
    const maxWidth = Math.max(64, ...widths);

    // One label per row: simple, and sixteen short strings fit comfortably.
    canvas.width = nextPowerOfTwo(maxWidth);
    canvas.height = nextPowerOfTwo(ROW_HEIGHT * this.labels.length);
    this.atlasWidth = canvas.width;
    this.atlasHeight = canvas.height;

    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = FONT;
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.fillStyle = '#ffffff';

    this.entries.clear();
    this.labels.forEach((label, i) => {
      const y = i * ROW_HEIGHT;
      const width = widths[i]!;
      context.fillText(label, canvas.width / 2, y + ROW_HEIGHT / 2);
      this.entries.set(label, {
        rect: [
          (canvas.width / 2 - width / 2) / canvas.width,
          y / canvas.height,
          width / canvas.width,
          ROW_HEIGHT / canvas.height,
        ],
      });
    });

    const texture = gl.createTexture();
    if (!texture) return;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
    this.texture = texture;
  }

  /** Aspect ratio of a label's rasterised box, for sizing its billboard. */
  aspectOf(label: string): number {
    const entry = this.entries.get(label);
    if (!entry) return 1;
    return (entry.rect[2] * this.atlasWidth) / (entry.rect[3] * this.atlasHeight);
  }

  /**
   * Position the labels. Each placement is a world anchor, a height, a tint
   * and an opacity — call once per frame for animated fades.
   */
  place(
    placements: ReadonlyArray<{
      label: string;
      x: number;
      y: number;
      z: number;
      size: number;
      color: readonly [number, number, number];
      opacity: number;
    }>,
  ): void {
    if (!this.mesh) return;
    const anchors = new Float32Array(placements.length * 4);
    const rects = new Float32Array(placements.length * 4);
    const styles = new Float32Array(placements.length * 4);

    let written = 0;
    for (const placement of placements) {
      const entry = this.entries.get(placement.label);
      if (!entry) continue;
      const i = written++;
      anchors[i * 4] = placement.x;
      anchors[i * 4 + 1] = placement.y;
      anchors[i * 4 + 2] = placement.z;
      anchors[i * 4 + 3] = placement.size;
      rects.set(entry.rect, i * 4);
      styles[i * 4] = placement.color[0];
      styles[i * 4 + 1] = placement.color[1];
      styles[i * 4 + 2] = placement.color[2];
      styles[i * 4 + 3] = placement.opacity;
    }

    this.count = written;
    this.mesh.attribute('anchor', ATTR.instance0, anchors, 4, 1);
    this.mesh.attribute('rect', ATTR.instance1, rects, 4, 1);
    this.mesh.attribute('style', ATTR.instance2, styles, 4, 1);
  }

  draw(ctx: FrameContext, model: Mat4): void {
    if (!this.program || !this.mesh || !this.texture || this.count === 0) return;
    const gl = ctx.gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.depthMask(false);
    gl.disable(gl.CULL_FACE);

    this.program.use()
      .m4('uModel', model)
      .m4('uView', ctx.camera.view)
      .m4('uViewProjection', ctx.camera.viewProjection)
      .f('uAtlasAspect', this.atlasWidth / this.atlasHeight)
      .tex('uAtlas', 0, this.texture);
    this.mesh.draw(this.count);

    gl.depthMask(true);
    gl.enable(gl.CULL_FACE);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  dispose(): void {
    this.program?.dispose();
    this.program = null;
    this.mesh?.dispose();
    this.mesh = null;
    if (this.texture) {
      // The context owns the texture; deleting through the same context is
      // safe even after a loss, and a no-op if it is already gone.
      this.textureOwner?.deleteTexture(this.texture);
      this.texture = null;
    }
    this.entries.clear();
    this.count = 0;
    this.textureOwner = null;
  }
}

function nextPowerOfTwo(value: number): number {
  let result = 1;
  while (result < value) result *= 2;
  return result;
}
