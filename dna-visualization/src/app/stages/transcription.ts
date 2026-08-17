import { BASE_COLOR, BDNA, P53_CDS, TWIST_PER_BP, complement, type Base } from '../bio/sequence';
import { Backdrop } from '../gl/backdrop';
import { BDNA_CURVE, FRAG_HEAD, SHADING, TRANSFORM, VERT_HEAD } from '../gl/chunks';
import { box, tubeTemplate } from '../gl/geometry';
import { m4TRS, mat4, mix, mulberry32, smoothstep } from '../gl/math';
import { ATTR, Mesh } from '../gl/mesh';
import { ATOM_STRIDE, AtomBatch, AtomWriter } from '../gl/molecule';
import { PARTICLE_STRIDE, ParticleField } from '../gl/particles';
import { Program } from '../gl/program';
import type { FocusHint, FrameContext, Stage } from '../gl/stage';

const BP_COUNT = 58;
const TUBE_SEGMENTS = 1000;
const TUBE_RADIAL = 9;
const POLYMERASE_BLOBS = 22;
const NUCLEOTIDE_POOL = 420;

const UNIT = 0.1;
const RISE = BDNA.rise * UNIT;
const RADIUS = BDNA.backboneRadius * UNIT;

/**
 * The transcription bubble.
 *
 * RNA polymerase does not unzip the whole molecule — it opens a bubble of
 * roughly 14 base pairs, reads the template inside it, and lets the duplex
 * re-anneal behind. Everything in this stage keys off this one function.
 */
const BUBBLE = /* glsl */ `
uniform float uFork;
uniform float uBubbleWidth;
uniform float uOpenAmount;

float bubbleOpenness(float bp) {
  float d = (bp - uFork) / uBubbleWidth;
  return exp(-d * d) * uOpenAmount;
}
`;

const STRAND_VS = /* glsl */ `${VERT_HEAD}
${TRANSFORM}
${BDNA_CURVE}
${BUBBLE}

layout(location = ${ATTR.param}) in vec2 aParam;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uBpCount;
uniform float uStrand;
uniform float uTubeRadius;

out vec3 vNormal;
out vec3 vView;
out float vBp;
out float vOpen;

vec3 strandPoint(float bp) {
  vec3 p = backbonePoint(bp, uStrand);
  // Inside the bubble the strands bow apart, template one way, coding the
  // other, which is what makes room for the polymerase to sit between them.
  float open = bubbleOpenness(bp);
  vec3 push = strandOutward(bp, uStrand) * open * 0.55;
  push.y += (uStrand * 2.0 - 1.0) * open * 0.10;
  return p + push;
}

void main() {
  float bp = (aParam.x - 0.5) * uBpCount;

  vec3 p = strandPoint(bp);
  vec3 n, bi;
  frameFromTangent(strandPoint(bp + 0.5) - strandPoint(bp - 0.5), n, bi);
  vec3 offset = n * cos(aParam.y) + bi * sin(aParam.y);

  vec4 world = uModel * vec4(p + offset * uTubeRadius, 1.0);
  vNormal = normalize(mat3(uModel) * offset);
  vView = uCameraPos - world.xyz;
  vBp = bp;
  vOpen = bubbleOpenness(bp);

  gl_Position = uViewProjection * world;
}
`;

const STRAND_FS = /* glsl */ `${FRAG_HEAD}
${SHADING}

in vec3 vNormal;
in vec3 vView;
in float vBp;
in float vOpen;

out vec4 fragColor;

uniform float uAlpha;
uniform float uTime;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);

  vec3 albedo = vec3(0.30, 0.62, 0.80);
  // The open stretch runs hot: strained, unpaired, chemically reactive.
  albedo = mix(albedo, vec3(0.95, 0.55, 0.30), vOpen);

  float phase = vBp * 0.55 - uTime * 2.0;
  float pulse = pow(max(sin(phase) * 0.5 + 0.5, 0.0), 14.0);
  vec3 emissive = mix(vec3(0.3, 0.9, 1.0), vec3(1.0, 0.6, 0.25), vOpen) * (pulse * 0.7 + vOpen * 0.5);

  vec3 lit = shadeMolecular(albedo, N, V, 0.24, 0.2, emissive);
  fragColor = vec4(lit, uAlpha);
}
`;

const BASE_VS = /* glsl */ `${VERT_HEAD}
${BDNA_CURVE}
${BUBBLE}

layout(location = ${ATTR.position}) in vec3 aPosition;
layout(location = ${ATTR.normal}) in vec3 aNormal;
layout(location = ${ATTR.instance0}) in vec4 aBase;
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
out float vOpen;
out float vSpan;

void main() {
  float bp = aBase.x;
  float strand = aBase.y;
  float open = bubbleOpenness(bp);

  vec3 axis = helixAxisPoint(bp);
  vec3 outward = strandOutward(bp, strand);
  vec3 up = vec3(0.0, 1.0, 0.0);
  vec3 side = normalize(cross(up, outward));
  vec3 planeUp = normalize(cross(outward, side));

  float inner = mix(uInnerRadius * 1.32, uInnerRadius, aBase.z);

  // Unpaired bases swing up out of the stack and stop reaching across, which
  // is the whole point: the template face becomes readable.
  float reach = mix(uRadius - inner, (uRadius - inner) * 0.34, open);
  float swing = open * 1.1;

  float along = aPosition.x + 0.5;
  vec3 radial = outward * (uRadius + 0.55 * open - along * reach);
  vec3 lift = up * (along * swing * 0.42);

  vec3 local = axis + radial + lift
    + planeUp * (aPosition.y * uThickness)
    + side * (aPosition.z * uWidth);

  vec4 world = uModel * vec4(local, 1.0);
  vec3 nrm = outward * -aNormal.x + planeUp * aNormal.y + side * aNormal.z;

  vNormal = normalize(mat3(uModel) * nrm);
  vView = uCameraPos - world.xyz;
  vColor = aColor.rgb;
  vOpen = open;
  vSpan = along;

  gl_Position = uViewProjection * world;
}
`;

const BASE_FS = /* glsl */ `${FRAG_HEAD}
${SHADING}

in vec3 vNormal;
in vec3 vView;
in vec3 vColor;
in float vOpen;
in float vSpan;

out vec4 fragColor;

uniform float uAlpha;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);

  float tip = smoothstep(0.35, 1.0, vSpan);
  vec3 emissive = vColor * (0.2 + tip * 0.7 + vOpen * 1.5);

  vec3 lit = shadeMolecular(vColor * 0.55, N, V, 0.3, 0.45, emissive);
  fragColor = vec4(lit, uAlpha);
}
`;

const MRNA_VS = /* glsl */ `${VERT_HEAD}
${TRANSFORM}
${BDNA_CURVE}
${BUBBLE}

layout(location = ${ATTR.param}) in vec2 aParam;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uBpCount;
uniform float uTubeRadius;
uniform float uTime;

out vec3 vNormal;
out vec3 vView;
out float vT;

/**
 * The growing transcript.
 *
 * It is copied off the template inside the bubble, then peels away from the
 * duplex as the polymerase moves on — so its shape is a function of how far
 * behind the fork each nucleotide is.
 */
vec3 mrnaPoint(float bp) {
  float behind = max(uFork - bp, 0.0);
  vec3 anchor = mix(helixAxisPoint(bp), backbonePoint(bp, 1.0), 0.55);

  float peel = smoothstep(0.0, 9.0, behind);
  float angle = bp * uTwist * 0.35 + 2.2;
  vec3 away = vec3(cos(angle), 0.0, sin(angle));

  vec3 p = anchor + away * peel * 1.35;
  p.y += peel * 0.55 + sin(behind * 0.4 + uTime * 1.3) * peel * 0.12;
  return p;
}

void main() {
  float start = -uBpCount * 0.5;
  float bp = mix(start, uFork, aParam.x);
  float step = max((uFork - start) * 0.004, 0.02);

  vec3 p = mrnaPoint(bp);
  vec3 n, bi;
  frameFromTangent(mrnaPoint(bp + step) - mrnaPoint(bp - step), n, bi);
  vec3 offset = n * cos(aParam.y) + bi * sin(aParam.y);

  vec4 world = uModel * vec4(p + offset * uTubeRadius, 1.0);
  vNormal = normalize(mat3(uModel) * offset);
  vView = uCameraPos - world.xyz;
  vT = aParam.x;

  gl_Position = uViewProjection * world;
}
`;

const MRNA_FS = /* glsl */ `${FRAG_HEAD}
${SHADING}

in vec3 vNormal;
in vec3 vView;
in float vT;

out vec4 fragColor;

uniform float uAlpha;
uniform float uTime;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);

  // RNA reads violet throughout the piece — uracil's colour, and a clear
  // signal that this is not the same molecule as the blue-green DNA.
  vec3 albedo = vec3(0.62, 0.36, 0.88);

  float flow = pow(max(sin(vT * 30.0 - uTime * 4.0) * 0.5 + 0.5, 0.0), 8.0);
  vec3 emissive = vec3(0.86, 0.45, 1.0) * (0.25 + flow * 0.9);

  vec3 lit = shadeMolecular(albedo, N, V, 0.3, 0.3, emissive);

  // Fade the newest end in, so nucleotides appear rather than pop.
  fragColor = vec4(lit, uAlpha * (1.0 - smoothstep(0.96, 1.0, vT)));
}
`;

/**
 * Scale 7 — transcription.
 *
 * A polymerase walks the duplex, opens a bubble, reads the template strand and
 * lays down a complementary RNA copy. The bubble closes behind it.
 */
export class TranscriptionStage implements Stage {
  readonly id = 'transcription';
  readonly label = 'Transcription';
  readonly scale = '10⁻⁹ m';
  readonly caption =
    'RNA polymerase opens about fourteen base pairs at a time, copies the template strand into RNA — uracil in place of thymine — and lets the duplex close behind it.';
  readonly detail = 'DNA → pre-mRNA · ~14 bp bubble';

  private strandProgram: Program | null = null;
  private strandMesh: Mesh | null = null;
  private baseProgram: Program | null = null;
  private baseMesh: Mesh | null = null;
  private mrnaProgram: Program | null = null;
  private mrnaMesh: Mesh | null = null;

  private readonly polymerase = new AtomBatch(3);
  private readonly pool = new ParticleField();
  private readonly backdrop = new Backdrop();
  private readonly model = mat4();

  private readonly blobWriter = new AtomWriter(new Float32Array(POLYMERASE_BLOBS * ATOM_STRIDE));
  private readonly blobSeeds: Array<[number, number, number, number]> = [];
  private fork = 0;
  private openAmount = 0;

  init(gl: WebGL2RenderingContext): void {
    this.dispose();

    this.strandProgram = new Program(gl, STRAND_VS, STRAND_FS, 'transcription:strands');
    this.strandMesh = Mesh.fromData(gl, tubeTemplate(TUBE_SEGMENTS, TUBE_RADIAL), {
      param: ATTR.param,
    });

    this.baseProgram = new Program(gl, BASE_VS, BASE_FS, 'transcription:bases');
    this.baseMesh = Mesh.fromData(gl, box(), { position: ATTR.position, normal: ATTR.normal });

    this.mrnaProgram = new Program(gl, MRNA_VS, MRNA_FS, 'transcription:mrna');
    this.mrnaMesh = Mesh.fromData(gl, tubeTemplate(600, 7), { param: ATTR.param });

    const info = new Float32Array(BP_COUNT * 2 * 4);
    const colors = new Float32Array(BP_COUNT * 2 * 4);

    for (let i = 0; i < BP_COUNT; i++) {
      const sense = P53_CDS[i % P53_CDS.length] as Base;
      const anti = complement(sense);
      for (const [slot, base] of [[0, sense], [1, anti]] as const) {
        const index = (i * 2 + slot) * 4;
        info[index] = i - BP_COUNT / 2;
        info[index + 1] = slot;
        info[index + 2] = base === 'A' || base === 'G' ? 1 : 0;
        const rgb = BASE_COLOR[base];
        colors[index] = rgb[0];
        colors[index + 1] = rgb[1];
        colors[index + 2] = rgb[2];
        colors[index + 3] = 1;
      }
    }
    this.baseMesh.attribute('base', ATTR.instance0, info, 4, 1);
    this.baseMesh.attribute('color', ATTR.instance1, colors, 4, 1);

    this.polymerase.init(gl);
    this.pool.init(gl);
    this.backdrop.init(gl);

    // The polymerase is drawn as a cluster of overlapping lobes rather than a
    // single sphere — closer to how a large protein complex actually reads.
    const random = mulberry32(0x901);
    this.blobSeeds.length = 0;
    for (let i = 0; i < POLYMERASE_BLOBS; i++) {
      this.blobSeeds.push([
        (random() * 2 - 1) * 0.62,
        (random() * 2 - 1) * 0.5,
        (random() * 2 - 1) * 0.62,
        0.16 + random() * 0.2,
      ]);
    }

    // Free nucleotides drifting in, waiting to be incorporated.
    const pool = new Float32Array(NUCLEOTIDE_POOL * PARTICLE_STRIDE);
    for (let i = 0; i < NUCLEOTIDE_POOL; i++) {
      const p = i * PARTICLE_STRIDE;
      pool[p] = (random() * 2 - 1) * 2.6;
      pool[p + 1] = (random() * 2 - 1) * 3.2;
      pool[p + 2] = (random() * 2 - 1) * 2.6;
      pool[p + 3] = 0.016 + random() * 0.022;
      const rgb = BASE_COLOR[(['A', 'U', 'G', 'C'] as const)[Math.floor(random() * 4)]!];
      pool[p + 4] = rgb[0];
      pool[p + 5] = rgb[1];
      pool[p + 6] = rgb[2];
      pool[p + 7] = random() * 100;
    }
    this.pool.upload(pool, NUCLEOTIDE_POOL);
  }

  update(ctx: FrameContext): void {
    // The bubble opens as the stage begins and the fork sweeps the sequence.
    this.openAmount = smoothstep(0.02, 0.2, ctx.local) * (1 - smoothstep(0.88, 1.0, ctx.local));
    this.fork = mix(-BP_COUNT * 0.42, BP_COUNT * 0.46, smoothstep(0.05, 0.95, ctx.local));

    // Follow the fork with the polymerase lobes, wobbling as it steps along.
    const forkY = this.fork * RISE;
    const writer = this.blobWriter;
    writer.reset();
    for (let i = 0; i < POLYMERASE_BLOBS; i++) {
      const [ox, oy, oz, radius] = this.blobSeeds[i]!;
      const wobble = Math.sin(ctx.time * 2.2 + i * 1.7) * 0.03;
      writer.push(
        ox * RADIUS * 1.5 + wobble,
        forkY + oy * 0.55,
        oz * RADIUS * 1.5 - wobble,
        radius * (0.9 + 0.1 * Math.sin(ctx.time * 3 + i)),
        [0.58, 0.72, 0.86],
        0.05,
      );
    }
    this.polymerase.upload(writer.data, writer.count);

    const zoom = Math.pow(2, -0.15 + ctx.local * 0.75);
    const z = -1.0 + ctx.local * 2.6;
    m4TRS(this.model, 0, -forkY * 0.55, z, ctx.time * 0.09 + 0.6, zoom);
  }

  render(ctx: FrameContext): void {
    const { gl } = ctx;

    this.backdrop.render(
      gl,
      {
        top: [0.026, 0.024, 0.062],
        bottom: [0.006, 0.005, 0.018],
        glow: [0.36, 0.20, 0.62],
        density: 0.8,
        glowX: 0.3,
        glowY: -0.2,
      },
      ctx.time,
      ctx.alpha,
      ctx.width / ctx.height,
    );

    const helixUniforms = (program: Program): Program =>
      program
        .m4('uModel', this.model)
        .m4('uViewProjection', ctx.camera.viewProjection)
        .v3a('uCameraPos', ctx.camera.position)
        .f('uAlpha', ctx.alpha)
        .f('uTime', ctx.time)
        .f('uRise', RISE)
        .f('uTwist', TWIST_PER_BP)
        .f('uRadius', RADIUS)
        .f('uStrandOffset', BDNA.strandOffset)
        .f('uBend', 0.03)
        .f('uFork', this.fork)
        .f('uBubbleWidth', 7.0)
        .f('uOpenAmount', this.openAmount);

    if (this.strandProgram && this.strandMesh) {
      const program = helixUniforms(this.strandProgram.use())
        .f('uBpCount', BP_COUNT)
        .f('uTubeRadius', 0.082);
      for (const strand of [0, 1]) {
        program.f('uStrand', strand);
        this.strandMesh.draw();
      }
    }

    if (this.baseProgram && this.baseMesh) {
      helixUniforms(this.baseProgram.use())
        .f('uInnerRadius', RADIUS * 0.2)
        .f('uThickness', 0.055)
        .f('uWidth', 0.16);
      this.baseMesh.draw(BP_COUNT * 2);
    }

    if (this.mrnaProgram && this.mrnaMesh) {
      helixUniforms(this.mrnaProgram.use())
        .f('uBpCount', BP_COUNT)
        .f('uTubeRadius', 0.062);
      this.mrnaMesh.draw();
    }

    // The polymerase is translucent so the template stays readable through it.
    gl.depthMask(false);
    this.polymerase.draw(ctx, this.model, ctx.alpha * 0.42, {
      roughness: 0.55,
      translucency: 0.8,
    });
    gl.depthMask(true);

    this.pool.draw(
      ctx,
      this.model,
      ctx.alpha * 0.5,
      { drift: 0.22, swirl: 0.9 },
      Math.round(NUCLEOTIDE_POOL * ctx.quality),
    );
  }

  focus(ctx: FrameContext): FocusHint {
    return { distance: 6.0 - ctx.local * 0.6, aperture: 2.6 };
  }

  dispose(): void {
    this.strandProgram?.dispose();
    this.strandProgram = null;
    this.strandMesh?.dispose();
    this.strandMesh = null;
    this.baseProgram?.dispose();
    this.baseProgram = null;
    this.baseMesh?.dispose();
    this.baseMesh = null;
    this.mrnaProgram?.dispose();
    this.mrnaProgram = null;
    this.mrnaMesh?.dispose();
    this.mrnaMesh = null;
    this.polymerase.dispose();
    this.pool.dispose();
    this.backdrop.dispose();
  }
}
