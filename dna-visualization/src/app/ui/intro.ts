import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Title card. Fades out on the first scroll and never returns.
 */
@Component({
  selector: 'dna-intro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pointer-events-none fixed inset-0 z-30 flex items-center justify-center',
    '[class.opacity-0]': 'dismissed()',
    '[style.transition]': "'opacity 900ms cubic-bezier(0.22, 1, 0.36, 1)'",
  },
  template: `
    <div class="absolute inset-0 scrim-center" aria-hidden="true"></div>

    <div class="relative px-6 text-center">
      <p class="mono-label animate-fade-in">Angular 21 · WebGL2 · no 3D engine</p>

      <h1 class="mt-4 text-5xl font-light tracking-[-0.03em] text-foreground md:text-7xl">
        Scale
      </h1>

      <p class="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
        A continuous descent from living tissue to the double helix, and back out
        to the network a single gene holds together.
      </p>

      <div class="mt-10 flex flex-col items-center gap-2">
        <span class="mono-label">Scroll to descend</span>
        <span class="relative block h-6 w-px overflow-hidden bg-border/50">
          <span class="absolute inset-x-0 top-0 h-2 animate-scroll-hint bg-primary"></span>
        </span>
      </div>
    </div>
  `,
})
export class Intro {
  readonly dismissed = input.required<boolean>();
}
