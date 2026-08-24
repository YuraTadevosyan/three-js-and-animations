import {
  ChangeDetectionStrategy, Component, ElementRef, computed, effect, input, output, signal,
  viewChild,
} from '@angular/core';

import type { SequenceAnalysis } from '../bio/analysis';
import { AMINO_ACIDS, type Base } from '../bio/sequence';

const BASE_VAR: Record<string, string> = {
  A: 'var(--base-a)',
  T: 'var(--base-t)',
  G: 'var(--base-g)',
  C: 'var(--base-c)',
  U: 'var(--base-u)',
};

const RESIDUE_VAR: Record<string, string> = {
  hydrophobic: 'var(--res-hydrophobic)',
  polar: 'var(--res-polar)',
  positive: 'var(--res-positive)',
  negative: 'var(--res-negative)',
  special: 'var(--res-special)',
};

/** How many bases the colour strip previews. */
const STRIP_LENGTH = 90;

export type SequencePreset = 'default' | 'random' | 'clear';

/**
 * The sequence editor.
 *
 * Typing here rebuilds the helix, base-pair, transcription and translation
 * scales from the new bases — which is the point: it makes "the geometry is
 * the data" something you can check rather than something the README claims.
 */
@Component({
  selector: 'dna-sequence-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'pointer-events-none fixed inset-y-0 right-0 z-30 flex w-full max-w-[26rem] flex-col p-4 lg:p-5',
    '[class.hidden]': '!open()',
  },
  template: `
    <div
      class="panel pointer-events-auto flex min-h-0 flex-col overflow-hidden"
      role="dialog"
      aria-label="Sequence editor"
    >
      <header class="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <div>
          <p class="mono-label">Sequence</p>
          <p class="mt-0.5 text-[11px] text-muted-foreground/70">
            Drives four of the nine scales
          </p>
        </div>
        <button
          type="button"
          class="rounded px-2 py-1 text-muted-foreground transition-colors hover:text-primary"
          aria-label="Close sequence editor"
          (click)="closed.emit()"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4">
        <!-- Input -->
        <div>
          <textarea
            class="h-24 w-full resize-none rounded-md border border-border/45 bg-background/60 p-2.5 font-mono text-[11px] leading-relaxed tracking-[0.06em] text-foreground outline-none transition-colors focus:border-primary/60"
            spellcheck="false"
            autocomplete="off"
            placeholder="Paste DNA or RNA — FASTA headers and whitespace are ignored"
            aria-label="DNA sequence"
            #input
            (input)="onInput($event)"
          ></textarea>

          <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tabular-nums text-muted-foreground">
            <span>{{ analysis().length }} nt</span>
            <span class="text-muted-foreground/40">·</span>
            <span>{{ gcPercent() }}% GC</span>
            @if (analysis().meltingTemp !== null) {
              <span class="text-muted-foreground/40">·</span>
              <span>Tm ≈ {{ analysis().meltingTemp!.toFixed(0) }}°C</span>
            }
          </div>

          @if (notice(); as text) {
            <p class="mt-2 text-[11px] leading-relaxed text-primary/80">{{ text }}</p>
          }
        </div>

        <!-- Presets -->
        <div class="flex gap-2">
          @for (option of presets; track option.id) {
            <button
              type="button"
              class="flex-1 rounded-md border border-border/45 px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              (click)="preset.emit(option.id)"
            >
              {{ option.label }}
            </button>
          }
        </div>

        <!-- Colour strip -->
        @if (strip().length) {
          <section>
            <p class="mono-label mb-1.5">First {{ strip().length }} bases</p>
            <p class="break-all font-mono text-[11px] leading-[1.5] tracking-[0.09em]">
              @for (base of strip(); track $index) {
                <span [style.color]="baseColor(base)">{{ base }}</span>
              }
            </p>
          </section>
        }

        <!-- Reading frames -->
        <section>
          <div class="mb-1.5 flex items-baseline justify-between">
            <p class="mono-label">Open reading frames</p>
            <span class="font-mono text-[10px] tabular-nums text-muted-foreground/60">
              {{ analysis().orfs.length }}
            </span>
          </div>

          @if (analysis().orfs.length === 0) {
            <p class="text-[11px] leading-relaxed text-muted-foreground">
              No ORF of ten codons or more. The scales read frame 1 from the start
              instead.
            </p>
          } @else {
            <ul class="flex flex-col gap-1">
              @for (orf of visibleOrfs(); track orf.start; let i = $index) {
                <li
                  class="flex items-center justify-between rounded border px-2 py-1 font-mono text-[10px] tabular-nums transition-colors"
                  [class]="i === 0 ? 'border-primary/60 text-primary' : 'border-border/40 text-muted-foreground'"
                >
                  <span>frame {{ orf.frame + 1 }} · {{ orf.start + 1 }}–{{ orf.end }}</span>
                  <span>
                    {{ orf.peptide.length }} aa
                    @if (!orf.terminated) {
                      <span class="text-muted-foreground/50">·no stop</span>
                    }
                  </span>
                </li>
              }
            </ul>
            @if (analysis().orfs.length > visibleOrfs().length) {
              <p class="mt-1 font-mono text-[10px] text-muted-foreground/50">
                +{{ analysis().orfs.length - visibleOrfs().length }} shorter
              </p>
            }
          }
        </section>

        <!-- Peptide -->
        @if (peptide().length) {
          <section>
            <p class="mono-label mb-1.5">
              Peptide · {{ peptide().length }} aa
              @if (!analysis().coding.fromOrf) {
                <span class="text-muted-foreground/50">(frame 1)</span>
              }
            </p>
            <p class="break-all font-mono text-[11px] leading-[1.5] tracking-[0.09em]">
              @for (residue of peptide(); track $index) {
                <span [style.color]="residueColor(residue)" [title]="residueName(residue)">{{
                  residue
                }}</span>
              }
            </p>
          </section>
        }

        <!-- Reverse complement -->
        @if (analysis().reverseComplement.length) {
          <section>
            <div class="mb-1.5 flex items-baseline justify-between">
              <p class="mono-label">Reverse complement 5'→3'</p>
              <button
                type="button"
                class="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary"
                (click)="copyReverseComplement()"
              >
                {{ copied() ? 'copied' : 'copy' }}
              </button>
            </div>
            <p class="max-h-20 overflow-y-auto overscroll-contain break-all font-mono text-[11px] leading-[1.5] tracking-[0.09em] text-muted-foreground">
              {{ analysis().reverseComplement }}
            </p>
          </section>
        }

        <p class="border-t border-border/30 pt-3 text-[10px] leading-relaxed text-muted-foreground/60">
          Tm is the textbook approximation (Wallace below 14 nt, GC formula above)
          and ignores salt and strand concentration. Secondary structure for a
          custom peptide is a Chou–Fasman prediction, not a solved structure.
        </p>
      </div>
    </div>
  `,
})
export class SequencePanel {
  readonly open = input.required<boolean>();
  readonly raw = input.required<string>();
  readonly analysis = input.required<SequenceAnalysis>();

  private readonly textarea = viewChild<ElementRef<HTMLTextAreaElement>>('input');

  /**
   * Mirror the store into the textarea only when the two have actually
   * diverged — a preset button, say. Binding [value] instead would rewrite the
   * element 220ms after every keystroke, which puts the caret back at the end
   * mid-word.
   */
  protected readonly syncTextarea = effect(() => {
    const value = this.raw();
    const element = this.textarea()?.nativeElement;
    if (element && element.value !== value) element.value = value;
  });

  readonly changed = output<string>();
  readonly closed = output<void>();
  readonly preset = output<SequencePreset>();

  readonly presets: ReadonlyArray<{ id: SequencePreset; label: string }> = [
    { id: 'default', label: 'p53' },
    { id: 'random', label: 'Random' },
    { id: 'clear', label: 'Clear' },
  ];

  readonly gcPercent = computed(() => (this.analysis().gcFraction * 100).toFixed(0));
  readonly peptide = computed(() => this.analysis().coding.peptide.split(''));
  readonly strip = computed(() => this.analysis().dna.slice(0, STRIP_LENGTH).split('') as Base[]);
  readonly visibleOrfs = computed(() => this.analysis().orfs.slice(0, 4));

  /** Whatever the input most needs the user to know, at most one line. */
  readonly notice = computed<string | null>(() => {
    const { rejected, truncated, length } = this.analysis();
    if (length === 0) return 'Empty — the scales are showing the default p53 sequence.';
    if (truncated) return 'Longer than 600 bases; the rest was trimmed.';
    if (rejected > 0) return `${rejected} non-nucleotide character${rejected === 1 ? '' : 's'} ignored.`;
    return null;
  });

  readonly copied = signal(false);

  private copiedTimer: ReturnType<typeof setTimeout> | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  onInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    // Debounce: every keystroke otherwise rebuilds four stages' vertex buffers.
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.changed.emit(value), 220);
  }

  async copyReverseComplement(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.analysis().reverseComplement);
      this.copied.set(true);
      if (this.copiedTimer) clearTimeout(this.copiedTimer);
      this.copiedTimer = setTimeout(() => this.copied.set(false), 1400);
    } catch {
      // Clipboard access can be denied over http or without permission; the
      // text stays selectable either way, so this is not worth surfacing.
    }
  }

  baseColor(base: Base): string {
    return `hsl(${BASE_VAR[base] ?? 'var(--foreground)'})`;
  }

  residueColor(residue: string): string {
    const cls = AMINO_ACIDS[residue]?.cls ?? 'special';
    return `hsl(${RESIDUE_VAR[cls]})`;
  }

  residueName(residue: string): string {
    const info = AMINO_ACIDS[residue];
    return info ? `${info.name} (${info.abbr}) · ${info.cls}` : residue;
  }
}
