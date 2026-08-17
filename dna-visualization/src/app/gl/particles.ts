import { FRAG_HEAD, SIMPLEX, VERT_HEAD } from './chunks';
import type { MeshData } from './geometry';
import type { Mat4 } from './math';
import { ATTR, Mesh } from './mesh';
import { Program } from './program';
import type { FrameContext } from './stage';

/**
 * Additive billboard particles: cytoplasmic traffic, hydration shells, ions,
 * and the pulses running along interactome edges.
 *
 * Motion lives entirely in the vertex shader. Each particle carries a seed and
 * a home position, and rides a curl-noise field evaluated per frame on the GPU
 * — so ten thousand drifting molecules cost one draw call and zero CPU work.
 */

/** Floats per particle: home.xyz, size, colour.rgb, seed. */
export const PARTICLE_STRIDE = 8;

const PARTICLE_VS = /* glsl */ `${VERT_HEAD}
${SIMPLEX}

layout(location = ${ATTR.position}) in vec3 aCorner;
layout(location = ${ATTR.instance0}) in vec4 aHome;
layout(location = ${ATTR.instance1}) in vec4 aStyle;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uViewProjection;
uniform float uTime;
uniform float uDrift;
uniform float uSwirl;

out vec2 vCorner;
out vec3 vColor;
out float vTwinkle;

void main() {
  float seed = aStyle.w;

  // Curl flow, sampled at the particle's home so neighbours move together in
  // sheets rather than as independent specks.
  vec3 flow = curlNoise(aHome.xyz * uSwirl + vec3(0.0, 0.0, uTime * 0.05) + seed);
  vec3 local = aHome.xyz + flow * uDrift;

  vec4 world = uModel * vec4(local, 1.0);

  // Billboard using the view matrix's basis rows, so quads always face us.
  vec3 right = vec3(uView[0][0], uView[1][0], uView[2][0]);
  vec3 up    = vec3(uView[0][1], uView[1][1], uView[2][1]);

  float scale = aHome.w * (0.75 + 0.25 * sin(uTime * 1.7 + seed * 9.1));
  world.xyz += (right * aCorner.x + up * aCorner.y) * scale;

  vCorner = aCorner.xy;
  vColor = aStyle.rgb;
  vTwinkle = 0.55 + 0.45 * sin(uTime * 2.3 + seed * 21.7);

  gl_Position = uViewProjection * world;
}
`;

const PARTICLE_FS = /* glsl */ `${FRAG_HEAD}

in vec2 vCorner;
in vec3 vColor;
in float vTwinkle;

out vec4 fragColor;

uniform float uAlpha;

void main() {
  // Gaussian-ish falloff. Squaring the smoothstep keeps a tight bright core
  // with a long tail, which is what the bloom pass wants to catch.
  float d = length(vCorner) * 2.0;
  float falloff = 1.0 - smoothstep(0.0, 1.0, d);
  falloff *= falloff;
  if (falloff < 0.004) discard;

  fragColor = vec4(vColor * falloff * vTwinkle * uAlpha, 1.0);
}
`;

function quad(): MeshData {
  return {
    positions: new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]),
    normals: new Float32Array(12),
    indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
  };
}

export interface ParticleStyle {
  /** How far a particle strays from home. */
  drift?: number;
  /** Spatial frequency of the flow field. Lower = broader swirls. */
  swirl?: number;
}

export class ParticleField {
  private program: Program | null = null;
  private mesh: Mesh | null = null;
  private count = 0;

  init(gl: WebGL2RenderingContext): void {
    this.dispose();
    this.program = new Program(gl, PARTICLE_VS, PARTICLE_FS, 'particles');
    this.mesh = Mesh.fromData(gl, quad(), { position: ATTR.position });
    this.mesh.attribute('home', ATTR.instance0, new Float32Array(4), 4, 1);
    this.mesh.attribute('style', ATTR.instance1, new Float32Array(4), 4, 1);
  }

  /** `data` is {@link PARTICLE_STRIDE} floats per particle. */
  upload(data: Float32Array, count: number): void {
    if (!this.mesh) return;
    this.count = count;
    const homes = new Float32Array(count * 4);
    const styles = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      const src = i * PARTICLE_STRIDE;
      homes[i * 4] = data[src]!;
      homes[i * 4 + 1] = data[src + 1]!;
      homes[i * 4 + 2] = data[src + 2]!;
      homes[i * 4 + 3] = data[src + 3]!;
      styles[i * 4] = data[src + 4]!;
      styles[i * 4 + 1] = data[src + 5]!;
      styles[i * 4 + 2] = data[src + 6]!;
      styles[i * 4 + 3] = data[src + 7]!;
    }
    this.mesh.attribute('home', ATTR.instance0, homes, 4, 1);
    this.mesh.attribute('style', ATTR.instance1, styles, 4, 1);
  }

  /** Draws additively with depth testing on but depth writes off. */
  draw(ctx: FrameContext, model: Mat4, alpha: number, style: ParticleStyle = {}, count = -1): void {
    if (!this.program || !this.mesh || this.count === 0) return;
    const gl = ctx.gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.depthMask(false);
    gl.disable(gl.CULL_FACE);

    this.program.use()
      .m4('uModel', model)
      .m4('uView', ctx.camera.view)
      .m4('uViewProjection', ctx.camera.viewProjection)
      .f('uTime', ctx.time)
      .f('uAlpha', alpha)
      .f('uDrift', style.drift ?? 0.35)
      .f('uSwirl', style.swirl ?? 0.35);

    this.mesh.draw(count < 0 ? this.count : Math.min(count, this.count));

    gl.depthMask(true);
    gl.enable(gl.CULL_FACE);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  dispose(): void {
    this.program?.dispose();
    this.program = null;
    this.mesh?.dispose();
    this.mesh = null;
    this.count = 0;
  }
}
