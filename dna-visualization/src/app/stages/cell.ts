import { Backdrop } from '../gl/backdrop';
import { FRAG_HEAD, SHADING, SIMPLEX, VERT_HEAD } from '../gl/chunks';
import { icosphere } from '../gl/geometry';
import { m4TRS, mat4, mulberry32 } from '../gl/math';
import { ATTR, Mesh } from '../gl/mesh';
import {
  ATOM_STRIDE, AtomBatch, AtomWriter, BOND_STRIDE, BondBatch, BondWriter,
} from '../gl/molecule';
import { PARTICLE_STRIDE, ParticleField } from '../gl/particles';
import { Program } from '../gl/program';
import type { FocusHint, FrameContext, Stage } from '../gl/stage';

const ORGANELLES = 170;
const FILAMENTS = 84;
const MOTES = 1100;

const MEMBRANE_VS = /* glsl */ `${VERT_HEAD}
${SIMPLEX}

layout(location = ${ATTR.position}) in vec3 aPosition;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uTime;

out vec3 vNormal;
out vec3 vView;
out vec3 vLocal;

/** Lipid-bilayer ripple: two scales, both slowly travelling. */
float ripple(vec3 dir) {
  return snoise(dir * 2.1 + vec3(0.0, uTime * 0.13, 0.0)) * 0.055
       + snoise(dir * 6.4 - vec3(uTime * 0.09, 0.0, 0.0)) * 0.018;
}

void main() {
  vec3 dir = normalize(aPosition);

  vec3 ref = abs(dir.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t1 = normalize(cross(dir, ref));
  vec3 t2 = cross(dir, t1);
  const float eps = 0.03;

  vec3 p0 = dir * (1.0 + ripple(dir));
  vec3 p1 = normalize(dir + t1 * eps) * (1.0 + ripple(normalize(dir + t1 * eps)));
  vec3 p2 = normalize(dir + t2 * eps) * (1.0 + ripple(normalize(dir + t2 * eps)));

  vec3 n = normalize(cross(p1 - p0, p2 - p0));
  n *= sign(dot(n, dir));

  vec4 world = uModel * vec4(p0, 1.0);
  vNormal = normalize(mat3(uModel) * n);
  vView = uCameraPos - world.xyz;
  vLocal = dir;

  gl_Position = uViewProjection * world;
}
`;

const MEMBRANE_FS = /* glsl */ `${FRAG_HEAD}
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

  // Two-sided: we fly through this surface, so the back face has to light
  // correctly rather than going black the moment the camera crosses it.
  if (!gl_FrontFacing) N = -N;

  float facing = clamp(dot(N, V), 0.0, 1.0);
  float rim = pow(1.0 - facing, 2.2);

  vec3 albedo = vec3(0.16, 0.34, 0.62);
  vec3 lit = shadeMolecular(albedo, N, V, 0.28, 0.9, vec3(0.0));

  // Embedded membrane proteins, scattered as bright specks in the bilayer.
  float speck = snoise(vLocal * 26.0);
  lit += vec3(0.5, 0.95, 1.0) * smoothstep(0.55, 0.92, speck) * 0.5;

  // Thin-film shimmer across the surface.
  float film = 0.5 + 0.5 * sin(snoise(vLocal * 3.4 + uTime * 0.07) * 6.0);
  lit += mix(vec3(0.18, 0.42, 0.9), vec3(0.36, 0.9, 0.75), film) * rim * 0.7;

  // Mostly transparent face-on so the interior reads through the membrane.
  float alpha = uAlpha * (0.10 + 0.72 * rim);
  fragColor = vec4(lit, clamp(alpha, 0.0, 1.0));
}
`;

/**
 * Scale 2 — inside a single cell.
 *
 * The camera crosses the plasma membrane during this stage, so the membrane is
 * drawn two-sided and mostly transparent face-on: the interior has to stay
 * legible right up to the moment we pass through it.
 */
export class CellStage implements Stage {
  readonly id = 'cell';
  readonly label = 'Cell';
  readonly scale = '10⁻⁵ m';
  readonly caption =
    'Inside the membrane: mitochondria generating ATP, vesicles in transit along the cytoskeleton, and the nucleus holding the genome apart from all of it.';
  readonly detail = 'Eukaryotic cell · organelles and cytoskeleton';

  private membraneProgram: Program | null = null;
  private membraneMesh: Mesh | null = null;
  private readonly backdrop = new Backdrop();
  private readonly organelles = new AtomBatch(2);
  private readonly filaments = new BondBatch(6);
  private readonly motes = new ParticleField();
  private readonly model = mat4();

  init(gl: WebGL2RenderingContext): void {
    this.dispose();

    this.membraneProgram = new Program(gl, MEMBRANE_VS, MEMBRANE_FS, 'cell:membrane');
    this.membraneMesh = Mesh.fromData(gl, icosphere(4), { position: ATTR.position });
    this.backdrop.init(gl);
    this.organelles.init(gl);
    this.filaments.init(gl);
    this.motes.init(gl);

    const random = mulberry32(0x0ce11);

    // --- Organelles -------------------------------------------------------
    const atoms = new AtomWriter(new Float32Array(ORGANELLES * ATOM_STRIDE));

    // The nucleus, dead centre — it is where the next scale lives.
    atoms.push(0, 0, 0, 0.34, [0.42, 0.66, 1.0], 0.55);

    // A nucleolus visible through it.
    atoms.push(0.08, 0.05, 0.04, 0.11, [0.75, 0.86, 1.0], 0.9);

    for (let i = 2; i < ORGANELLES; i++) {
      const [x, y, z] = sampleShell(random, 0.42, 0.94);
      const roll = random();
      if (roll < 0.18) {
        // Lysosomes: dense, warm, slightly larger.
        atoms.push(x, y, z, 0.035 + random() * 0.022, [1.0, 0.62, 0.34], 0.12);
      } else if (roll < 0.34) {
        // Peroxisomes.
        atoms.push(x, y, z, 0.022 + random() * 0.014, [0.68, 1.0, 0.72], 0.1);
      } else {
        // Transport vesicles.
        atoms.push(x, y, z, 0.015 + random() * 0.02, [0.55, 0.82, 1.0], 0.06);
      }
    }
    this.organelles.upload(atoms.data, atoms.count);

    // --- Mitochondria and cytoskeleton -----------------------------------
    const bonds = new BondWriter(new Float32Array(FILAMENTS * BOND_STRIDE));

    // Mitochondria: short fat capsules with a warm core.
    for (let i = 0; i < 26; i++) {
      const [x, y, z] = sampleShell(random, 0.46, 0.88);
      const dir = sampleShell(random, 1, 1);
      const half = 0.06 + random() * 0.05;
      bonds.push(
        x - dir[0] * half, y - dir[1] * half, z - dir[2] * half,
        x + dir[0] * half, y + dir[1] * half, z + dir[2] * half,
        0.028 + random() * 0.012,
        [1.0, 0.72, 0.42], 0.35, 1,
      );
    }

    // Cytoskeleton: filaments running from near the nucleus out to the cortex.
    for (let i = 26; i < FILAMENTS; i++) {
      const inner = sampleShell(random, 0.36, 0.44);
      const scale = 2.0 + random() * 0.35;
      bonds.push(
        inner[0], inner[1], inner[2],
        inner[0] * scale, inner[1] * scale, inner[2] * scale,
        0.0035 + random() * 0.0025,
        [0.46, 0.78, 0.96], 0.06, 0.55,
      );
    }
    this.filaments.upload(bonds.data, bonds.count);

    // --- Cytoplasmic traffic ---------------------------------------------
    const particles = new Float32Array(MOTES * PARTICLE_STRIDE);
    for (let i = 0; i < MOTES; i++) {
      const [x, y, z] = sampleShell(random, 0.38, 0.97);
      const p = i * PARTICLE_STRIDE;
      particles[p] = x;
      particles[p + 1] = y;
      particles[p + 2] = z;
      particles[p + 3] = 0.012 + random() * 0.022;

      // Ribosomes read warm, free proteins read cool.
      const warm = random() < 0.35;
      particles[p + 4] = warm ? 0.95 : 0.38;
      particles[p + 5] = warm ? 0.72 : 0.78;
      particles[p + 6] = warm ? 0.45 : 1.0;
      particles[p + 7] = random() * 80;
    }
    this.motes.upload(particles, MOTES);
  }

  update(ctx: FrameContext): void {
    // Grow from a distant speck to filling the frame, then keep going until the
    // membrane is behind us and only the nucleus is left ahead.
    const zoom = Math.pow(2, -1.7 + ctx.local * 3.6);
    const z = -6.0 + ctx.local * 9.4;
    m4TRS(this.model, 0, 0, z, ctx.time * 0.045 + ctx.local * 0.5, zoom);
  }

  render(ctx: FrameContext): void {
    const { gl } = ctx;

    this.backdrop.render(
      gl,
      {
        top: [0.020, 0.042, 0.082],
        bottom: [0.006, 0.012, 0.028],
        glow: [0.14, 0.34, 0.70],
        density: 1.0,
        glowX: -0.22,
        glowY: 0.06,
      },
      ctx.time,
      ctx.alpha,
      ctx.width / ctx.height,
    );

    this.organelles.draw(ctx, this.model, ctx.alpha, { roughness: 0.3, translucency: 0.5 });
    this.filaments.draw(ctx, this.model, ctx.alpha, { roughness: 0.45, translucency: 0.2 });

    const moteCount = Math.round(MOTES * ctx.quality);
    this.motes.draw(ctx, this.model, ctx.alpha * 0.75, { drift: 0.05, swirl: 1.7 }, moteCount);

    // Membrane last: it is transparent, so everything behind it must already
    // be in the buffer for the blend to be right.
    if (this.membraneProgram && this.membraneMesh) {
      gl.disable(gl.CULL_FACE);
      gl.depthMask(false);
      this.membraneProgram.use()
        .m4('uModel', this.model)
        .m4('uViewProjection', ctx.camera.viewProjection)
        .v3a('uCameraPos', ctx.camera.position)
        .f('uTime', ctx.time)
        .f('uAlpha', ctx.alpha);
      this.membraneMesh.draw();
      gl.depthMask(true);
      gl.enable(gl.CULL_FACE);
    }
  }

  focus(ctx: FrameContext): FocusHint {
    return { distance: 6.0 - ctx.local * 0.8, aperture: 4.5 };
  }

  dispose(): void {
    this.membraneProgram?.dispose();
    this.membraneProgram = null;
    this.membraneMesh?.dispose();
    this.membraneMesh = null;
    this.backdrop.dispose();
    this.organelles.dispose();
    this.filaments.dispose();
    this.motes.dispose();
  }
}

/** Uniform direction on a sphere, scaled to a radius between min and max. */
function sampleShell(random: () => number, min: number, max: number): [number, number, number] {
  // cos(theta) uniform in [-1,1] avoids the clustering at the poles you get
  // from sampling the polar angle directly.
  const cosTheta = random() * 2 - 1;
  const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
  const phi = random() * Math.PI * 2;
  const radius = min + (max - min) * Math.cbrt(random());
  return [
    sinTheta * Math.cos(phi) * radius,
    sinTheta * Math.sin(phi) * radius,
    cosTheta * radius,
  ];
}
