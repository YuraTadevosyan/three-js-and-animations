import { BASE_COLOR, BDNA, P53_CDS, TWIST_PER_BP, complement, type Base } from '../bio/sequence';
import { Backdrop } from '../gl/backdrop';
import { BDNA_CURVE, FRAG_HEAD, SHADING, TRANSFORM, VERT_HEAD } from '../gl/chunks';
import { box, tubeTemplate } from '../gl/geometry';
import { m4TRS, mat4, mulberry32 } from '../gl/math';
import { ATTR, Mesh } from '../gl/mesh';
import { PARTICLE_STRIDE, ParticleField } from '../gl/particles';
import { Program } from '../gl/program';
import type { FocusHint, FrameContext, Stage } from '../gl/stage';

/** Base pairs rendered. Enough to show four full turns of the helix. */
export const HELIX_BP = 46;
const TUBE_SEGMENTS = 900;
const TUBE_RADIAL = 10;
const HYDRATION = 900;

/**
 * World units are decinanometres here: 1 unit = 10 Å.
 *
 * Keeps the helix a sensible size on screen while every constant below stays
 * recognisable as its real value — 3.4 Å rise becomes 0.34, the 20 Å duplex
 * becomes 2.0 across.
 */
const UNIT = 0.1;
const RISE = BDNA.rise * UNIT;
const RADIUS = BDNA.backboneRadius * UNIT;

const BACKBONE_VS = /* glsl */ `${VERT_HEAD}
${TRANSFORM}
${BDNA_CURVE}

layout(location = ${ATTR.param}) in vec2 aParam; // x = t along strand, y = tube angle

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uBpCount;
uniform float uStrand;
uniform float uTubeRadius;

out vec3 vNormal;
out vec3 vView;
out float vBp;

void main() {
  // Centred on zero to match the base instances, which are built around the
  // middle of the sequence. Running 0..count here would stack the backbones a
  // full helix-length above the rungs they are supposed to be carrying.
  float bp = (aParam.x - 0.5) * uBpCount;

  vec3 p = backbonePoint(bp, uStrand);

  // Central difference for the tangent: the sway makes the analytic derivative
  // messier than it is worth, and half a base pair is a tight enough step.
  vec3 ahead = backbonePoint(bp + 0.5, uStrand);
  vec3 behind = backbonePoint(bp - 0.5, uStrand);

  vec3 n, bi;
  frameFromTangent(ahead - behind, n, bi);
  vec3 offset = n * cos(aParam.y) + bi * sin(aParam.y);

  vec3 local = p + offset * uTubeRadius;
  vec4 world = uModel * vec4(local, 1.0);

  vNormal = normalize(mat3(uModel) * offset);
  vView = uCameraPos - world.xyz;
  vBp = bp;

  gl_Position = uViewProjection * world;
}
`;

const BACKBONE_FS = /* glsl */ `${FRAG_HEAD}
${SHADING}

in vec3 vNormal;
in vec3 vView;
in float vBp;

out vec4 fragColor;

uniform float uAlpha;
uniform float uTime;
uniform float uBpCount;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);

  // Sugar-phosphate backbone: cold, wet, faintly metallic.
  vec3 albedo = vec3(0.30, 0.62, 0.80);

  // A charge pulse running 5' to 3'. Two harmonics so it never looks like a
  // single sine crawling along a pipe.
  float phase = vBp * 0.55 - uTime * 2.4;
  float pulse = pow(max(sin(phase) * 0.5 + 0.5, 0.0), 12.0)
              + pow(max(sin(phase * 0.5 + 1.7) * 0.5 + 0.5, 0.0), 20.0) * 0.6;

  vec3 emissive = vec3(0.30, 0.92, 1.0) * pulse * 0.9;

  vec3 lit = shadeMolecular(albedo, N, V, 0.22, 0.2, emissive);
  fragColor = vec4(lit, uAlpha);
}
`;

const BASE_VS = /* glsl */ `${VERT_HEAD}
${BDNA_CURVE}

layout(location = ${ATTR.position}) in vec3 aPosition;
layout(location = ${ATTR.normal}) in vec3 aNormal;
layout(location = ${ATTR.instance0}) in vec4 aBase;  // x = bp index, y = strand, z = purine, w = spare
layout(location = ${ATTR.instance1}) in vec4 aColor;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uInnerRadius;
uniform float uThickness;
uniform float uWidth;

out vec3 vNormal;
out vec3 vView;
out vec3 vColor;
out float vBp;
out float vSpan;

void main() {
  float bp = aBase.x;
  float strand = aBase.y;

  vec3 axis = helixAxisPoint(bp);
  vec3 outward = strandOutward(bp, strand);
  vec3 up = vec3(0.0, 1.0, 0.0);
  vec3 side = normalize(cross(up, outward));
  vec3 planeUp = normalize(cross(outward, side));

  // Purines (A, G) are two fused rings and reach further across the duplex
  // than the single-ring pyrimidines (T, C) — the reason a purine always
  // pairs with a pyrimidine and the helix keeps a constant 20 Å width.
  float inner = mix(uInnerRadius * 1.32, uInnerRadius, aBase.z);
  float span = uRadius - inner;

  // Box x spans [-0.5, 0.5]; remap so 0 sits at the backbone end.
  float along = aPosition.x + 0.5;
  vec3 local = axis
    + outward * (uRadius - along * span)
    + planeUp * (aPosition.y * uThickness)
    + side * (aPosition.z * uWidth);

  vec4 world = uModel * vec4(local, 1.0);

  vec3 nrm = outward * -aNormal.x + planeUp * aNormal.y + side * aNormal.z;
  vNormal = normalize(mat3(uModel) * nrm);
  vView = uCameraPos - world.xyz;
  vColor = aColor.rgb;
  vBp = bp;
  vSpan = along;

  gl_Position = uViewProjection * world;
}
`;

const BASE_FS = /* glsl */ `${FRAG_HEAD}
${SHADING}

in vec3 vNormal;
in vec3 vView;
in vec3 vColor;
in float vBp;
in float vSpan;

out vec4 fragColor;

uniform float uAlpha;
uniform float uTime;
uniform float uReadHead;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);

  // Brightest at the inner tip, where the hydrogen bonds are.
  float tip = smoothstep(0.35, 1.0, vSpan);
  vec3 emissive = vColor * (0.22 + tip * 0.75);

  // A reading head sweeping the sequence, as a polymerase would.
  float head = exp(-pow((vBp - uReadHead) * 0.55, 2.0));
  emissive += vColor * head * 1.6;
  emissive += vec3(1.0) * head * tip * 0.5;

  vec3 lit = shadeMolecular(vColor * 0.55, N, V, 0.3, 0.45, emissive);
  fragColor = vec4(lit, uAlpha);
}
`;

/**
 * Scale 5 — the double helix.
 *
 * The hero shot, and the only stage where the geometry is literally the data:
 * every rung's colour and reach comes from the actual base at that position in
 * the sequence, and the two backbones are offset by the real 225°/135° split
 * that carves the major and minor grooves.
 */
export class HelixStage implements Stage {
  readonly id = 'helix';
  readonly label = 'Double helix';
  readonly scale = '10⁻⁹ m';
  readonly caption =
    'B-DNA: ten and a half base pairs per turn, rising 3.4 ångström each. The two backbones run antiparallel and sit 225° apart, cutting one wide groove and one narrow one.';
  readonly detail = 'TP53 coding sequence · A–T and G–C';

  private backboneProgram: Program | null = null;
  private backboneMesh: Mesh | null = null;
  private baseProgram: Program | null = null;
  private baseMesh: Mesh | null = null;

  private readonly backdrop = new Backdrop();
  private readonly hydration = new ParticleField();
  private readonly model = mat4();
  private readHead = 0;

  init(gl: WebGL2RenderingContext): void {
    this.dispose();

    this.backboneProgram = new Program(gl, BACKBONE_VS, BACKBONE_FS, 'helix:backbone');
    this.backboneMesh = Mesh.fromData(gl, tubeTemplate(TUBE_SEGMENTS, TUBE_RADIAL), {
      param: ATTR.param,
    });

    this.baseProgram = new Program(gl, BASE_VS, BASE_FS, 'helix:bases');
    this.baseMesh = Mesh.fromData(gl, box(), { position: ATTR.position, normal: ATTR.normal });

    // Two bases per pair: the sense base on strand 0, its complement on 1.
    const info = new Float32Array(HELIX_BP * 2 * 4);
    const colors = new Float32Array(HELIX_BP * 2 * 4);

    for (let i = 0; i < HELIX_BP; i++) {
      const sense = P53_CDS[i % P53_CDS.length] as Base;
      const anti = complement(sense);

      for (const [slot, base] of [[0, sense], [1, anti]] as const) {
        const index = (i * 2 + slot) * 4;
        info[index] = i - HELIX_BP / 2;
        info[index + 1] = slot;
        info[index + 2] = base === 'A' || base === 'G' ? 1 : 0;
        info[index + 3] = 0;

        const rgb = BASE_COLOR[base];
        colors[index] = rgb[0];
        colors[index + 1] = rgb[1];
        colors[index + 2] = rgb[2];
        colors[index + 3] = 1;
      }
    }

    this.baseMesh.attribute('base', ATTR.instance0, info, 4, 1);
    this.baseMesh.attribute('color', ATTR.instance1, colors, 4, 1);

    this.backdrop.init(gl);
    this.hydration.init(gl);

    // Hydration shell: the ordered water and counter-ions that actually hold
    // B-DNA in this conformation.
    const random = mulberry32(0xd4a);
    const shell = new Float32Array(HYDRATION * PARTICLE_STRIDE);
    for (let i = 0; i < HYDRATION; i++) {
      const bp = (random() - 0.5) * HELIX_BP;
      const angle = random() * Math.PI * 2;
      const radius = RADIUS * (1.15 + random() * 1.5);
      const p = i * PARTICLE_STRIDE;
      shell[p] = Math.cos(angle) * radius;
      shell[p + 1] = bp * RISE;
      shell[p + 2] = Math.sin(angle) * radius;
      shell[p + 3] = 0.012 + random() * 0.02;

      const ion = random() < 0.18;
      shell[p + 4] = ion ? 1.0 : 0.35;
      shell[p + 5] = ion ? 0.78 : 0.72;
      shell[p + 6] = ion ? 0.42 : 1.0;
      shell[p + 7] = random() * 90;
    }
    this.hydration.upload(shell, HYDRATION);
  }

  update(ctx: FrameContext): void {
    // The read head runs the length of the sequence once per stage.
    this.readHead = (ctx.local * 1.25 - 0.15) * HELIX_BP - HELIX_BP / 2;

    const zoom = Math.pow(2, -0.35 + ctx.local * 1.5);
    const z = -1.8 + ctx.local * 4.4;
    m4TRS(this.model, 0, 0, z, ctx.time * 0.14 + ctx.local * 1.2, zoom);
  }

  render(ctx: FrameContext): void {
    const { gl } = ctx;

    this.backdrop.render(
      gl,
      {
        top: [0.020, 0.032, 0.070],
        bottom: [0.004, 0.008, 0.020],
        glow: [0.12, 0.36, 0.62],
        density: 0.75,
        glowX: 0.28,
        glowY: 0.18,
      },
      ctx.time,
      ctx.alpha,
      ctx.width / ctx.height,
    );

    const bend = 0.035;

    if (this.backboneProgram && this.backboneMesh) {
      const program = this.backboneProgram.use()
        .m4('uModel', this.model)
        .m4('uViewProjection', ctx.camera.viewProjection)
        .v3a('uCameraPos', ctx.camera.position)
        .f('uAlpha', ctx.alpha)
        .f('uTime', ctx.time)
        .f('uRise', RISE)
        .f('uTwist', TWIST_PER_BP)
        .f('uRadius', RADIUS)
        .f('uStrandOffset', BDNA.strandOffset)
        .f('uBend', bend)
        .f('uBpCount', HELIX_BP)
        .f('uTubeRadius', 0.085);

      // One draw per strand: same geometry, different angular offset.
      for (const strand of [0, 1]) {
        program.f('uStrand', strand);
        this.backboneMesh.draw();
      }
    }

    if (this.baseProgram && this.baseMesh) {
      this.baseProgram.use()
        .m4('uModel', this.model)
        .m4('uViewProjection', ctx.camera.viewProjection)
        .v3a('uCameraPos', ctx.camera.position)
        .f('uAlpha', ctx.alpha)
        .f('uTime', ctx.time)
        .f('uRise', RISE)
        .f('uTwist', TWIST_PER_BP)
        .f('uRadius', RADIUS)
        .f('uStrandOffset', BDNA.strandOffset)
        .f('uBend', bend)
        .f('uInnerRadius', RADIUS * 0.20)
        .f('uThickness', 0.055)
        .f('uWidth', 0.16)
        .f('uReadHead', this.readHead);
      this.baseMesh.draw(HELIX_BP * 2);
    }

    this.hydration.draw(
      ctx,
      this.model,
      ctx.alpha * 0.55,
      { drift: 0.06, swirl: 1.1 },
      Math.round(HYDRATION * ctx.quality),
    );
  }

  focus(ctx: FrameContext): FocusHint {
    return { distance: 6.0 - ctx.local * 1.2, aperture: 2.4 };
  }

  dispose(): void {
    this.backboneProgram?.dispose();
    this.backboneProgram = null;
    this.backboneMesh?.dispose();
    this.backboneMesh = null;
    this.baseProgram?.dispose();
    this.baseProgram = null;
    this.baseMesh?.dispose();
    this.baseMesh = null;
    this.backdrop.dispose();
    this.hydration.dispose();
  }
}
