import { Backdrop } from '../gl/backdrop';
import { FRAG_HEAD, SHADING, SIMPLEX, TRANSFORM, VERT_HEAD } from '../gl/chunks';
import { icosphere, torus } from '../gl/geometry';
import { m4TRS, mat4, mulberry32 } from '../gl/math';
import { ATTR, Mesh } from '../gl/mesh';
import { BOND_STRIDE, BondBatch, BondWriter } from '../gl/molecule';
import { PARTICLE_STRIDE, ParticleField } from '../gl/particles';
import { Program } from '../gl/program';
import type { FocusHint, FrameContext, Stage } from '../gl/stage';

/** Human somatic cells carry 23 chromosome pairs. */
const TERRITORIES = 23;
const PORES = 150;
const CHROMATIN_CLOUD = 2600;
const STRAND_SEGMENTS = 640;

const ENVELOPE_VS = /* glsl */ `${VERT_HEAD}
layout(location = ${ATTR.position}) in vec3 aPosition;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;

out vec3 vNormal;
out vec3 vView;
out vec3 vLocal;

void main() {
  vec4 world = uModel * vec4(aPosition, 1.0);
  vNormal = normalize(mat3(uModel) * aPosition);
  vView = uCameraPos - world.xyz;
  vLocal = aPosition;
  gl_Position = uViewProjection * world;
}
`;

const ENVELOPE_FS = /* glsl */ `${FRAG_HEAD}
${SIMPLEX}
${SHADING}

in vec3 vNormal;
in vec3 vView;
in vec3 vLocal;

out vec4 fragColor;

uniform float uAlpha;
uniform float uTime;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  if (!gl_FrontFacing) N = -N;

  float facing = clamp(dot(N, V), 0.0, 1.0);
  float rim = pow(1.0 - facing, 2.0);

  vec3 lit = shadeMolecular(vec3(0.13, 0.26, 0.5), N, V, 0.3, 0.85, vec3(0.0));

  // The double membrane reads as two offset shimmer bands.
  float band = snoise(vLocal * 8.0 + uTime * 0.05);
  lit += vec3(0.34, 0.72, 1.0) * smoothstep(0.3, 0.9, band) * 0.18;
  lit += vec3(0.4, 0.85, 1.0) * rim * 0.85;

  fragColor = vec4(lit, uAlpha * (0.07 + 0.68 * rim));
}
`;

const PORE_VS = /* glsl */ `${VERT_HEAD}
${TRANSFORM}

layout(location = ${ATTR.position}) in vec3 aPosition;
layout(location = ${ATTR.normal}) in vec3 aNormal;
layout(location = ${ATTR.instance0}) in vec4 aPore; // xyz = surface normal, w = scale

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uRadius;

out vec3 vNormal;
out vec3 vView;

void main() {
  // The torus is built around +Y; rotate that axis onto the surface normal so
  // each pore complex sits flat in the envelope.
  vec3 axis = normalize(aPore.xyz);
  vec3 n, bi;
  frameFromTangent(axis, n, bi);
  mat3 basis = mat3(bi, axis, n);

  vec3 local = axis * uRadius + basis * (aPosition * aPore.w);
  vec4 world = uModel * vec4(local, 1.0);

  vNormal = normalize(mat3(uModel) * (basis * aNormal));
  vView = uCameraPos - world.xyz;
  gl_Position = uViewProjection * world;
}
`;

const PORE_FS = /* glsl */ `${FRAG_HEAD}
${SHADING}

in vec3 vNormal;
in vec3 vView;
out vec4 fragColor;

uniform float uAlpha;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  vec3 lit = shadeMolecular(vec3(0.45, 0.78, 0.95), N, V, 0.35, 0.3, vec3(0.06, 0.14, 0.2));
  fragColor = vec4(lit, uAlpha * 0.9);
}
`;

/**
 * Scale 3 — the nucleus.
 *
 * Chromosomes are not a tangle in here: each occupies its own territory, which
 * is why the chromatin is drawn as 23 distinctly coloured clouds rather than
 * one uniform fog.
 */
export class NucleusStage implements Stage {
  readonly id = 'nucleus';
  readonly label = 'Nucleus';
  readonly scale = '10⁻⁶ m';
  readonly caption =
    'Two metres of DNA folded into six micrometres. Each chromosome keeps to its own territory, and every molecule entering or leaving passes through one of a few thousand nuclear pores.';
  readonly detail = '23 chromosome territories · nuclear pore complexes';

  private envelopeProgram: Program | null = null;
  private envelopeMesh: Mesh | null = null;
  private poreProgram: Program | null = null;
  private poreMesh: Mesh | null = null;

  private readonly backdrop = new Backdrop();
  private readonly chromatin = new ParticleField();
  private readonly strands = new BondBatch(5);
  private readonly model = mat4();

  init(gl: WebGL2RenderingContext): void {
    this.dispose();

    this.envelopeProgram = new Program(gl, ENVELOPE_VS, ENVELOPE_FS, 'nucleus:envelope');
    this.envelopeMesh = Mesh.fromData(gl, icosphere(3), { position: ATTR.position });

    this.poreProgram = new Program(gl, PORE_VS, PORE_FS, 'nucleus:pores');
    this.poreMesh = Mesh.fromData(gl, torus(1, 0.34, 14, 7), {
      position: ATTR.position,
      normal: ATTR.normal,
    });

    this.backdrop.init(gl);
    this.chromatin.init(gl);
    this.strands.init(gl);

    const random = mulberry32(0x17ac);

    // --- Pore complexes, spread evenly over the envelope ------------------
    const pores = new Float32Array(PORES * 4);
    for (let i = 0; i < PORES; i++) {
      // Fibonacci sphere: even coverage without the clumping of random points.
      const y = 1 - (i / (PORES - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * 2.399963229728653;
      pores[i * 4] = Math.cos(theta) * r;
      pores[i * 4 + 1] = y;
      pores[i * 4 + 2] = Math.sin(theta) * r;
      pores[i * 4 + 3] = 0.032 + random() * 0.012;
    }
    this.poreInstances = pores;

    // --- Chromosome territories ------------------------------------------
    const cloud = new Float32Array(CHROMATIN_CLOUD * PARTICLE_STRIDE);
    const centres: Array<[number, number, number]> = [];
    const hues: Array<[number, number, number]> = [];

    for (let t = 0; t < TERRITORIES; t++) {
      const y = 1 - (t / (TERRITORIES - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = t * 2.399963229728653;
      const shell = 0.34 + random() * 0.38;
      centres.push([Math.cos(theta) * r * shell, y * shell, Math.sin(theta) * r * shell]);
      hues.push(territoryColor(t / TERRITORIES));
    }

    for (let i = 0; i < CHROMATIN_CLOUD; i++) {
      const t = i % TERRITORIES;
      const centre = centres[t]!;
      const hue = hues[t]!;
      const spread = 0.11 + random() * 0.14;
      const p = i * PARTICLE_STRIDE;
      cloud[p] = centre[0] + (random() * 2 - 1) * spread;
      cloud[p + 1] = centre[1] + (random() * 2 - 1) * spread;
      cloud[p + 2] = centre[2] + (random() * 2 - 1) * spread;
      cloud[p + 3] = 0.008 + random() * 0.017;
      cloud[p + 4] = hue[0];
      cloud[p + 5] = hue[1];
      cloud[p + 6] = hue[2];
      cloud[p + 7] = random() * 60;
    }
    this.chromatin.upload(cloud, CHROMATIN_CLOUD);

    // --- Chromatin fibres threading each territory ------------------------
    const bonds = new BondWriter(new Float32Array(STRAND_SEGMENTS * BOND_STRIDE));
    const perTerritory = Math.floor(STRAND_SEGMENTS / TERRITORIES);

    for (let t = 0; t < TERRITORIES; t++) {
      const centre = centres[t]!;
      const hue = hues[t]!;
      let x = centre[0], y = centre[1], z = centre[2];

      // A self-avoiding-ish random walk: momentum keeps the fibre from
      // doubling back on itself into a knot.
      let dx = random() * 2 - 1, dy = random() * 2 - 1, dz = random() * 2 - 1;

      for (let s = 0; s < perTerritory; s++) {
        dx += (random() * 2 - 1) * 0.7;
        dy += (random() * 2 - 1) * 0.7;
        dz += (random() * 2 - 1) * 0.7;
        const len = Math.hypot(dx, dy, dz) || 1;
        const step = 0.045;
        const nx = x + (dx / len) * step;
        const ny = y + (dy / len) * step;
        const nz = z + (dz / len) * step;

        bonds.push(x, y, z, nx, ny, nz, 0.006, hue, 0.25, 0.85);
        x = nx; y = ny; z = nz;

        // Tug back toward the territory centre so the walk stays local.
        dx += (centre[0] - x) * 2.4;
        dy += (centre[1] - y) * 2.4;
        dz += (centre[2] - z) * 2.4;
      }
    }
    this.strands.upload(bonds.data, bonds.count);
  }

  private poreInstances: Float32Array | null = null;
  private poreMeshReady = false;

  update(ctx: FrameContext): void {
    const zoom = Math.pow(2, -1.4 + ctx.local * 3.2);
    const z = -5.2 + ctx.local * 8.6;
    m4TRS(this.model, 0, 0, z, ctx.time * 0.035 - ctx.local * 0.4, zoom);
  }

  render(ctx: FrameContext): void {
    const { gl } = ctx;

    this.backdrop.render(
      gl,
      {
        top: [0.024, 0.036, 0.088],
        bottom: [0.006, 0.010, 0.030],
        glow: [0.20, 0.28, 0.76],
        density: 1.1,
        glowX: 0.24,
        glowY: -0.14,
      },
      ctx.time,
      ctx.alpha,
      ctx.width / ctx.height,
    );

    this.strands.draw(ctx, this.model, ctx.alpha * 0.9, { roughness: 0.5, translucency: 0.4 });

    const cloudCount = Math.round(CHROMATIN_CLOUD * ctx.quality);
    this.chromatin.draw(ctx, this.model, ctx.alpha * 0.62, { drift: 0.035, swirl: 2.4 }, cloudCount);

    // Pores are opaque and sit in the envelope, so they go before it.
    if (this.poreProgram && this.poreMesh && this.poreInstances) {
      if (!this.poreMeshReady) {
        this.poreMesh.attribute('pore', ATTR.instance0, this.poreInstances, 4, 1);
        this.poreMeshReady = true;
      }
      this.poreProgram.use()
        .m4('uModel', this.model)
        .m4('uViewProjection', ctx.camera.viewProjection)
        .v3a('uCameraPos', ctx.camera.position)
        .f('uRadius', 1.0)
        .f('uAlpha', ctx.alpha);
      this.poreMesh.draw(PORES);
    }

    if (this.envelopeProgram && this.envelopeMesh) {
      gl.disable(gl.CULL_FACE);
      gl.depthMask(false);
      this.envelopeProgram.use()
        .m4('uModel', this.model)
        .m4('uViewProjection', ctx.camera.viewProjection)
        .v3a('uCameraPos', ctx.camera.position)
        .f('uTime', ctx.time)
        .f('uAlpha', ctx.alpha);
      this.envelopeMesh.draw();
      gl.depthMask(true);
      gl.enable(gl.CULL_FACE);
    }
  }

  focus(ctx: FrameContext): FocusHint {
    return { distance: 5.8 - ctx.local * 0.7, aperture: 4.0 };
  }

  dispose(): void {
    this.envelopeProgram?.dispose();
    this.envelopeProgram = null;
    this.envelopeMesh?.dispose();
    this.envelopeMesh = null;
    this.poreProgram?.dispose();
    this.poreProgram = null;
    this.poreMesh?.dispose();
    this.poreMesh = null;
    this.poreMeshReady = false;
    this.poreInstances = null;
    this.backdrop.dispose();
    this.chromatin.dispose();
    this.strands.dispose();
  }
}

/** Spread territories across a cool-to-warm ramp, staying inside the palette. */
function territoryColor(t: number): [number, number, number] {
  const angle = t * Math.PI * 2;
  return [
    0.45 + 0.4 * Math.sin(angle),
    0.6 + 0.3 * Math.sin(angle + 2.1),
    0.8 + 0.2 * Math.sin(angle + 4.2),
  ];
}
