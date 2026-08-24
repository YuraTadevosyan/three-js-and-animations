import { GENETIC_CODE, complement, type Base } from './sequence';

/**
 * Sequence analysis for user-supplied DNA.
 *
 * Everything here is standard molecular biology: the genetic code drives
 * translation and ORF detection, and the melting temperature uses the two
 * textbook approximations (Wallace for short oligos, the GC formula above 13
 * bases). Both are approximations and the UI says so — a real Tm needs
 * nearest-neighbour thermodynamics plus salt and strand concentrations.
 */

/** Upper bound on what we will render. Keeps every GPU buffer bounded. */
export const MAX_BASES = 600;
/** Longest peptide the translation stage will build. */
export const MAX_RESIDUES = Math.floor(MAX_BASES / 3);
/** Shortest ORF worth reporting, in codons. */
const MIN_ORF_CODONS = 10;

export interface Orf {
  /** 0-based index of the A in the start codon, on the sense strand. */
  start: number;
  /** Exclusive end, including the stop codon if one was reached. */
  end: number;
  /** Reading frame, 0-2. */
  frame: number;
  peptide: string;
  /** Whether the reading actually hit a stop codon rather than running out. */
  terminated: boolean;
}

export interface Codon {
  codon: string;
  residue: string;
}

export interface SequenceAnalysis {
  /** Sanitised sense strand: uppercase, A/C/G/T only. */
  dna: string;
  length: number;
  /** Fraction of G or C, 0..1. */
  gcFraction: number;
  /** Approximate melting temperature in Celsius, or null for empty input. */
  meltingTemp: number | null;
  reverseComplement: string;
  orfs: Orf[];
  /** The stretch the translation stage renders. */
  coding: {
    dna: string;
    peptide: string;
    codons: Codon[];
    start: number;
    frame: number;
    /** Whether this came from a detected ORF or is just frame 1. */
    fromOrf: boolean;
  };
  /** Characters dropped because they were not nucleotides. */
  rejected: number;
  /** Whether the input was longer than MAX_BASES and got cut. */
  truncated: boolean;
}

export interface Sanitised {
  dna: string;
  rejected: number;
  truncated: boolean;
}

/**
 * Reduce arbitrary pasted text to a sense strand.
 *
 * Accepts FASTA (header lines are dropped), whitespace, and RNA — uracil is
 * folded to thymine so an mRNA sequence pasted in still renders as the DNA
 * that encodes it.
 */
export function sanitise(input: string): Sanitised {
  const withoutHeaders = input
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('>'))
    .join('');

  let dna = '';
  let rejected = 0;
  for (const character of withoutHeaders.toUpperCase()) {
    if (character === 'U') {
      dna += 'T';
    } else if (character === 'A' || character === 'C' || character === 'G' || character === 'T') {
      dna += character;
    } else if (!/\s/.test(character)) {
      rejected++;
    }
  }

  const truncated = dna.length > MAX_BASES;
  return { dna: truncated ? dna.slice(0, MAX_BASES) : dna, rejected, truncated };
}

export function gcFraction(dna: string): number {
  if (dna.length === 0) return 0;
  let gc = 0;
  for (const base of dna) if (base === 'G' || base === 'C') gc++;
  return gc / dna.length;
}

/**
 * Approximate melting temperature, Celsius.
 *
 * Below 14 bases the Wallace rule (2 per A/T, 4 per G/C) is the usual quick
 * estimate; above it the GC-content formula is standard. Neither accounts for
 * salt or strand concentration.
 */
export function meltingTemp(dna: string): number | null {
  if (dna.length === 0) return null;
  let gc = 0;
  for (const base of dna) if (base === 'G' || base === 'C') gc++;

  if (dna.length < 14) {
    const at = dna.length - gc;
    return at * 2 + gc * 4;
  }
  return 64.9 + (41 * (gc - 16.4)) / dna.length;
}

/** The antiparallel partner, written 5' to 3' as convention requires. */
export function reverseComplementOf(dna: string): string {
  let out = '';
  for (let i = dna.length - 1; i >= 0; i--) {
    out += complement(dna[i] as Base);
  }
  return out;
}

/** Split a coding stretch into codons paired with the residue each encodes. */
export function toCodons(dna: string): Codon[] {
  const codons: Codon[] = [];
  for (let i = 0; i + 3 <= dna.length; i += 3) {
    const codon = dna.slice(i, i + 3);
    const residue = GENETIC_CODE[codon];
    if (!residue || residue === '*') break;
    codons.push({ codon, residue });
  }
  return codons;
}

/**
 * Find open reading frames on the sense strand.
 *
 * Scans all three forward frames for ATG, reads to the first in-frame stop,
 * and continues past it. Sense strand only: the reverse complement is shown in
 * the panel, but rendering an ORF that runs the other way would contradict the
 * direction the helix is drawn.
 */
export function findOrfs(dna: string, minCodons = MIN_ORF_CODONS): Orf[] {
  const orfs: Orf[] = [];

  for (let frame = 0; frame < 3; frame++) {
    let i = frame;
    while (i + 3 <= dna.length) {
      if (dna.slice(i, i + 3) !== 'ATG') {
        i += 3;
        continue;
      }

      let peptide = '';
      let j = i;
      let terminated = false;
      while (j + 3 <= dna.length) {
        const residue = GENETIC_CODE[dna.slice(j, j + 3)];
        j += 3;
        if (!residue) break;
        if (residue === '*') {
          terminated = true;
          break;
        }
        peptide += residue;
      }

      if (peptide.length >= minCodons) {
        orfs.push({ start: i, end: j, frame, peptide, terminated });
      }
      // Resume after this reading rather than inside it, so a long ORF does
      // not produce a cascade of nested shorter ones at every internal ATG.
      i = j;
    }
  }

  return orfs.sort((a, b) => b.peptide.length - a.peptide.length);
}

export function analyse(input: string): SequenceAnalysis {
  const { dna, rejected, truncated } = sanitise(input);
  const orfs = findOrfs(dna);
  const best = orfs[0];

  // Prefer the longest ORF; fall back to reading frame 1 from the start, which
  // is what a coding sequence pasted without its ATG will be.
  const coding = best
    ? {
        dna: dna.slice(best.start, best.end),
        peptide: best.peptide,
        codons: toCodons(dna.slice(best.start, best.end)),
        start: best.start,
        frame: best.frame,
        fromOrf: true,
      }
    : {
        dna,
        peptide: toCodons(dna).map((c) => c.residue).join(''),
        codons: toCodons(dna),
        start: 0,
        frame: 0,
        fromOrf: false,
      };

  return {
    dna,
    length: dna.length,
    gcFraction: gcFraction(dna),
    meltingTemp: meltingTemp(dna),
    reverseComplement: reverseComplementOf(dna),
    orfs,
    coding,
    rejected,
    truncated,
  };
}
