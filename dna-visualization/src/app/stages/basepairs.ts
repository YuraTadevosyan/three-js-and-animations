import { C1_SPAN, buildPair } from '../bio/bases';
import {
  BDNA, ELEMENT_COLOR, P53_CDS, TWIST_PER_BP, complement, type Base,
} from '../bio/sequence';
import { Backdrop } from '../gl/backdrop';
import { m4TRS, mat4, mulberry32 } from '../gl/math';
import {
  ATOM_STRIDE, AtomBatch, AtomWriter, BOND_STRIDE, BondBatch, BondWriter,
} from '../gl/molecule';
import { PARTICLE_STRIDE, ParticleField } from '../gl/particles';
import type { FocusHint, FrameContext, Stage } from '../gl/stage';

/** Base pairs shown at atomic detail. Any more and the frame is unreadable. */
const PAIRS = 7;
const WATER = 500;

/** Ångström → world units. Matches the helix stage's 1 unit = 10 Å. */
const UNIT = 0.1;

/** Van der Waals-ish display radii, scaled for legibility rather than realism. */
const ATOM_RADIUS: Record<string, number> = {
  C: 0.30,
  N: 0.30,
  O: 0.29,
  P: 0.36,
};

/**
 * Scale 6 — one turn of the ladder, atom by atom.
 *
 * The point of this stage is the asymmetry that makes replication possible:
 * adenine offers two hydrogen bonds and thymine accepts exactly two, guanine
 * offers three and cytosine accepts three. Nothing else fits, so every strand
 * carries a complete template for its partner.
 */
export class BasePairStage implements Stage {
  readonly id = 'basepairs';
  readonly label = 'Base pairs';
  readonly scale = '10⁻¹⁰ m';
  readonly caption =
    'A pairs with T across two hydrogen bonds; G pairs with C across three. A purine always faces a pyrimidine, which is why the duplex stays exactly 20 ångström wide whatever the sequence says.';
  readonly detail = 'C · N · O coloured by element · H-bonds dashed';

  private readonly atoms = new AtomBatch(2);
  private readonly bonds = new BondBatch(7);
  private readonly hbonds = new BondBatch(5);
  private readonly water = new ParticleField();
  private readonly backdrop = new Backdrop();
  private readonly model = mat4();

  init(gl: WebGL2RenderingContext): void {
    this.dispose();

    this.atoms.init(gl);
    this.bonds.init(gl);
    this.hbonds.init(gl);
    this.water.init(gl);
    this.backdrop.init(gl);

    // Generous headroom: a G–C pair carries more atoms than an A–T one.
    const atomWriter = new AtomWriter(new Float32Array(PAIRS * 64 * ATOM_STRIDE));
    const bondWriter = new BondWriter(new Float32Array(PAIRS * 72 * BOND_STRIDE));
    const hbondWriter = new BondWriter(new Float32Array(PAIRS * 12 * BOND_STRIDE));

    const middle = Math.floor(PAIRS / 2);

    for (let i = 0; i < PAIRS; i++) {
      const sense = P53_CDS[(i + 12) % P53_CDS.length] as Exclude<Base, 'U'>;
      const anti = complement(sense) as Exclude<Base, 'U'>;
      const pair = buildPair(sense, anti);

      // Place the pair plane at its rise and twist along the helix.
      const bp = i - middle;
      const angle = bp * TWIST_PER_BP;
      const height = bp * BDNA.rise * UNIT;

      // A few degrees of propeller twist — real base pairs are not quite flat.
      const propeller = ((i % 2 === 0 ? 1 : -1) * 11 * Math.PI) / 180;

      const place = (x: number, y: number): [number, number, number] => {
        // Local pair frame: x runs C1' to C1', y lies in the pair plane.
        const cx = (x - C1_SPAN / 2) * UNIT;
        const cy = y * UNIT;

        // Propeller twist rotates the pair about its own long axis.
        const py = cy * Math.cos(propeller);
        const pz = cy * Math.sin(propeller);

        return [
          cx * Math.cos(angle) - pz * Math.sin(angle),
          height + py,
          cx * Math.sin(angle) + pz * Math.cos(angle),
        ];
      };

      for (const atom of pair.atoms) {
        const [x, y, z] = place(atom.x, atom.y);
        const color = ELEMENT_COLOR[atom.element] ?? ELEMENT_COLOR['C']!;
        const radius = (ATOM_RADIUS[atom.element] ?? 0.3) * UNIT * 2.4;
        // Nitrogen and oxygen carry the hydrogen bonding, so let them glow.
        const glow = atom.element === 'N' || atom.element === 'O' ? 0.28 : 0.08;
        atomWriter.push(x, y, z, radius, color, glow);
      }

      for (const [a, b] of pair.bonds) {
        const pa = pair.atoms[a]!;
        const pb = pair.atoms[b]!;
        const [ax, ay, az] = place(pa.x, pa.y);
        const [bx, by, bz] = place(pb.x, pb.y);
        // Covalent bonds take the average tint of the atoms they join.
        const ca = ELEMENT_COLOR[pa.element] ?? ELEMENT_COLOR['C']!;
        const cb = ELEMENT_COLOR[pb.element] ?? ELEMENT_COLOR['C']!;
        bondWriter.push(
          ax, ay, az, bx, by, bz, 0.026,
          [(ca[0] + cb[0]) / 2, (ca[1] + cb[1]) / 2, (ca[2] + cb[2]) / 2],
          0.05, 1,
        );
      }

      // Hydrogen bonds as a row of short dashes rather than a solid rod: they
      // are electrostatic attractions, not covalent bonds, and drawing them
      // solid would read as the same kind of connection as the ring bonds.
      for (const [a, b] of pair.hbonds) {
        const pa = pair.atoms[a]!;
        const pb = pair.atoms[b]!;
        const [ax, ay, az] = place(pa.x, pa.y);
        const [bx, by, bz] = place(pb.x, pb.y);
        const dashes = 4;
        for (let d = 0; d < dashes; d++) {
          const t0 = d / dashes + 0.06;
          const t1 = (d + 1) / dashes - 0.06;
          hbondWriter.push(
            ax + (bx - ax) * t0, ay + (by - ay) * t0, az + (bz - az) * t0,
            ax + (bx - ax) * t1, ay + (by - ay) * t1, az + (bz - az) * t1,
            0.011, [0.72, 0.94, 1.0], 0.85, 0.9,
          );
        }
      }
    }

    this.atoms.upload(atomWriter.data, atomWriter.count);
    this.bonds.upload(bondWriter.data, bondWriter.count);
    this.hbonds.upload(hbondWriter.data, hbondWriter.count);

    // Ordered water in the minor groove.
    const random = mulberry32(0xa71e2);
    const drops = new Float32Array(WATER * PARTICLE_STRIDE);
    for (let i = 0; i < WATER; i++) {
      const bp = (random() - 0.5) * PAIRS;
      const angle = random() * Math.PI * 2;
      const radius = BDNA.backboneRadius * UNIT * (0.9 + random() * 1.1);
      const p = i * PARTICLE_STRIDE;
      drops[p] = Math.cos(angle) * radius;
      drops[p + 1] = bp * BDNA.rise * UNIT;
      drops[p + 2] = Math.sin(angle) * radius;
      drops[p + 3] = 0.014 + random() * 0.016;
      drops[p + 4] = 0.45;
      drops[p + 5] = 0.8;
      drops[p + 6] = 1.0;
      drops[p + 7] = random() * 70;
    }
    this.water.upload(drops, WATER);
  }

  update(ctx: FrameContext): void {
    const zoom = Math.pow(2, 0.4 + ctx.local * 1.2);
    const z = -0.6 + ctx.local * 3.2;
    m4TRS(this.model, 0, 0, z, ctx.time * 0.1 + ctx.local * 0.8, zoom);
  }

  render(ctx: FrameContext): void {
    this.backdrop.render(ctx, {
      top: [0.016, 0.026, 0.058],
      bottom: [0.003, 0.006, 0.016],
      glow: [0.10, 0.30, 0.55],
      density: 0.6,
      glowX: -0.3,
      glowY: -0.1,
    });

    this.bonds.draw(ctx, this.model, ctx.alpha, { roughness: 0.42, translucency: 0.15 });
    this.atoms.draw(ctx, this.model, ctx.alpha, { roughness: 0.24, translucency: 0.3 });
    this.hbonds.draw(ctx, this.model, ctx.alpha, { roughness: 0.6, translucency: 0.6 });
    this.water.draw(
      ctx,
      this.model,
      ctx.alpha * 0.4,
      { drift: 0.04, swirl: 1.4 },
      Math.round(WATER * ctx.quality),
    );
  }

  focus(ctx: FrameContext): FocusHint {
    return { distance: 6.0 - ctx.local * 0.9, aperture: 5.0 };
  }

  dispose(): void {
    this.atoms.dispose();
    this.bonds.dispose();
    this.hbonds.dispose();
    this.water.dispose();
    this.backdrop.dispose();
  }
}
