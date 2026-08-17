import { Backdrop } from '../gl/backdrop';
import { FRAG_HEAD, SHADING, TRANSFORM, VERT_HEAD } from '../gl/chunks';
import { icosphere, tubeTemplate } from '../gl/geometry';
import { m4TRS, mat4, smoothstep } from '../gl/math';
import { ATTR, Mesh } from '../gl/mesh';
import { Program } from '../gl/program';
import type { FocusHint, FrameContext, Stage } from '../gl/stage';

const NUCLEOSOMES = 120;
const TUBE_SEGMENTS = 2600;
const TUBE_RADIAL = 6;

/**
 * The fibre curve, evaluated identically by the bead shader and the DNA shader.
 *
 * Both the condensed solenoid and the extended beads-on-a-string are closed
 * forms of the same index, so unwinding the chromosome is one uniform moving
 * from 0 to 1 — no vertex buffer is ever rewritten.
 */
const FIBER_CURVE = /* glsl */ `
uniform float uCount;
uniform float uOpen;
uniform float uSpacing;
uniform float uCoilRadius;
uniform float uSuperRadius;
uniform float uTime;

vec3 fiberPoint(float i) {
  float centred = i - uCount * 0.5;

  // Extended: a lazily waving string of beads.
  vec3 extended = vec3(
    sin(i * 0.21) * 0.10 + sin(i * 0.061) * 0.30,
    centred * uSpacing,
    cos(i * 0.19) * 0.10 + cos(i * 0.053) * 0.30
  );

  // Condensed: the 30 nm solenoid, roughly six nucleosomes per turn, itself
  // wound into a higher-order coil — the packing that makes a metaphase
  // chromosome compact enough to see down a light microscope.
  float a = i * (6.2831853 / 6.0);
  float y = centred * uSpacing * 0.13;
  vec3 solenoid = vec3(cos(a) * uCoilRadius, y, sin(a) * uCoilRadius);
  float a2 = y * 6.0;
  solenoid.xz += vec2(cos(a2), sin(a2)) * uSuperRadius;

  vec3 p = mix(solenoid, extended, uOpen);

  // Brownian shiver, stronger once the fibre is open and free in solution.
  p += vec3(
    sin(uTime * 0.9 + i * 0.37),
    sin(uTime * 1.1 + i * 0.29),
    cos(uTime * 0.8 + i * 0.41)
  ) * 0.006 * (0.3 + uOpen);

  return p;
}
`;

const BEAD_VS = /* glsl */ `${VERT_HEAD}
${FIBER_CURVE}

layout(location = ${ATTR.position}) in vec3 aPosition;
layout(location = ${ATTR.instance0}) in float aIndex;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uBeadRadius;

out vec3 vNormal;
out vec3 vView;
out float vIndex;

void main() {
  vec3 centre = fiberPoint(aIndex);
  vec3 local = centre + aPosition * uBeadRadius;

  vec4 world = uModel * vec4(local, 1.0);
  vNormal = normalize(mat3(uModel) * aPosition);
  vView = uCameraPos - world.xyz;
  vIndex = aIndex;

  gl_Position = uViewProjection * world;
}
`;

const BEAD_FS = /* glsl */ `${FRAG_HEAD}
${SHADING}

in vec3 vNormal;
in vec3 vView;
in float vIndex;

out vec4 fragColor;

uniform float uAlpha;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);

  // Histone octamers: eight proteins, so give them a faintly banded tint
  // instead of a single flat colour.
  float band = 0.5 + 0.5 * sin(vIndex * 1.7);
  vec3 albedo = mix(vec3(0.72, 0.60, 0.86), vec3(0.92, 0.74, 0.64), band);

  vec3 lit = shadeMolecular(albedo, N, V, 0.38, 0.3, albedo * 0.08);
  fragColor = vec4(lit, uAlpha);
}
`;

const DNA_TUBE_VS = /* glsl */ `${VERT_HEAD}
${TRANSFORM}
${FIBER_CURVE}

layout(location = ${ATTR.param}) in vec2 aParam; // x = t along fibre, y = angle

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uTubeRadius;
uniform float uWrapRadius;
uniform float uTurnsPerBead;

out vec3 vNormal;
out vec3 vView;
out float vT;

/** The DNA duplex itself: wound around the bead path 1.65 turns per histone. */
vec3 wrappedPoint(float t) {
  float i = t * uCount;
  vec3 spine = fiberPoint(i);

  vec3 ahead = fiberPoint(i + 0.5);
  vec3 behind = fiberPoint(i - 0.5);
  vec3 n, bi;
  frameFromTangent(ahead - behind, n, bi);

  float phi = i * uTurnsPerBead * 6.2831853;
  return spine + (n * cos(phi) + bi * sin(phi)) * uWrapRadius;
}

void main() {
  float t = aParam.x;
  float step = 0.35 / uCount;

  vec3 p = wrappedPoint(t);
  vec3 tangent = wrappedPoint(t + step) - wrappedPoint(t - step);

  vec3 n, bi;
  frameFromTangent(tangent, n, bi);
  vec3 offset = n * cos(aParam.y) + bi * sin(aParam.y);

  vec3 local = p + offset * uTubeRadius;
  vec4 world = uModel * vec4(local, 1.0);

  vNormal = normalize(mat3(uModel) * offset);
  vView = uCameraPos - world.xyz;
  vT = t;

  gl_Position = uViewProjection * world;
}
`;

const DNA_TUBE_FS = /* glsl */ `${FRAG_HEAD}
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

  vec3 albedo = vec3(0.34, 0.78, 0.92);

  // A slow pulse travelling the length of the fibre, so the strand reads as
  // one continuous molecule rather than a static pipe.
  float pulse = smoothstep(0.94, 1.0, sin(vT * 22.0 - uTime * 1.4) * 0.5 + 0.5);
  vec3 emissive = vec3(0.25, 0.85, 1.0) * pulse * 0.7;

  vec3 lit = shadeMolecular(albedo, N, V, 0.3, 0.25, emissive);
  fragColor = vec4(lit, uAlpha);
}
`;

/**
 * Scale 4 — chromatin, unwinding.
 *
 * The stage plays as a single continuous release: a condensed higher-order
 * coil at the start, beads-on-a-string by the end, with the DNA duplex visibly
 * wrapped around every histone octamer throughout.
 */
export class ChromatinStage implements Stage {
  readonly id = 'chromatin';
  readonly label = 'Chromatin';
  readonly scale = '10⁻⁸ m';
  readonly caption =
    'DNA does not float free. Every 147 bases wind 1.65 turns around a histone octamer, and those beads coil again into the fibre that condenses into a chromosome.';
  readonly detail = 'Nucleosome · 147 bp per histone core';

  private beadProgram: Program | null = null;
  private beadMesh: Mesh | null = null;
  private tubeProgram: Program | null = null;
  private tubeMesh: Mesh | null = null;

  private readonly backdrop = new Backdrop();
  private readonly model = mat4();
  private open = 0;

  init(gl: WebGL2RenderingContext): void {
    this.dispose();

    this.beadProgram = new Program(gl, BEAD_VS, BEAD_FS, 'chromatin:beads');
    this.beadMesh = Mesh.fromData(gl, icosphere(2), { position: ATTR.position });
    const indices = new Float32Array(NUCLEOSOMES);
    for (let i = 0; i < NUCLEOSOMES; i++) indices[i] = i;
    this.beadMesh.attribute('index', ATTR.instance0, indices, 1, 1);

    this.tubeProgram = new Program(gl, DNA_TUBE_VS, DNA_TUBE_FS, 'chromatin:dna');
    this.tubeMesh = Mesh.fromData(gl, tubeTemplate(TUBE_SEGMENTS, TUBE_RADIAL), {
      param: ATTR.param,
    });

    this.backdrop.init(gl);
  }

  update(ctx: FrameContext): void {
    // Hold the condensed form briefly, release through the middle, then let the
    // open fibre settle before the helix stage takes over.
    this.open = smoothstep(0.12, 0.78, ctx.local);

    const zoom = Math.pow(2, -0.6 + ctx.local * 2.3);
    const z = -3.4 + ctx.local * 6.2;
    m4TRS(this.model, 0, 0, z, ctx.time * 0.06 + ctx.local * 0.9, zoom);
  }

  render(ctx: FrameContext): void {
    const { gl } = ctx;

    this.backdrop.render(
      gl,
      {
        top: [0.028, 0.030, 0.078],
        bottom: [0.008, 0.008, 0.026],
        glow: [0.30, 0.24, 0.72],
        density: 0.9,
        glowX: -0.18,
        glowY: 0.2,
      },
      ctx.time,
      ctx.alpha,
      ctx.width / ctx.height,
    );

    const curveUniforms = (program: Program): Program =>
      program
        .m4('uModel', this.model)
        .m4('uViewProjection', ctx.camera.viewProjection)
        .v3a('uCameraPos', ctx.camera.position)
        .f('uAlpha', ctx.alpha)
        .f('uTime', ctx.time)
        .f('uCount', NUCLEOSOMES)
        .f('uOpen', this.open)
        .f('uSpacing', 0.075)
        .f('uCoilRadius', 0.16)
        .f('uSuperRadius', 0.30);

    if (this.tubeProgram && this.tubeMesh) {
      curveUniforms(this.tubeProgram.use())
        .f('uTubeRadius', 0.009)
        .f('uWrapRadius', 0.041)
        .f('uTurnsPerBead', 1.65);
      this.tubeMesh.draw();
    }

    if (this.beadProgram && this.beadMesh) {
      curveUniforms(this.beadProgram.use()).f('uBeadRadius', 0.032);
      this.beadMesh.draw(NUCLEOSOMES);
    }
  }

  focus(ctx: FrameContext): FocusHint {
    return { distance: 6.2 - ctx.local * 1.4, aperture: 3.2 };
  }

  dispose(): void {
    this.beadProgram?.dispose();
    this.beadProgram = null;
    this.beadMesh?.dispose();
    this.beadMesh = null;
    this.tubeProgram?.dispose();
    this.tubeProgram = null;
    this.tubeMesh?.dispose();
    this.tubeMesh = null;
    this.backdrop.dispose();
  }
}
