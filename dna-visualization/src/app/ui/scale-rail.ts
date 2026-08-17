import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface RailItem {
  id: string;
  label: string;
  scale: string;
}

/**
 * The depth gauge down the left edge.
 *
 * Doubles as navigation: each scale is a button that scrolls the journey to
 * that stage, so the piece is explorable without dragging through everything.
 */
@Component({
  selector: 'dna-scale-rail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'pointer-events-none fixed left-0 top-1/2 z-20 hidden -translate-y-1/2 pl-5 md:block lg:pl-8',
  },
  template: `
    <nav class="pointer-events-auto flex flex-col gap-px" aria-label="Biological scales">
      @for (item of items(); track item.id; let i = $index) {
        <button
          type="button"
          class="group flex items-center gap-3 py-1.5 text-left transition-opacity duration-300"
          [class.opacity-100]="i === active()"
          [class.opacity-45]="i !== active()"
          [attr.aria-current]="i === active() ? 'true' : null"
          (click)="select.emit(i)"
        >
          <span
            class="h-px transition-all duration-500 ease-out"
            [class.w-8]="i === active()"
            [class.w-4]="i !== active()"
            [class.bg-primary]="i === active()"
            [class.bg-border]="i !== active()"
          ></span>
          <span class="flex flex-col leading-tight">
            <span
              class="font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-300"
              [class.text-primary]="i === active()"
              [class.text-muted-foreground]="i !== active()"
              >{{ item.label }}</span
            >
            <span
              class="font-mono text-[9px] tabular-nums text-muted-foreground/60 transition-opacity duration-300"
              [class.opacity-100]="i === active()"
              [class.opacity-0]="i !== active()"
              >{{ item.scale }}</span
            >
          </span>
        </button>
      }
    </nav>
  `,
})
export class ScaleRail {
  readonly items = input.required<readonly RailItem[]>();
  readonly active = input.required<number>();
  readonly select = output<number>();
}
