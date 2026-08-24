import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { BASE_COLOR, type Base } from '../bio/sequence';

const BASE_VAR: Record<string, string> = {
  A: 'var(--base-a)',
  T: 'var(--base-t)',
  G: 'var(--base-g)',
  C: 'var(--base-c)',
  U: 'var(--base-u)',
};

/**
 * Instrument readout, bottom-right.
 *
 * Shows the same sequence window the helix is currently rendering, so the DOM
 * and the GPU are visibly reading one source of truth.
 */
@Component({
  selector: 'dna-hud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'scrim-bottom pointer-events-none fixed bottom-0 right-0 z-20 hidden p-5 pt-16 text-right md:block lg:pb-8',
  },
  template: `
    @if (showSequence()) {
      <div class="mb-3 panel px-3 py-2 text-left animate-fade-in">
        <div class="mono-label mb-1.5">{{ sequenceLabel() }}</div>
        <div class="font-mono text-[11px] leading-none tracking-[0.08em]">
          @for (base of window(); track $index) {
            <span [style.color]="colorFor(base)">{{ base }}</span>
          }
        </div>
      </div>
    }

    <div class="flex items-center justify-end gap-4 font-mono text-[10px] tabular-nums text-muted-foreground/70">
      <span>{{ depthLabel() }}</span>
      <span class="text-muted-foreground/40">·</span>
      <span [class.text-primary]="fps() >= 50">{{ fps().toFixed(0) }} fps</span>
      <span class="text-muted-foreground/40">{{ renderScale().toFixed(2) }}&times;</span>
      @if (quality() < 0.98) {
        <span class="text-muted-foreground/40">q{{ (quality() * 100).toFixed(0) }}</span>
      }
    </div>
  `,
})
export class Hud {
  readonly fps = input.required<number>();
  readonly quality = input.required<number>();
  readonly progress = input.required<number>();
  readonly renderScale = input(1);
  readonly showSequence = input(false);
  readonly sequenceLabel = input('TP53 · coding sequence');
  /** First base of the 30-base window to print. */
  readonly sequenceStart = input(0);
  /** The sequence being rendered, so the readout follows the editor. */
  readonly sequence = input('');

  readonly depthLabel = computed(() => `${(this.progress() * 100).toFixed(0)}% depth`);

  readonly window = computed<Base[]>(() => {
    const dna = this.sequence();
    if (dna.length === 0) return [];
    const width = Math.min(30, dna.length);
    const start = Math.max(0, Math.min(this.sequenceStart(), dna.length - width));
    return dna.slice(start, start + width).split('') as Base[];
  });

  colorFor(base: Base): string {
    const variable = BASE_VAR[base];
    if (variable) return `hsl(${variable})`;
    const rgb = BASE_COLOR[base];
    return `rgb(${rgb.map((c) => Math.round(c * 255)).join(',')})`;
  }
}
