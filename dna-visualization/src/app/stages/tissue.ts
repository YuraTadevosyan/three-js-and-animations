import { Backdrop } from '../gl/backdrop';
import { FRAG_HEAD, HASH, SHADING, SIMPLEX, VERT_HEAD } from '../gl/chunks';
import { icosphere } from '../gl/geometry';
import { mulberry32 } from '../gl/math';
import { ATTR, Mesh } from '../gl/mesh';
import { Program } from '../gl/program';
import type { FocusHint, FrameContext, Stage } from '../gl/stage';

const MAX_CELLS = 260;

const CELL_VS = /* glsl */ `${VERT_HEAD}
${HASH}
${SIMPLEX}

layout(location = ${ATTR.position}) in vec3 aPosition;
layout(location = ${ATTR.instance0}) in vec4 aCell;   // xyz = centre, w = radius
layout(location = ${ATTR.instance1}) in vec4 aTraits; // x = seed, yzw = tint

uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uTime;
uniform float uZoom;
uniform float uDepthOffset;
uniform float uWobble;

out vec3 vNormal;
out vec3 vView;
out vec3 vTint;
out float vSeed;
out float vFade;

/** Radial displacement of the membrane at a point on the unit sphere. */
float membrane(vec3 dir, float seed) {
  float slow = snoise(dir * 1.7 + vec3(seed, seed * 0.7, uTime * 0.16));
  float fine = snoise(dir * 4.3 + vec3(seed * 2.1, uTime * 0.24, seed));
  return (slow * 0.72 + fine * 0.28) * uWobble;
}

void main() {
  vec3 dir = normalize(aPosition);
  float seed = aTraits.x;

  // Finite-difference the displacement across two tangents so the normal stays
  // smooth. Deriving it in the fragment shader instead would facet the surface
  // at this triangle density, and these cells are mostly rim light.
  vec3 ref = abs(dir.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t1 = normalize(cross(dir, ref));
  vec3 t2 = cross(dir, t1);
  const float eps = 0.045;

  float d0 = membrane(dir, seed);
  float d1 = membrane(normalize(dir + t1 * eps), seed);
  float d2 = membrane(normalize(dir + t2 * eps), seed);

  vec3 p0 = dir * (1.0 + d0);
  vec3 p1 = normalize(dir + t1 * eps) * (1.0 + d1);
  vec3 p2 = normalize(dir + t2 * eps) * (1.0 + d2);
  vec3 localNormal = normalize(cross(p1 - p0, p2 - p0));
  // cross() above can flip depending on tangent handedness; align to the sphere.
  localNormal *= sign(dot(localNormal, dir));

  float radius = aCell.w * uZoom;
  vec3 centre = aCell.xyz * uZoom + vec3(0.0, 0.0, uDepthOffset);
  vec3 world = centre + p0 * radius;

  vNormal = localNormal;
  vView = uCameraPos - world;
  vTint = aTraits.yzw;
  vSeed = seed;

  // Fade cells out as they pass the lens instead of letting them clip through.
  float distanceToCamera = length(uCameraPos - centre);
  vFade = smoothstep(0.0, 2.2, distanceToCamera - radius * 0.4);

  gl_Position = uViewProjection * vec4(world, 1.0);
}
`;

const CELL_FS = /* glsl */ `${FRAG_HEAD}
${HASH}
${SIMPLEX}
${SHADING}

in vec3 vNormal;
in vec3 vView;
in vec3 vTint;
in float vSeed;
in float vFade;

out vec4 fragColor;

uniform float uAlpha;
uniform float uTime;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);

  float facing = clamp(dot(N, V), 0.0, 1.0);
  float rim = pow(1.0 - facing, 2.6);

  // Cells are mostly water: almost everything visible is the membrane's rim
  // and whatever light scatters back out of the interior.
  vec3 albedo = vTint * 0.55;
  vec3 lit = shadeMolecular(albedo, N, V, 0.42, 0.85, vec3(0.0));

  // Fake interior: organelle speckle that only shows where we look *through*
  // the cell, weighted by how face-on the surface is.
  float speckle = fbm(N * 5.5 + vec3(vSeed * 7.3, uTime * 0.09, vSeed), 3);
  vec3 interior = vTint * (0.35 + 0.65 * smoothstep(0.1, 0.8, speckle));
  lit += interior * facing * facing * 0.34;

  // Nucleus: a single bright core seen through the membrane.
  float core = pow(facing, 7.0);
  lit += mix(vec3(0.35, 0.72, 1.0), vTint, 0.35) * core * 0.5;

  lit += vec3(0.45, 0.86, 1.0) * rim * 0.5;

  // Low floor on purpose: with a couple of cells overlapping on most view
  // rays, a high constant term accumulates into a flat bright wash.
  float alpha = uAlpha * vFade * (0.12 + 0.62 * rim + 0.14 * facing);
  fragColor = vec4(lit * vFade, clamp(alpha, 0.0, 1.0));
}
`;

/**
 * Scale 1 — a field of drifting cells.
 *
 * The opening shot. Nothing here is individually detailed; the job is to read
 * as living tissue at a glance and to establish the dive, so the whole field
 * translates past the lens as the stage plays out.
 */
export class TissueStage implements Stage {
  readonly id = 'tissue';
  readonly label = 'Tissue';
  readonly scale = '10⁻³ m';
  readonly caption =
    'Roughly thirty trillion cells. Every one of them carries the same two metres of DNA, folded to fit inside a nucleus six micrometres across.';
  readonly detail = 'Human tissue · ~20 µm per cell';

  private program: Program | null = null;
  private mesh: Mesh | null = null;
  private readonly backdrop = new Backdrop();
  private count = MAX_CELLS;

  init(gl: WebGL2RenderingContext): void {
    this.dispose();

    this.program = new Program(gl, CELL_VS, CELL_FS, 'tissue:cells');
    this.backdrop.init(gl);

    const sphere = icosphere(2);
    const mesh = Mesh.fromData(gl, sphere, { position: ATTR.position });

    const cells = new Float32Array(MAX_CELLS * 4);
    const traits = new Float32Array(MAX_CELLS * 4);
    const random = mulberry32(0x5eed);

    for (let i = 0; i < MAX_CELLS; i++) {
      // Distribute through a slab we fly along, biased away from dead centre so
      // the camera path isn't blocked by a cell sitting on the axis.
      const angle = random() * Math.PI * 2;
      const radius = 1.1 + Math.pow(random(), 0.7) * 7.4;
      cells[i * 4] = Math.cos(angle) * radius;
      cells[i * 4 + 1] = Math.sin(angle) * radius * 0.78;
      cells[i * 4 + 2] = -22 + random() * 26;
      cells[i * 4 + 3] = 0.42 + random() * 0.85;

      const warm = random();
      traits[i * 4] = random() * 40;
      traits[i * 4 + 1] = 0.24 + warm * 0.34;
      traits[i * 4 + 2] = 0.52 + warm * 0.24;
      traits[i * 4 + 3] = 0.86 + (1 - warm) * 0.14;
    }

    mesh.attribute('cell', ATTR.instance0, cells, 4, 1);
    mesh.attribute('traits', ATTR.instance1, traits, 4, 1);
    this.mesh = mesh;
  }

  update(ctx: FrameContext): void {
    this.count = Math.max(60, Math.round(MAX_CELLS * ctx.quality));
  }

  render(ctx: FrameContext): void {
    const { gl } = ctx;
    if (!this.program || !this.mesh) return;

    this.backdrop.render(ctx, {
      top: [0.016, 0.035, 0.075],
      bottom: [0.004, 0.008, 0.02],
      glow: [0.10, 0.30, 0.62],
      density: 0.85,
      glowX: 0.18,
      glowY: 0.12,
    });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);

    const zoom = Math.pow(2, -0.9 + ctx.local * 2.4);

    this.program.use()
      .m4('uViewProjection', ctx.camera.viewProjection)
      .v3a('uCameraPos', ctx.camera.position)
      .f('uTime', ctx.time)
      .f('uAlpha', ctx.alpha)
      .f('uZoom', zoom)
      .f('uDepthOffset', -2.0 + ctx.local * 16.0)
      .f('uWobble', 0.11);

    this.mesh.draw(this.count);

    gl.depthMask(true);
  }

  focus(ctx: FrameContext): FocusHint {
    return { distance: 7.5 - ctx.local * 2.0, aperture: 9.0 };
  }

  dispose(): void {
    this.program?.dispose();
    this.program = null;
    this.mesh?.dispose();
    this.mesh = null;
    this.backdrop.dispose();
  }
}
