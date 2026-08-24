import { MAX_RESIDUES, type Codon } from '../bio/analysis';
import {
  CA_SPACING, extendedChain, foldPeptide, structureFor,
  type SecondaryStructure,
} from '../bio/fold';
import type { SequenceStore } from '../bio/store';
import {
  AMINO_ACIDS, BASE_COLOR, P53_CODONS, P53_PEPTIDE, RESIDUE_COLOR, type Base,
} from '../bio/sequence';
import { Backdrop } from '../gl/backdrop';
import { clamp, m4TRS, mat4, mix, mulberry32, saturate, smoothstep } from '../gl/math';
import {
  ATOM_STRIDE, AtomBatch, AtomWriter, BOND_STRIDE, BondBatch, BondWriter,
} from '../gl/molecule';
import { PARTICLE_STRIDE, ParticleField } from '../gl/particles';
import type { FocusHint, FrameContext, Stage } from '../gl/stage';

const RIBOSOME_BLOBS = 46;
const CHAPERONES = 320;

/** Ångström → world units, matching the other molecular stages. */
const UNIT = 0.1;

/** Shown when the box is empty, so the scene always has a molecule. */
const DEFAULT_PEPTIDE = P53_PEPTIDE;
const DEFAULT_CODONS: readonly Codon[] = P53_CODONS;

/** Where the polypeptide leaves the large subunit. */
const EXIT: readonly [number, number, number] = [0, -0.55, 0];

/**
 * Scale 8 — translation and folding.
 *
 * The ribosome reads the transcript three bases at a time and the chain that
 * comes out the exit tunnel collapses into shape. For p53's N-terminus that
 * shape is mostly *no* shape: the domain is intrinsically disordered apart
 * from one amphipathic helix, and that helix is the entire MDM2 binding site.
 */
export class TranslationStage implements Stage {
  readonly id = 'translation';
  readonly label = 'Translation';
  readonly scale = '10⁻⁹ m';
  get caption(): string {
    return this.predicted
      ? 'The ribosome reads three bases per amino acid. The chain leaves the exit tunnel and collapses into whatever shape its side chains favour — here a Chou–Fasman prediction, not a solved structure.'
      : 'The ribosome reads three bases per amino acid. The chain leaves the exit tunnel and folds — here into one amphipathic helix on an otherwise disordered domain, the helix that MDM2 grips.';
  }

  get detail(): string {
    if (!this.predicted) return '60 codons · helix at residues 17–29 · F19 W23 L26';
    const helices = this.structure.filter((s) => s === 'helix').length;
    return `${this.codons.length} codons · ${this.peptide.length} aa · ${helices} predicted helical`;
  }

  constructor(private readonly store: SequenceStore) {}

  private readonly ribosome = new AtomBatch(3);
  private readonly chain = new AtomBatch(2);
  private readonly bonds = new BondBatch(6);
  private readonly mrna = new BondBatch(6);
  private readonly chaperones = new ParticleField();
  private readonly backdrop = new Backdrop();
  private readonly model = mat4();

  // Buffers are sized for the longest sequence the store will accept, so a
  // paste never has to reallocate mid-frame.
  private readonly ribosomeWriter = new AtomWriter(new Float32Array(RIBOSOME_BLOBS * ATOM_STRIDE));
  private readonly chainWriter = new AtomWriter(new Float32Array((MAX_RESIDUES + 8) * ATOM_STRIDE));
  private readonly bondWriter = new BondWriter(new Float32Array((MAX_RESIDUES + 12) * BOND_STRIDE));
  private readonly mrnaWriter = new BondWriter(new Float32Array((MAX_RESIDUES * 3 + 8) * BOND_STRIDE));

  private readonly blobSeeds: Array<[number, number, number, number, number]> = [];
  private synthesised = 0;

  // Everything below is derived from the active sequence.
  private peptide = '';
  private codons: readonly Codon[] = [];
  private structure: readonly SecondaryStructure[] = [];
  private highlights: readonly number[] = [];
  private predicted = false;
  private folded: Array<[number, number, number]> = [];
  private extended: Array<[number, number, number]> = [];
  private sequenceVersion = -1;

  init(gl: WebGL2RenderingContext): void {
    this.dispose();

    this.ribosome.init(gl);
    this.chain.init(gl);
    this.bonds.init(gl);
    this.mrna.init(gl);
    this.chaperones.init(gl);
    this.backdrop.init(gl);

    // Two subunits: the large one above, the small one clamped below with the
    // transcript running between them.
    const random = mulberry32(0x1b05);
    this.blobSeeds.length = 0;
    for (let i = 0; i < RIBOSOME_BLOBS; i++) {
      const large = i < RIBOSOME_BLOBS * 0.62;
      const spread = large ? 0.5 : 0.38;
      this.blobSeeds.push([
        (random() * 2 - 1) * spread,
        (large ? 0.16 : -0.24) + (random() * 2 - 1) * (large ? 0.3 : 0.16),
        (random() * 2 - 1) * spread,
        (large ? 0.17 : 0.13) + random() * 0.12,
        large ? 0 : 1,
      ]);
    }

    const drift = new Float32Array(CHAPERONES * PARTICLE_STRIDE);
    for (let i = 0; i < CHAPERONES; i++) {
      const p = i * PARTICLE_STRIDE;
      drift[p] = (random() * 2 - 1) * 2.4;
      drift[p + 1] = (random() * 2 - 1) * 2.0;
      drift[p + 2] = (random() * 2 - 1) * 2.4;
      drift[p + 3] = 0.012 + random() * 0.02;
      drift[p + 4] = 0.45;
      drift[p + 5] = 0.72;
      drift[p + 6] = 0.95;
      drift[p + 7] = random() * 120;
    }
    this.chaperones.upload(drift, CHAPERONES);

    this.rebuild();
  }

  /**
   * Translate the active sequence and fold the result.
   *
   * This is where a pasted sequence pays off most visibly: a different ORF is
   * a different peptide, which is a different set of side chains, which folds
   * into a different shape. For p53 the secondary structure is the known
   * annotation; for anything else it is a Chou–Fasman prediction and the
   * caption says so.
   */
  private rebuild(): void {
    const { coding } = this.store.analysis;
    const peptide = (this.store.isFallback ? '' : coding.peptide).slice(0, MAX_RESIDUES);

    // Falling back to the default sequence must also fall back to its peptide,
    // or the transcript and the chain would be showing different molecules.
    const fallback = this.store.isFallback || peptide.length === 0;
    this.peptide = fallback ? DEFAULT_PEPTIDE : peptide;
    this.codons = fallback ? DEFAULT_CODONS : coding.codons.slice(0, MAX_RESIDUES);

    const assignment = structureFor(this.peptide);
    this.structure = assignment.structure;
    this.highlights = assignment.highlights;
    this.predicted = assignment.predicted;

    this.folded = foldPeptide(this.peptide, this.structure).positions;
    this.extended = extendedChain(this.peptide.length);
    this.sequenceVersion = this.store.version;
  }

  update(ctx: FrameContext): void {
    if (this.sequenceVersion !== this.store.version) this.rebuild();

    const progress = smoothstep(0.04, 0.82, ctx.local);
    this.synthesised = progress * this.peptide.length;

    this.buildRibosome(ctx);
    this.buildTranscript(ctx);
    this.buildChain(ctx);

    const zoom = Math.pow(2, -0.1 + ctx.local * 0.6);
    m4TRS(this.model, 0, 0.25, -0.6 + ctx.local * 2.2, ctx.time * 0.11 + 0.4, zoom);
  }

  private buildRibosome(ctx: FrameContext): void {
    const writer = this.ribosomeWriter;
    writer.reset();

    // The subunits ratchet against each other with each codon translocation.
    const ratchet = Math.sin(this.synthesised * Math.PI * 2) * 0.012;

    for (const [ox, oy, oz, radius, small] of this.blobSeeds) {
      const shift = small ? -ratchet : ratchet;
      writer.push(
        ox + shift,
        oy + Math.sin(ctx.time * 1.6 + ox * 8) * 0.006,
        oz,
        radius,
        small ? [0.52, 0.62, 0.78] : [0.62, 0.68, 0.82],
        0.04,
      );
    }
    this.ribosome.upload(writer.data, writer.count);
  }

  /** The transcript, drawn as coloured codon triplets running through the A site. */
  private buildTranscript(ctx: FrameContext): void {
    const writer = this.mrnaWriter;
    writer.reset();

    const read = this.synthesised;
    const span = 2.6;

    for (let i = 0; i < this.codons.length; i++) {
      // Position along the transcript relative to the codon being read.
      const offset = (i - read) * 0.115;
      if (offset < -span || offset > span) continue;

      const codon = this.codons[i]!;
      const x = offset;
      const y = -0.42 + Math.sin(offset * 1.4 + ctx.time * 0.3) * 0.03;

      // One short segment per base, so the triplet structure is visible.
      for (let b = 0; b < 3; b++) {
        const base = codon.codon[b] as Base;
        const rgb = BASE_COLOR[base === 'T' ? 'U' : base];
        const bx = x + (b - 1) * 0.032;
        const fade = 1 - saturate(Math.abs(offset) / span);
        const inSite = Math.abs(offset) < 0.06 ? 1 : 0;
        writer.push(
          bx, y, 0, bx, y, 0.055,
          0.022, rgb, 0.35 + inSite * 1.2, fade,
        );
      }
    }
    this.mrna.upload(writer.data, writer.count);
  }

  /**
   * The polypeptide.
   *
   * Each residue blends from a position in the extended chain leaving the exit
   * tunnel toward its place in the folded domain, on a delay set by how long
   * ago it was synthesised — so the chain is visibly folding from the N
   * terminus while the C terminus is still being made.
   */
  private buildChain(ctx: FrameContext): void {
    const atoms = this.chainWriter;
    const bonds = this.bondWriter;
    atoms.reset();
    bonds.reset();

    const count = Math.floor(this.synthesised);
    const positions: Array<[number, number, number]> = [];

    // The folded domain drifts below the ribosome and turns slowly.
    const domainY = EXIT[1] - 0.95;
    const spin = ctx.time * 0.35;
    const cos = Math.cos(spin);
    const sin = Math.sin(spin);

    for (let i = 0; i <= count && i < this.peptide.length; i++) {
      const age = this.synthesised - i;
      const folding = smoothstep(2, 22, age);

      // Extended: hanging out of the exit tunnel, newest residue at the top.
      const drop = clamp(age, 0, 16) * CA_SPACING * UNIT * 0.5;
      const ex = this.extended[i]!;
      const extendedPos: [number, number, number] = [
        EXIT[0] + ex[1] * UNIT * 0.5,
        EXIT[1] - drop,
        EXIT[2] + ex[2] * UNIT * 0.5,
      ];

      // Folded: the real conformation, spun into place.
      const f = this.folded[i]!;
      const fx = f[0] * UNIT;
      const fy = f[1] * UNIT;
      const fz = f[2] * UNIT;
      const foldedPos: [number, number, number] = [
        fx * cos - fz * sin,
        domainY + fy,
        fx * sin + fz * cos,
      ];

      positions.push([
        mix(extendedPos[0], foldedPos[0], folding),
        mix(extendedPos[1], foldedPos[1], folding),
        mix(extendedPos[2], foldedPos[2], folding),
      ]);
    }

    for (let i = 0; i < positions.length; i++) {
      const residue = this.peptide[i]!;
      const info = AMINO_ACIDS[residue];
      const color = RESIDUE_COLOR[info?.cls ?? 'special'];
      const [x, y, z] = positions[i]!;

      // The three residues that dock into MDM2 get flagged.
      const isContact = this.highlights.includes(i);
      const helical = this.structure[i] === 'helix';
      const radius = (isContact ? 0.055 : helical ? 0.042 : 0.036);
      const glow = isContact ? 1.1 : helical ? 0.3 : 0.08;

      atoms.push(x, y, z, radius, color, glow);

      if (i > 0) {
        const [px, py, pz] = positions[i - 1]!;
        bonds.push(px, py, pz, x, y, z, 0.016, color, helical ? 0.25 : 0.05, 1);
      }
    }

    this.chain.upload(atoms.data, atoms.count);
    this.bonds.upload(bonds.data, bonds.count);
  }

  render(ctx: FrameContext): void {
    const { gl } = ctx;

    this.backdrop.render(ctx, {
      top: [0.030, 0.026, 0.058],
      bottom: [0.008, 0.006, 0.018],
      glow: [0.44, 0.26, 0.52],
      density: 0.8,
      glowX: -0.26,
      glowY: 0.24,
    });

    this.mrna.draw(ctx, this.model, ctx.alpha, { roughness: 0.35, translucency: 0.4 });
    this.bonds.draw(ctx, this.model, ctx.alpha, { roughness: 0.4, translucency: 0.3 });
    this.chain.draw(ctx, this.model, ctx.alpha, { roughness: 0.28, translucency: 0.4 });

    // Translucent ribosome, so the transcript threading it stays visible.
    gl.depthMask(false);
    this.ribosome.draw(ctx, this.model, ctx.alpha * 0.4, { roughness: 0.6, translucency: 0.85 });
    gl.depthMask(true);

    this.chaperones.draw(
      ctx,
      this.model,
      ctx.alpha * 0.4,
      { drift: 0.3, swirl: 0.7 },
      Math.round(CHAPERONES * ctx.quality),
    );
  }

  focus(ctx: FrameContext): FocusHint {
    return { distance: 6.1 - ctx.local * 0.8, aperture: 5.5 };
  }

  dispose(): void {
    this.ribosome.dispose();
    this.chain.dispose();
    this.bonds.dispose();
    this.mrna.dispose();
    this.chaperones.dispose();
    this.backdrop.dispose();
  }
}
