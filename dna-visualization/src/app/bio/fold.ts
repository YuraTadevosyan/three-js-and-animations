import { mulberry32 } from '../gl/math';
import { P53_PEPTIDE } from './sequence';

/**
 * Cα traces for the p53 transactivation domain.
 *
 * The secondary structure here is the real thing, and it is unusual: the p53
 * N-terminus is intrinsically disordered apart from a single amphipathic helix
 * around residues 17–29. That helix is the entire MDM2 binding site — F19, W23
 * and L26 drop into a hydrophobic cleft on MDM2, and drugs like nutlin work by
 * occupying that same cleft. So the fold is mostly a flailing coil with one
 * ordered stretch, which is exactly what should be on screen.
 */

/** Cα–Cα distance along a peptide backbone, ångström. */
export const CA_SPACING = 3.8;

export type SecondaryStructure = 'coil' | 'helix';

/** Residue range of the MDM2-binding amphipathic helix, 1-based inclusive. */
export const TAD_HELIX: readonly [number, number] = [17, 29];

export function secondaryStructureAt(residueIndex: number): SecondaryStructure {
  const position = residueIndex + 1;
  return position >= TAD_HELIX[0] && position <= TAD_HELIX[1] ? 'helix' : 'coil';
}

export interface FoldedChain {
  /** Cα positions in ångström, one per residue. */
  positions: Array<[number, number, number]>;
  structure: SecondaryStructure[];
}

/**
 * Build a plausible compact conformation for the peptide.
 *
 * Helical stretches use real α-helix parameters — 3.6 residues per turn, 1.5 Å
 * rise, 2.3 Å radius. Coil regions are a persistent random walk at the correct
 * Cα spacing, pulled gently toward the centroid so the domain stays compact
 * rather than wandering off as a straight line.
 */
export function foldPeptide(peptide: string = P53_PEPTIDE, seed = 0x9111): FoldedChain {
  const random = mulberry32(seed);
  const positions: Array<[number, number, number]> = [];
  const structure: SecondaryStructure[] = [];

  // Moving frame: direction of travel plus two perpendiculars.
  let dir: [number, number, number] = [1, 0.18, 0];
  let side: [number, number, number] = [0, 1, 0];
  normalize(dir);
  orthonormalize(dir, side);

  let x = -14;
  let y = 0;
  let z = 0;
  let helixPhase = 0;

  for (let i = 0; i < peptide.length; i++) {
    const kind = secondaryStructureAt(i);
    structure.push(kind);

    if (kind === 'helix') {
      // 100° of rotation and 1.5 Å of rise per residue, on a 2.3 Å radius.
      helixPhase += (100 * Math.PI) / 180;
      const up = cross(dir, side);
      const radial = [
        side[0] * Math.cos(helixPhase) + up[0] * Math.sin(helixPhase),
        side[1] * Math.cos(helixPhase) + up[1] * Math.sin(helixPhase),
        side[2] * Math.cos(helixPhase) + up[2] * Math.sin(helixPhase),
      ] as [number, number, number];

      x += dir[0] * 1.5;
      y += dir[1] * 1.5;
      z += dir[2] * 1.5;

      positions.push([x + radial[0] * 2.3, y + radial[1] * 2.3, z + radial[2] * 2.3]);
      continue;
    }

    // Coil: perturb the direction, keep the step at the real Cα spacing, and
    // apply a weak restoring pull so the chain folds back on itself.
    dir[0] += (random() * 2 - 1) * 0.55;
    dir[1] += (random() * 2 - 1) * 0.55;
    dir[2] += (random() * 2 - 1) * 0.55;

    const pullStrength = 0.045;
    dir[0] -= x * pullStrength;
    dir[1] -= y * pullStrength;
    dir[2] -= z * pullStrength;

    normalize(dir);
    orthonormalize(dir, side);
    helixPhase = 0;

    x += dir[0] * CA_SPACING;
    y += dir[1] * CA_SPACING;
    z += dir[2] * CA_SPACING;
    positions.push([x, y, z]);
  }

  centre(positions);
  return { positions, structure };
}

/** The same chain fully extended, as it leaves the ribosome's exit tunnel. */
export function extendedChain(length: number): Array<[number, number, number]> {
  const positions: Array<[number, number, number]> = [];
  for (let i = 0; i < length; i++) {
    // A shallow zigzag, the way an extended backbone actually runs.
    positions.push([
      (i - length / 2) * CA_SPACING * 0.92,
      Math.sin(i * 1.9) * 1.1,
      Math.cos(i * 1.9) * 0.7,
    ]);
  }
  return positions;
}

function normalize(v: [number, number, number]): void {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  v[0] /= len;
  v[1] /= len;
  v[2] /= len;
}

/** Re-orthogonalise `side` against `dir` via Gram–Schmidt. */
function orthonormalize(dir: [number, number, number], side: [number, number, number]): void {
  const d = dir[0] * side[0] + dir[1] * side[1] + dir[2] * side[2];
  side[0] -= dir[0] * d;
  side[1] -= dir[1] * d;
  side[2] -= dir[2] * d;
  if (Math.hypot(side[0], side[1], side[2]) < 1e-4) {
    // dir and side collapsed onto each other; pick any fresh perpendicular.
    side[0] = dir[1];
    side[1] = -dir[2];
    side[2] = dir[0];
  }
  normalize(side);
}

function cross(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function centre(points: Array<[number, number, number]>): void {
  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (const p of points) {
    cx += p[0];
    cy += p[1];
    cz += p[2];
  }
  cx /= points.length;
  cy /= points.length;
  cz /= points.length;
  for (const p of points) {
    p[0] -= cx;
    p[1] -= cy;
    p[2] -= cz;
  }
}
