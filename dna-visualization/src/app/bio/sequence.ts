/**
 * Molecular biology reference data.
 *
 * Everything in this file is real: the standard genetic code, Kyte–Doolittle
 * hydropathy, amino-acid side-chain classes, B-DNA helical parameters and the
 * N-terminal 60 residues of human p53.
 *
 * One honest caveat, surfaced in the UI and the README: the nucleotide string
 * is NOT the genomic TP53 sequence. It is a reverse translation of the real
 * p53 peptide using the most-frequent human codon for each residue. The codons
 * on screen therefore really do encode the real p53 residues under the real
 * genetic code — they just aren't the exact bases on chromosome 17.
 */

export type Base = 'A' | 'T' | 'G' | 'C' | 'U';
export type ResidueClass = 'hydrophobic' | 'polar' | 'positive' | 'negative' | 'special';

/** The standard genetic code, DNA sense-strand codons. `*` is a stop codon. */
export const GENETIC_CODE: Readonly<Record<string, string>> = {
  TTT: 'F', TTC: 'F', TTA: 'L', TTG: 'L',
  CTT: 'L', CTC: 'L', CTA: 'L', CTG: 'L',
  ATT: 'I', ATC: 'I', ATA: 'I', ATG: 'M',
  GTT: 'V', GTC: 'V', GTA: 'V', GTG: 'V',
  TCT: 'S', TCC: 'S', TCA: 'S', TCG: 'S',
  CCT: 'P', CCC: 'P', CCA: 'P', CCG: 'P',
  ACT: 'T', ACC: 'T', ACA: 'T', ACG: 'T',
  GCT: 'A', GCC: 'A', GCA: 'A', GCG: 'A',
  TAT: 'Y', TAC: 'Y', TAA: '*', TAG: '*',
  CAT: 'H', CAC: 'H', CAA: 'Q', CAG: 'Q',
  AAT: 'N', AAC: 'N', AAA: 'K', AAG: 'K',
  GAT: 'D', GAC: 'D', GAA: 'E', GAG: 'E',
  TGT: 'C', TGC: 'C', TGA: '*', TGG: 'W',
  CGT: 'R', CGC: 'R', CGA: 'R', CGG: 'R',
  AGT: 'S', AGC: 'S', AGA: 'R', AGG: 'R',
  GGT: 'G', GGC: 'G', GGA: 'G', GGG: 'G',
};

/** Most-frequent codon per residue in the human genome. */
export const PREFERRED_CODON: Readonly<Record<string, string>> = {
  F: 'TTC', L: 'CTG', I: 'ATC', M: 'ATG', V: 'GTG',
  S: 'AGC', P: 'CCC', T: 'ACC', A: 'GCC', Y: 'TAC',
  H: 'CAC', Q: 'CAG', N: 'AAC', K: 'AAG', D: 'GAC',
  E: 'GAG', C: 'TGC', W: 'TGG', R: 'CGG', G: 'GGC',
  '*': 'TGA',
};

export interface AminoAcid {
  code: string;
  abbr: string;
  name: string;
  cls: ResidueClass;
  /** Kyte–Doolittle hydropathy index. Positive = hydrophobic. */
  hydropathy: number;
}

export const AMINO_ACIDS: Readonly<Record<string, AminoAcid>> = {
  A: { code: 'A', abbr: 'Ala', name: 'Alanine', cls: 'hydrophobic', hydropathy: 1.8 },
  R: { code: 'R', abbr: 'Arg', name: 'Arginine', cls: 'positive', hydropathy: -4.5 },
  N: { code: 'N', abbr: 'Asn', name: 'Asparagine', cls: 'polar', hydropathy: -3.5 },
  D: { code: 'D', abbr: 'Asp', name: 'Aspartate', cls: 'negative', hydropathy: -3.5 },
  C: { code: 'C', abbr: 'Cys', name: 'Cysteine', cls: 'polar', hydropathy: 2.5 },
  Q: { code: 'Q', abbr: 'Gln', name: 'Glutamine', cls: 'polar', hydropathy: -3.5 },
  E: { code: 'E', abbr: 'Glu', name: 'Glutamate', cls: 'negative', hydropathy: -3.5 },
  G: { code: 'G', abbr: 'Gly', name: 'Glycine', cls: 'special', hydropathy: -0.4 },
  H: { code: 'H', abbr: 'His', name: 'Histidine', cls: 'positive', hydropathy: -3.2 },
  I: { code: 'I', abbr: 'Ile', name: 'Isoleucine', cls: 'hydrophobic', hydropathy: 4.5 },
  L: { code: 'L', abbr: 'Leu', name: 'Leucine', cls: 'hydrophobic', hydropathy: 3.8 },
  K: { code: 'K', abbr: 'Lys', name: 'Lysine', cls: 'positive', hydropathy: -3.9 },
  M: { code: 'M', abbr: 'Met', name: 'Methionine', cls: 'hydrophobic', hydropathy: 1.9 },
  F: { code: 'F', abbr: 'Phe', name: 'Phenylalanine', cls: 'hydrophobic', hydropathy: 2.8 },
  P: { code: 'P', abbr: 'Pro', name: 'Proline', cls: 'special', hydropathy: -1.6 },
  S: { code: 'S', abbr: 'Ser', name: 'Serine', cls: 'polar', hydropathy: -0.8 },
  T: { code: 'T', abbr: 'Thr', name: 'Threonine', cls: 'polar', hydropathy: -0.7 },
  W: { code: 'W', abbr: 'Trp', name: 'Tryptophan', cls: 'hydrophobic', hydropathy: -0.9 },
  Y: { code: 'Y', abbr: 'Tyr', name: 'Tyrosine', cls: 'polar', hydropathy: -1.3 },
  V: { code: 'V', abbr: 'Val', name: 'Valine', cls: 'hydrophobic', hydropathy: 4.2 },
};

/**
 * Human p53 (TP53 gene product), residues 1–60 — the transactivation domain.
 * The MDM2-binding helix sits at F19-W23-L26, which is why this stretch is one
 * of the most-cited peptides in cancer biology.
 */
export const P53_PEPTIDE =
  'MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGP';

/** Base-pairing partner on the antiparallel strand. */
export function complement(base: Base): Base {
  switch (base) {
    case 'A': return 'T';
    case 'T': return 'A';
    case 'U': return 'A';
    case 'G': return 'C';
    case 'C': return 'G';
  }
}

/** Number of hydrogen bonds holding a pair together: A–T is 2, G–C is 3. */
export function bondCount(base: Base): 2 | 3 {
  return base === 'G' || base === 'C' ? 3 : 2;
}

/** Build a coding sequence for a peptide using human-preferred codons. */
export function reverseTranslate(peptide: string): string {
  let out = '';
  for (const residue of peptide) out += PREFERRED_CODON[residue] ?? 'NNN';
  return out;
}

/** Read a DNA sense strand into residues, stopping at the first stop codon. */
export function translate(dna: string): string {
  let out = '';
  for (let i = 0; i + 3 <= dna.length; i += 3) {
    const residue = GENETIC_CODE[dna.slice(i, i + 3)];
    if (!residue || residue === '*') break;
    out += residue;
  }
  return out;
}

/** DNA sense strand → mRNA. Transcription swaps thymine for uracil. */
export function transcribe(dna: string): string {
  return dna.replace(/T/g, 'U');
}

/** The coding sequence driving every scale of the journey. 180 bases. */
export const P53_CDS = reverseTranslate(P53_PEPTIDE);

/** Codons of {@link P53_CDS}, paired with the residue each one encodes. */
export const P53_CODONS: ReadonlyArray<{ codon: string; residue: string }> =
  Array.from({ length: P53_PEPTIDE.length }, (_, i) => ({
    codon: P53_CDS.slice(i * 3, i * 3 + 3),
    residue: P53_PEPTIDE[i]!,
  }));

// ---------------------------------------------------------------------------
// Palettes
// ---------------------------------------------------------------------------

/** Linear-space RGB per nucleotide. Chosen to separate by hue *and* luminance. */
export const BASE_COLOR: Readonly<Record<Base, readonly [number, number, number]>> = {
  A: [1.0, 0.66, 0.24],
  T: [1.0, 0.34, 0.47],
  G: [0.28, 1.0, 0.62],
  C: [0.32, 0.68, 1.0],
  U: [0.86, 0.45, 1.0],
};

export const RESIDUE_COLOR: Readonly<Record<ResidueClass, readonly [number, number, number]>> = {
  hydrophobic: [1.0, 0.74, 0.36],
  polar: [0.52, 0.92, 0.98],
  positive: [0.44, 0.62, 1.0],
  negative: [1.0, 0.42, 0.52],
  special: [0.74, 0.78, 0.86],
};

/** CPK-ish element colors for the atomic close-up. */
export const ELEMENT_COLOR: Readonly<Record<string, readonly [number, number, number]>> = {
  C: [0.62, 0.66, 0.72],
  N: [0.36, 0.55, 1.0],
  O: [1.0, 0.36, 0.38],
  P: [1.0, 0.62, 0.22],
  H: [0.9, 0.94, 1.0],
};

// ---------------------------------------------------------------------------
// B-DNA helical geometry (Watson–Crick, right-handed)
// ---------------------------------------------------------------------------

export const BDNA = {
  /** Ångström rise along the axis per base pair. */
  rise: 3.4,
  /** Base pairs per full 360° turn. */
  bpPerTurn: 10.5,
  /** Helix radius to the phosphate backbone, Å. */
  backboneRadius: 10.0,
  /**
   * Angular offset between the two backbones, radians.
   *
   * The strands are NOT diametrically opposed. Offsetting them by ~225°/135°
   * instead of 180°/180° is exactly what carves the wide major groove (~22 Å)
   * and the narrow minor groove (~12 Å) — the asymmetry that lets a protein
   * read the sequence without opening the helix.
   */
  strandOffset: 3.93,
} as const;

/** Radians of twist per base pair. */
export const TWIST_PER_BP = (Math.PI * 2) / BDNA.bpPerTurn;
