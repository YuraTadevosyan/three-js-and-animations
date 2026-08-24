import { analyse, type SequenceAnalysis } from './analysis';
import { P53_CDS } from './sequence';

/**
 * The one sequence everything reads from.
 *
 * Stages poll `version` in their update and rebuild their GPU buffers when it
 * moves. A version counter rather than signals or events keeps `bio/`, `gl/`
 * and `stages/` free of any framework dependency — the render loop runs
 * outside Angular, and it should not need to know Angular exists.
 */
export class SequenceStore {
  private _raw: string;
  private _analysis: SequenceAnalysis;
  private _version = 0;

  constructor(initial: string = P53_CDS) {
    this._raw = initial;
    this._analysis = analyse(initial);
  }

  /** Exactly what the user typed, so the textarea round-trips faithfully. */
  get raw(): string {
    return this._raw;
  }

  get analysis(): SequenceAnalysis {
    return this._analysis;
  }

  /** Bumped whenever the rendered sequence changes. */
  get version(): number {
    return this._version;
  }

  /** True while the default p53 coding sequence is loaded, unedited. */
  get isDefault(): boolean {
    return this._analysis.dna === P53_CDS;
  }

  /**
   * The sequence the 3D stages should draw. Never empty: clearing the box
   * falls back to the default rather than leaving the scene with no geometry.
   */
  get renderDna(): string {
    return this._analysis.dna.length > 0 ? this._analysis.dna : P53_CDS;
  }

  /** True when the scene is showing the fallback rather than the input. */
  get isFallback(): boolean {
    return this._analysis.dna.length === 0;
  }

  set(input: string): void {
    this._raw = input;
    const next = analyse(input);
    // Only disturb the stages when the rendered bases actually differ —
    // reformatting whitespace or pasting a FASTA header should not rebuild
    // four stages' worth of vertex buffers.
    const changed = next.dna !== this._analysis.dna;
    this._analysis = next;
    if (changed) this._version++;
  }

  reset(): void {
    this.set(P53_CDS);
  }

  /** A random sequence with a start codon, so it has something to translate. */
  randomise(bases = 180): void {
    const alphabet = 'ACGT';
    let dna = 'ATG';
    while (dna.length < bases) {
      dna += alphabet[Math.floor(Math.random() * 4)];
    }
    this.set(dna);
  }
}
