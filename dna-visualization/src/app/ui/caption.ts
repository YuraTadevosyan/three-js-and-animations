import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The running commentary, bottom-left.
 *
 * Keyed on the stage id so Angular tears the block down and replays the entry
 * animation on every scale change — the text reads as arriving with the scene
 * rather than swapping in place.
 */
@Component({
  selector: 'dna-caption',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'pointer-events-none fixed bottom-0 left-0 z-20 w-full max-w-[34rem] p-5 md:pl-28 lg:pl-36 lg:pb-8',
  },
  template: `
    @for (key of [stageId()]; track key) {
      <div class="animate-fade-up">
        <div class="flex items-baseline gap-3">
          <span class="font-mono text-[10px] tabular-nums text-primary/80">
            {{ indexLabel() }}
          </span>
          <h2 class="text-lg font-medium tracking-tight text-foreground md:text-xl">
            {{ title() }}
          </h2>
          <span class="font-mono text-[10px] tabular-nums text-muted-foreground">
            {{ scale() }}
          </span>
        </div>

        <p class="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {{ caption() }}
        </p>

        @if (detail()) {
          <p class="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
            {{ detail() }}
          </p>
        }
      </div>
    }
  `,
})
export class CaptionPanel {
  readonly stageId = input.required<string>();
  readonly indexLabel = input.required<string>();
  readonly title = input.required<string>();
  readonly scale = input.required<string>();
  readonly caption = input.required<string>();
  readonly detail = input<string | undefined>(undefined);
}
