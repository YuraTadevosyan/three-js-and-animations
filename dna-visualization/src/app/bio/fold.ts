import { mulberry32 } from '../gl/math';
import { P53_PEPTIDE } from './sequence';

/**
 * Cα traces for a peptide.
 *
 * For p53's transactivation domain the secondary structure is the real thing,
 * and it is unusual: the N-terminus is intrinsically disordered apart from a
 * single amphipathic helix around residues 17-29. That helix is the entire
 * MDM2 binding site — F19, W23 and L26 drop into a hydrophobic cleft on MDM2,
 * and drugs like nutlin work by occupying that same cleft.
 *
 * For any other peptide there is no known answer, so helices are *predicted*
 * with Chou-Fasman propensities. That is a 1974 method and nowhere near modern
 * accuracy; the UI labels it as a prediction rather than passing it off as
 * structure.
 */

/** Cα-Cα distance along a peptide backbone, ångström. */
export const CA_SPACING = 3.8;

export type SecondaryStructure = 'coil' | 'helix';

/** Residue range of the MDM2-binding amphipathic helix, 1-based inclusive. */
export const TAD_HELIX: readonly [number, number] = [17, 29];

/** Residue index (0-based) of the three MDM2-contact residues in p53. */
export const P53_MDM2_CONTACTS = [18, 22, 25];

/**
 * Chou-Fasman helix propensities, P(a). Above 1.0 favours a helix.
 */
const HELIX_PROPENSITY: Readonly<Record<string, number>> = {
  E: 1.51, M: 1.45, A: 1.42, L: 1.21, K: 1.16, F: 1.13, Q: 1.11,
  W: 1.08, I: 1.08, V: 1.06, D: 1.01, H: 1.00, R: 0.98, T: 0.83,
  S: 0.77, C: 0.70, Y: 0.69, N: 0.67, P: 0.57, G: 0.57,
};

/**
 * Chou-Fasman helix prediction.
 *
 * Nucleate where four of any six consecutive residues favour a helix, extend
 * outward while the local four-residue average stays above 1.0, then discard
 * anything shorter than five residues.
 */
export function predictHelices(peptide: string): SecondaryStructure[] {
  const n = peptide.length;
  const structure: SecondaryStructure[] = new Array(n).fill('coil');
  if (n < 6) return structure;

  const propensity = (i: number): number =>
    HELIX_PROPENSITY[peptide[i] ?? ''] ?? 1.0;

  const averageOfFour = (from: number): number => {
    let sum = 0;
    let count = 0;
    for (let i = from; i < from + 4 && i < n; i++) {
      sum += propensity(i);
      count++;
    }
    return count > 0 ? sum / count : 0;
  };

  for (let window = 0; window + 6 <= n; window++) {
    let favourable = 0;
    for (let i = window; i < window + 6; i++) if (propensity(i) > 1.0) favourable++;
    if (favourable < 4) continue;

    let start = window;
    let end = window + 6;
    while (start - 4 >= 0 && averageOfFour(start - 4) > 1.0) start -= 1;
    while (end + 1 <= n && averageOfFour(Math.max(0, end - 3)) > 1.0) end += 1;
    end = Math.min(end, n);

    if (end - start >= 5) {
      for (let i = start; i < end; i++) structure[i] = 'helix';
    }
  }

  return structure;
}

/** The experimentally known annotation, for p53's TAD only. */
export function knownStructure(peptide: string): SecondaryStructure[] | null {
  if (peptide !== P53_PEPTIDE) return null;
  return Array.from({ length: peptide.length }, (_, i) =>
    i + 1 >= TAD_HELIX[0] && i + 1 <= TAD_HELIX[1] ? 'helix' : 'coil',
  );
}

export interface StructureAssignment {
  structure: SecondaryStructure[];
  /** True when this is a Chou-Fasman guess rather than a known annotation. */
  predicted: boolean;
  /** Residues worth flagging, only meaningful for the known p53 case. */
  highlights: readonly number[];
}

export function structureFor(peptide: string): StructureAssignment {
  const known = knownStructure(peptide);
  if (known) return { structure: known, predicted: false, highlights: P53_MDM2_CONTACTS };
  return { structure: predictHelices(peptide), predicted: true, highlights: [] };
}

export interface FoldedChain {
  /** Ca positions in angstrom, one per residue. */
  positions: Array<[number, number, number]>;
}

/**
 * Build a plausible compact conformation for the peptide.
 *
 * Helical stretches use real α-helix parameters — 3.6 residues per turn, 1.5 Å
 * rise, 2.3 Å radius. Coil regions are a persistent random walk at the correct
 * Cα spacing, pulled gently toward the centroid so the domain stays compact
 * rather than wandering off as a straight line.
 */
export function foldPeptide(
  peptide: string,
  structure: readonly SecondaryStructure[],
  seed = 0x9111,
): FoldedChain {
  const random = mulberry32(seed);
  const positions: Array<[number, number, number]> = [];

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
    const kind = structure[i] ?? 'coil';

    if (kind === 'helix') {
      // 100 degrees of rotation and 1.5 A of rise per residue, radius 2.3 A.
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

    // Coil: perturb the direction, keep the step at the real Ca spacing, and
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

  enforceSpacing(positions);
  centre(positions);
  return { positions };
}

/**
 * Re-walk the chain at the real Cα-Cα distance, keeping each step's direction.
 *
 * Helical and coil residues are generated against different references — coil
 * steps advance along the axis, helical ones sit on a 2.3 Å radius around it —
 * so the residue where one meets the other lands up to 6 Å from its neighbour,
 * which draws as a stretched bond. Within a run this changes almost nothing
 * (an α-helix already steps 3.83 Å); it only pulls the seams closed.
 */
function enforceSpacing(positions: Array<[number, number, number]>): void {
  for (let i = 1; i < positions.length; i++) {
    const previous = positions[i - 1]!;
    const current = positions[i]!;
    const dx = current[0] - previous[0];
    const dy = current[1] - previous[1];
    const dz = current[2] - previous[2];
    const distance = Math.hypot(dx, dy, dz);
    if (distance < 1e-6) {
      // Coincident residues have no direction to preserve; step off the axis.
      current[0] = previous[0] + CA_SPACING;
      continue;
    }
    const scale = CA_SPACING / distance;
    current[0] = previous[0] + dx * scale;
    current[1] = previous[1] + dy * scale;
    current[2] = previous[2] + dz * scale;
  }
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
