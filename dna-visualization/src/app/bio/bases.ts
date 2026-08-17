import type { Base } from './sequence';

/**
 * Idealised planar models of the four nucleobases.
 *
 * What is real here: the ring topology (purines are a fused six + five ring,
 * pyrimidines a single six ring), which atoms are nitrogen and which carbon,
 * where the exocyclic oxygens and amino groups hang, and which atoms make the
 * hydrogen bonds — two for A–T, three for G–C.
 *
 * What is idealised: the coordinates. Rings are built as regular polygons at a
 * uniform 1.39 Å bond length rather than taken from a crystal structure, and
 * each base is then slid along the pair axis until its hydrogen-bonding atoms
 * sit the correct distance from its partner's. Close enough to be honest at
 * this zoom, and it means the geometry is generated rather than shipped.
 */

export type Element = 'C' | 'N' | 'O' | 'P';

export interface BaseAtom {
  x: number;
  y: number;
  element: Element;
  name: string;
}

export interface BaseModel {
  atoms: BaseAtom[];
  bonds: Array<readonly [number, number]>;
  /** Indices of the atoms that hydrogen-bond to the partner base. */
  hbondAtoms: number[];
  /** Index of the glycosidic nitrogen, where the sugar attaches. */
  glycosidic: number;
}

type V2 = readonly [number, number];

/** Aromatic C–C / C–N bond length, in ångström. */
const BOND = 1.39;
/** Typical exocyclic double/single bond to O or N. */
const EXO = 1.28;
/** Watson–Crick hydrogen bond length, donor heavy atom to acceptor. */
export const HBOND_LENGTH = 2.9;
/** C1'–C1' distance across a Watson–Crick pair. */
export const C1_SPAN = 10.5;

/**
 * A regular n-gon containing the edge a→b, walking from a toward b.
 * `flip` selects which side of the edge the polygon sits on.
 */
function ring(a: V2, b: V2, n: number, flip: boolean): V2[] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const side = Math.hypot(dx, dy);
  const apothem = side / 2 / Math.tan(Math.PI / n);

  const sign = flip ? -1 : 1;
  const px = (-dy / side) * sign;
  const py = (dx / side) * sign;
  const cx = (a[0] + b[0]) / 2 + px * apothem;
  const cy = (a[1] + b[1]) / 2 + py * apothem;

  const radius = Math.hypot(a[0] - cx, a[1] - cy);
  const start = Math.atan2(a[1] - cy, a[0] - cx);

  let delta = Math.atan2(b[1] - cy, b[0] - cx) - start;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  const step = Math.sign(delta) * ((Math.PI * 2) / n);

  const points: V2[] = [];
  for (let k = 0; k < n; k++) {
    points.push([cx + radius * Math.cos(start + step * k), cy + radius * Math.sin(start + step * k)]);
  }
  return points;
}

/** Centroid of a set of points. */
function centroid(points: V2[]): V2 {
  let x = 0;
  let y = 0;
  for (const p of points) {
    x += p[0];
    y += p[1];
  }
  return [x / points.length, y / points.length];
}

/** Place an exocyclic atom radially outward from `at`, away from `from`. */
function outward(at: V2, from: V2, distance: number): V2 {
  const dx = at[0] - from[0];
  const dy = at[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  return [at[0] + (dx / len) * distance, at[1] + (dy / len) * distance];
}

/**
 * Pyrimidine skeleton: one six-ring, glycosidic at N1.
 * Ring order is N1, C2, N3, C4, C5, C6.
 */
function pyrimidineRing(): V2[] {
  const c2: V2 = [BOND * Math.cos(-Math.PI / 3), BOND * Math.sin(-Math.PI / 3)];
  return ring([0, 0], c2, 6, false);
}

/**
 * Purine skeleton: five-ring fused to a six-ring, glycosidic at N9.
 * Returns atoms ordered N9, C8, N7, C5, C4, C6, N1, C2, N3.
 */
function purineRings(): V2[] {
  const c8: V2 = [BOND * Math.cos(-Math.PI * 0.4), BOND * Math.sin(-Math.PI * 0.4)];
  const five = ring([0, 0], c8, 5, false); // N9, C8, N7, C5, C4
  const n7 = five[2]!;
  const c5 = five[3]!;
  const c4 = five[4]!;
  const fiveCentre = centroid(five);

  // Fuse the six-ring on the C4–C5 edge, on the far side from the five-ring.
  let six = ring(c4, c5, 6, false);
  if (dist(centroid(six), fiveCentre) < dist(centroid(ring(c4, c5, 6, true)), fiveCentre)) {
    six = ring(c4, c5, 6, true);
  }
  // six is C4, C5, C6, N1, C2, N3 — the first two are shared with the five-ring.
  return [five[0]!, five[1]!, n7, c5, c4, six[2]!, six[3]!, six[4]!, six[5]!];
}

function dist(a: V2, b: V2): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

/** Deoxyribose, as a five-ring hanging off the glycosidic nitrogen. */
function sugar(glycosidicDirection: number): { atoms: BaseAtom[]; bonds: Array<readonly [number, number]> } {
  // Sits on the opposite side of the glycosidic atom from the base.
  const c1: V2 = [Math.cos(glycosidicDirection) * 1.47, Math.sin(glycosidicDirection) * 1.47];
  const next: V2 = [
    c1[0] + Math.cos(glycosidicDirection - 1.2) * 1.53,
    c1[1] + Math.sin(glycosidicDirection - 1.2) * 1.53,
  ];
  const points = ring(c1, next, 5, false);
  const names = ["C1'", "C2'", "C3'", "C4'", "O4'"] as const;
  const elements: Element[] = ['C', 'C', 'C', 'C', 'O'];

  const atoms: BaseAtom[] = points.map((p, i) => ({
    x: p[0],
    y: p[1],
    element: elements[i]!,
    name: names[i]!,
  }));
  const bonds: Array<readonly [number, number]> = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]];
  return { atoms, bonds };
}

/**
 * Build one base in a local frame: glycosidic nitrogen at the origin, the ring
 * system extending toward +x, and the hydrogen-bonding face pointing that way.
 */
export function buildBase(base: Exclude<Base, 'U'>): BaseModel {
  const atoms: BaseAtom[] = [];
  const bonds: Array<readonly [number, number]> = [];
  const hbondAtoms: number[] = [];

  const push = (p: V2, element: Element, name: string): number => {
    atoms.push({ x: p[0], y: p[1], element, name });
    return atoms.length - 1;
  };

  const isPurine = base === 'A' || base === 'G';

  if (isPurine) {
    const r = purineRings();
    const names = ['N9', 'C8', 'N7', 'C5', 'C4', 'C6', 'N1', 'C2', 'N3'];
    const elements: Element[] = ['N', 'C', 'N', 'C', 'C', 'C', 'N', 'C', 'N'];
    const index: Record<string, number> = {};
    r.forEach((p, i) => {
      index[names[i]!] = push(p, elements[i]!, names[i]!);
    });

    // Five-ring: N9-C8-N7-C5-C4-N9. Six-ring: C4-C5-C6-N1-C2-N3-C4.
    for (const [a, b] of [
      ['N9', 'C8'], ['C8', 'N7'], ['N7', 'C5'], ['C5', 'C4'], ['C4', 'N9'],
      ['C5', 'C6'], ['C6', 'N1'], ['N1', 'C2'], ['C2', 'N3'], ['N3', 'C4'],
    ] as const) {
      bonds.push([index[a]!, index[b]!]);
    }

    const ringCentre = centroid(r);
    if (base === 'A') {
      // Adenine: N6 amino donates, N1 accepts. Two bonds to thymine.
      const n6 = push(outward(r[5]!, ringCentre, EXO), 'N', 'N6');
      bonds.push([index['C6']!, n6]);
      hbondAtoms.push(n6, index['N1']!);
    } else {
      // Guanine: O6 accepts, N1 donates, N2 amino donates. Three to cytosine.
      const o6 = push(outward(r[5]!, ringCentre, EXO), 'O', 'O6');
      const n2 = push(outward(r[7]!, ringCentre, EXO), 'N', 'N2');
      bonds.push([index['C6']!, o6], [index['C2']!, n2]);
      hbondAtoms.push(o6, index['N1']!, n2);
    }
  } else {
    const r = pyrimidineRing();
    const names = ['N1', 'C2', 'N3', 'C4', 'C5', 'C6'];
    const elements: Element[] = ['N', 'C', 'N', 'C', 'C', 'C'];
    const index: Record<string, number> = {};
    r.forEach((p, i) => {
      index[names[i]!] = push(p, elements[i]!, names[i]!);
    });

    for (let i = 0; i < 6; i++) bonds.push([i, (i + 1) % 6]);

    const ringCentre = centroid(r);
    if (base === 'T') {
      // Thymine: O4 accepts, N3 donates. Plus the C5 methyl that distinguishes
      // it from uracil — the single group RNA does without.
      const o4 = push(outward(r[3]!, ringCentre, EXO), 'O', 'O4');
      const o2 = push(outward(r[1]!, ringCentre, EXO), 'O', 'O2');
      const c7 = push(outward(r[4]!, ringCentre, 1.5), 'C', 'C7');
      bonds.push([index['C4']!, o4], [index['C2']!, o2], [index['C5']!, c7]);
      hbondAtoms.push(o4, index['N3']!);
    } else {
      // Cytosine: N4 amino donates, N3 accepts, O2 accepts.
      const n4 = push(outward(r[3]!, ringCentre, EXO), 'N', 'N4');
      const o2 = push(outward(r[1]!, ringCentre, EXO), 'O', 'O2');
      bonds.push([index['C4']!, n4], [index['C2']!, o2]);
      hbondAtoms.push(n4, index['N3']!, o2);
    }
  }

  // The sugar hangs off the glycosidic atom, pointing away from the base.
  const { atoms: sugarAtoms, bonds: sugarBonds } = sugar(Math.PI);
  const sugarBase = atoms.length;
  atoms.push(...sugarAtoms);
  for (const [a, b] of sugarBonds) bonds.push([sugarBase + a, sugarBase + b]);
  bonds.push([0, sugarBase]); // glycosidic bond: N9/N1 to C1'

  return { atoms, bonds, hbondAtoms, glycosidic: 0 };
}

export interface PlacedPair {
  /** Both bases, already rotated and translated into the pair frame. */
  atoms: Array<BaseAtom & { strand: 0 | 1 }>;
  bonds: Array<readonly [number, number]>;
  /** Hydrogen bonds, as index pairs into `atoms`. */
  hbonds: Array<readonly [number, number]>;
  senseBase: Base;
  antiBase: Base;
}

/**
 * Lay a complementary pair out in its own plane.
 *
 * Base A sits with its glycosidic nitrogen at x = 0, base B is rotated 180° and
 * placed at x = C1_SPAN. Each is then slid along x until its hydrogen-bonding
 * atoms sit HBOND_LENGTH apart from its partner's — which is what makes the
 * two-bond and three-bond pairs come out the same width, exactly as a real
 * duplex requires.
 */
export function buildPair(sense: Exclude<Base, 'U'>, anti: Exclude<Base, 'U'>): PlacedPair {
  const a = buildBase(sense);
  const b = buildBase(anti);

  const meanX = (model: BaseModel): number =>
    model.hbondAtoms.reduce((sum, i) => sum + model.atoms[i]!.x, 0) / model.hbondAtoms.length;

  // Where the two hydrogen-bonding faces should meet.
  const midpoint = C1_SPAN / 2;
  const offsetA = midpoint - HBOND_LENGTH / 2 - meanX(a);
  const offsetB = midpoint + HBOND_LENGTH / 2 + meanX(b);

  const atoms: Array<BaseAtom & { strand: 0 | 1 }> = [];
  const bonds: Array<readonly [number, number]> = [];

  for (const atom of a.atoms) {
    atoms.push({ ...atom, x: atom.x + offsetA, strand: 0 });
  }
  for (const [i, j] of a.bonds) bonds.push([i, j]);

  const shift = atoms.length;
  for (const atom of b.atoms) {
    // Mirror through the pair axis, then translate into place.
    atoms.push({ ...atom, x: offsetB - atom.x, y: -atom.y, strand: 1 });
  }
  for (const [i, j] of b.bonds) bonds.push([shift + i, shift + j]);

  // Pair the hydrogen-bonding atoms in order: both lists run from the major
  // groove edge inward, so index i on one base faces index i on the other.
  const hbonds: Array<readonly [number, number]> = [];
  const bondCount = Math.min(a.hbondAtoms.length, b.hbondAtoms.length);
  for (let i = 0; i < bondCount; i++) {
    hbonds.push([a.hbondAtoms[i]!, shift + b.hbondAtoms[i]!]);
  }

  return { atoms, bonds, hbonds, senseBase: sense, antiBase: anti };
}
