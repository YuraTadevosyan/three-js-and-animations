import { FRAG_HEAD, SHADING, TRANSFORM, VERT_HEAD } from './chunks';
import { cylinder, icosphere } from './geometry';
import type { Mat4 } from './math';
import { ATTR, Mesh } from './mesh';
import { Program } from './program';
import type { FrameContext } from './stage';

/**
 * Instanced spheres and instanced bonds — the two primitives almost every
 * molecular scene in this app is built from.
 *
 * Both batches take a flat Float32Array of instance data and upload it whole.
 * Scenes that never change (a folded protein, a chromosome) upload once at
 * init; scenes that animate on the CPU (the interactome layout) re-upload a
 * pre-sized array each frame without reallocating.
 */

/** Floats per sphere: centre.xyz, radius, colour.rgb, glow. */
export const ATOM_STRIDE = 8;
/** Floats per bond: start.xyz, radius, end.xyz, glow, colour.rgb, alpha. */
export const BOND_STRIDE = 12;

const ATOM_VS = /* glsl */ `${VERT_HEAD}
layout(location = ${ATTR.position}) in vec3 aPosition;
layout(location = ${ATTR.instance0}) in vec4 aSphere;
layout(location = ${ATTR.instance1}) in vec4 aColor;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;

out vec3 vNormal;
out vec3 vView;
out vec3 vColor;
out float vGlow;

void main() {
  vec3 local = aSphere.xyz + aPosition * aSphere.w;
  vec4 world = uModel * vec4(local, 1.0);

  // uModel is always translation + uniform scale here, so the linear part can
  // transform the normal directly without an inverse-transpose.
  vNormal = normalize(mat3(uModel) * aPosition);
  vView = uCameraPos - world.xyz;
  vColor = aColor.rgb;
  vGlow = aColor.w;

  gl_Position = uViewProjection * world;
}
`;

const ATOM_FS = /* glsl */ `${FRAG_HEAD}
${SHADING}

in vec3 vNormal;
in vec3 vView;
in vec3 vColor;
in float vGlow;

out vec4 fragColor;

uniform float uAlpha;
uniform float uRoughness;
uniform float uTranslucency;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  vec3 lit = shadeMolecular(vColor, N, V, uRoughness, uTranslucency, vColor * vGlow);
  fragColor = vec4(lit, uAlpha);
}
`;

const BOND_VS = /* glsl */ `${VERT_HEAD}
${TRANSFORM}

layout(location = ${ATTR.position}) in vec3 aPosition;
layout(location = ${ATTR.normal}) in vec3 aNormal;
layout(location = ${ATTR.instance0}) in vec4 aStart;
layout(location = ${ATTR.instance1}) in vec4 aEnd;
layout(location = ${ATTR.instance2}) in vec4 aColor;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;

out vec3 vNormal;
out vec3 vView;
out vec3 vColor;
out float vGlow;
out float vAlpha;

void main() {
  vec3 localPos, localNrm;
  bondTransform(aStart.xyz, aEnd.xyz, aStart.w, aPosition, aNormal, localPos, localNrm);

  vec4 world = uModel * vec4(localPos, 1.0);
  vNormal = normalize(mat3(uModel) * localNrm);
  vView = uCameraPos - world.xyz;
  vColor = aColor.rgb;
  vGlow = aEnd.w;
  vAlpha = aColor.w;

  gl_Position = uViewProjection * world;
}
`;

const BOND_FS = /* glsl */ `${FRAG_HEAD}
${SHADING}

in vec3 vNormal;
in vec3 vView;
in vec3 vColor;
in float vGlow;
in float vAlpha;

out vec4 fragColor;

uniform float uAlpha;
uniform float uRoughness;
uniform float uTranslucency;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  vec3 lit = shadeMolecular(vColor, N, V, uRoughness, uTranslucency, vColor * vGlow);
  fragColor = vec4(lit, uAlpha * vAlpha);
}
`;

export interface BatchStyle {
  roughness?: number;
  translucency?: number;
}

/** Instanced spheres. */
export class AtomBatch {
  private program: Program | null = null;
  private mesh: Mesh | null = null;
  private count = 0;

  constructor(private readonly subdivisions = 2) {}

  init(gl: WebGL2RenderingContext): void {
    this.dispose();
    this.program = new Program(gl, ATOM_VS, ATOM_FS, 'molecule:atoms');
    this.mesh = Mesh.fromData(gl, icosphere(this.subdivisions), { position: ATTR.position });
    this.mesh.attribute('sphere', ATTR.instance0, new Float32Array(4), 4, 1);
    this.mesh.attribute('color', ATTR.instance1, new Float32Array(4), 4, 1);
    this.count = 0;
  }

  private spheres = new Float32Array(0);
  private colors = new Float32Array(0);

  /**
   * `data` is {@link ATOM_STRIDE} floats per sphere, de-interleaved on upload.
   *
   * Scratch arrays are kept between calls so stages that rebuild their scene
   * every frame don't allocate two typed arrays per frame.
   */
  upload(data: Float32Array, count: number): void {
    if (!this.mesh) return;
    const grew = count * 4 > this.spheres.length;
    if (grew) {
      this.spheres = new Float32Array(count * 4);
      this.colors = new Float32Array(count * 4);
    }
    const spheres = this.spheres;
    const colors = this.colors;

    for (let i = 0; i < count; i++) {
      const src = i * ATOM_STRIDE;
      spheres[i * 4] = data[src]!;
      spheres[i * 4 + 1] = data[src + 1]!;
      spheres[i * 4 + 2] = data[src + 2]!;
      spheres[i * 4 + 3] = data[src + 3]!;
      colors[i * 4] = data[src + 4]!;
      colors[i * 4 + 1] = data[src + 5]!;
      colors[i * 4 + 2] = data[src + 6]!;
      colors[i * 4 + 3] = data[src + 7]!;
    }

    if (grew || this.count === 0) {
      this.mesh.attribute('sphere', ATTR.instance0, spheres, 4, 1);
      this.mesh.attribute('color', ATTR.instance1, colors, 4, 1);
    } else {
      this.mesh.update('sphere', spheres);
      this.mesh.update('color', colors);
    }
    this.count = count;
  }

  draw(ctx: FrameContext, model: Mat4, alpha: number, style: BatchStyle = {}): void {
    if (!this.program || !this.mesh || this.count === 0) return;
    this.program.use()
      .m4('uModel', model)
      .m4('uViewProjection', ctx.camera.viewProjection)
      .v3a('uCameraPos', ctx.camera.position)
      .f('uAlpha', alpha)
      .f('uRoughness', style.roughness ?? 0.34)
      .f('uTranslucency', style.translucency ?? 0.35);
    this.mesh.draw(this.count);
  }

  dispose(): void {
    this.program?.dispose();
    this.program = null;
    this.mesh?.dispose();
    this.mesh = null;
    this.count = 0;
  }
}

/** Instanced capsule-free cylinders spanning arbitrary start/end pairs. */
export class BondBatch {
  private program: Program | null = null;
  private mesh: Mesh | null = null;
  private count = 0;

  constructor(private readonly radialSegments = 8) {}

  init(gl: WebGL2RenderingContext): void {
    this.dispose();
    this.program = new Program(gl, BOND_VS, BOND_FS, 'molecule:bonds');
    this.mesh = Mesh.fromData(gl, cylinder(this.radialSegments, false), {
      position: ATTR.position,
      normal: ATTR.normal,
    });
    this.mesh.attribute('start', ATTR.instance0, new Float32Array(4), 4, 1);
    this.mesh.attribute('end', ATTR.instance1, new Float32Array(4), 4, 1);
    this.mesh.attribute('color', ATTR.instance2, new Float32Array(4), 4, 1);
    this.count = 0;
  }

  private starts = new Float32Array(0);
  private ends = new Float32Array(0);
  private colors = new Float32Array(0);

  /** `data` is {@link BOND_STRIDE} floats per bond. Scratch arrays are reused. */
  upload(data: Float32Array, count: number): void {
    if (!this.mesh) return;
    const grew = count * 4 > this.starts.length;
    if (grew) {
      this.starts = new Float32Array(count * 4);
      this.ends = new Float32Array(count * 4);
      this.colors = new Float32Array(count * 4);
    }
    const starts = this.starts;
    const ends = this.ends;
    const colors = this.colors;

    for (let i = 0; i < count; i++) {
      const src = i * BOND_STRIDE;
      starts[i * 4] = data[src]!;
      starts[i * 4 + 1] = data[src + 1]!;
      starts[i * 4 + 2] = data[src + 2]!;
      starts[i * 4 + 3] = data[src + 3]!;
      ends[i * 4] = data[src + 4]!;
      ends[i * 4 + 1] = data[src + 5]!;
      ends[i * 4 + 2] = data[src + 6]!;
      ends[i * 4 + 3] = data[src + 7]!;
      colors[i * 4] = data[src + 8]!;
      colors[i * 4 + 1] = data[src + 9]!;
      colors[i * 4 + 2] = data[src + 10]!;
      colors[i * 4 + 3] = data[src + 11]!;
    }

    if (grew || this.count === 0) {
      this.mesh.attribute('start', ATTR.instance0, starts, 4, 1);
      this.mesh.attribute('end', ATTR.instance1, ends, 4, 1);
      this.mesh.attribute('color', ATTR.instance2, colors, 4, 1);
    } else {
      this.mesh.update('start', starts);
      this.mesh.update('end', ends);
      this.mesh.update('color', colors);
    }
    this.count = count;
  }

  draw(ctx: FrameContext, model: Mat4, alpha: number, style: BatchStyle = {}): void {
    if (!this.program || !this.mesh || this.count === 0) return;
    this.program.use()
      .m4('uModel', model)
      .m4('uViewProjection', ctx.camera.viewProjection)
      .v3a('uCameraPos', ctx.camera.position)
      .f('uAlpha', alpha)
      .f('uRoughness', style.roughness ?? 0.4)
      .f('uTranslucency', style.translucency ?? 0.25);
    this.mesh.draw(this.count);
  }

  dispose(): void {
    this.program?.dispose();
    this.program = null;
    this.mesh?.dispose();
    this.mesh = null;
    this.count = 0;
  }
}

/** Helper for filling an atom buffer without index arithmetic at every call. */
export class AtomWriter {
  private cursor = 0;

  constructor(public readonly data: Float32Array) {}

  get count(): number {
    return this.cursor / ATOM_STRIDE;
  }

  reset(): void {
    this.cursor = 0;
  }

  push(
    x: number, y: number, z: number, radius: number,
    color: readonly [number, number, number], glow = 0,
  ): void {
    if (this.cursor + ATOM_STRIDE > this.data.length) return;
    const d = this.data;
    d[this.cursor++] = x;
    d[this.cursor++] = y;
    d[this.cursor++] = z;
    d[this.cursor++] = radius;
    d[this.cursor++] = color[0];
    d[this.cursor++] = color[1];
    d[this.cursor++] = color[2];
    d[this.cursor++] = glow;
  }
}

/** Helper for filling a bond buffer. */
export class BondWriter {
  private cursor = 0;

  constructor(public readonly data: Float32Array) {}

  get count(): number {
    return this.cursor / BOND_STRIDE;
  }

  reset(): void {
    this.cursor = 0;
  }

  push(
    ax: number, ay: number, az: number,
    bx: number, by: number, bz: number,
    radius: number, color: readonly [number, number, number],
    glow = 0, alpha = 1,
  ): void {
    if (this.cursor + BOND_STRIDE > this.data.length) return;
    const d = this.data;
    d[this.cursor++] = ax;
    d[this.cursor++] = ay;
    d[this.cursor++] = az;
    d[this.cursor++] = radius;
    d[this.cursor++] = bx;
    d[this.cursor++] = by;
    d[this.cursor++] = bz;
    d[this.cursor++] = glow;
    d[this.cursor++] = color[0];
    d[this.cursor++] = color[1];
    d[this.cursor++] = color[2];
    d[this.cursor++] = alpha;
  }
}
