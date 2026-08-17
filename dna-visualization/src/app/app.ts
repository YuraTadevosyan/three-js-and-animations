import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  signal,
  viewChild,
} from '@angular/core';

import { Renderer } from './gl/renderer';
import type { Stage } from './gl/stage';
import { HELIX_STAGE_IDS, createStages } from './stages';
import { CaptionPanel } from './ui/caption';
import { Hud } from './ui/hud';
import { Intro } from './ui/intro';
import { ScaleRail, type RailItem } from './ui/scale-rail';

@Component({
  selector: 'dna-root',
  imports: [ScaleRail, CaptionPanel, Hud, Intro],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements AfterViewInit, OnDestroy {
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  readonly stages: Stage[] = createStages();
  readonly railItems: RailItem[] = this.stages.map(({ id, label, scale }) => ({ id, label, scale }));

  readonly stageIndex = signal(0);
  readonly progress = signal(0);
  readonly fps = signal(60);
  readonly quality = signal(1);
  readonly introDismissed = signal(false);
  readonly fatal = signal<string | null>(null);

  readonly current = computed(() => this.stages[this.stageIndex()] ?? this.stages[0]!);

  readonly indexLabel = computed(
    () => `${String(this.stageIndex() + 1).padStart(2, '0')} / ${String(this.stages.length).padStart(2, '0')}`,
  );

  /** One viewport of scrolling per stage, plus one so the last stage can rest. */
  readonly trackHeight = computed(() => (this.stages.length + 1) * 100);

  readonly showSequence = computed(() => HELIX_STAGE_IDS.has(this.current().id));

  /** Walk the readout along the sequence as the helix stages play out. */
  readonly sequenceStart = computed(() => {
    const local = this.progress() * this.stages.length - this.stageIndex();
    return Math.round(local * 60);
  });

  private renderer: Renderer | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private lastPublishedProgress = -1;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;

    try {
      this.renderer = new Renderer(canvas, this.stages, {
        onStageChange: (index) => this.stageIndex.set(index),
        onProgress: (value) => {
          // Signal writes drive change detection in a zoneless app, so only
          // publish when the number would actually move something on screen.
          if (Math.abs(value - this.lastPublishedProgress) < 0.0008) return;
          this.lastPublishedProgress = value;
          this.progress.set(value);
        },
        onStats: (fps, quality) => {
          this.fps.set(fps);
          this.quality.set(quality);
        },
      });
    } catch (error) {
      this.fatal.set(error instanceof Error ? error.message : String(error));
      return;
    }

    this.syncSize();
    this.resizeObserver = new ResizeObserver(() => this.syncSize());
    this.resizeObserver.observe(document.documentElement);

    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    window.addEventListener('hashchange', this.handleHashChange);

    this.applyDeepLink();

    // Snap rather than ease on the first frame — a deep link or a restored
    // scroll position should open at that scale, not dive to it from the top.
    const range = this.scrollRange();
    this.renderer.snapProgress(range > 0 ? window.scrollY / range : 0);

    this.renderer.start();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('hashchange', this.handleHashChange);
    this.resizeObserver?.disconnect();
    this.renderer?.dispose();
    this.renderer = null;
  }

  /** Scroll the journey to a stage, used by the rail. */
  goToStage(index: number): void {
    const max = this.scrollRange();
    if (max <= 0) return;
    // Aim a third of the way in, where the stage is fully faded up and its
    // content has arrived but not yet started leaving.
    const target = ((index + 0.34) / this.stages.length) * max;
    window.scrollTo({ top: target, behavior: this.prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  private scrollRange(): number {
    return document.documentElement.scrollHeight - window.innerHeight;
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private readonly handleScroll = (): void => {
    const max = this.scrollRange();
    const value = max > 0 ? window.scrollY / max : 0;
    this.renderer?.setProgress(value);
    if (window.scrollY > 40 && !this.introDismissed()) this.introDismissed.set(true);
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    this.renderer?.setPointer(
      (event.clientX / window.innerWidth) * 2 - 1,
      -((event.clientY / window.innerHeight) * 2 - 1),
    );
  };

  private readonly handleHashChange = (): void => {
    this.applyDeepLink();
  };

  /** `#helix` in the URL jumps straight to that scale on load. */
  private applyDeepLink(): void {
    const id = window.location.hash.replace('#', '');
    if (!id) return;
    const index = this.stages.findIndex((stage) => stage.id === id);
    if (index < 0) return;
    this.introDismissed.set(true);
    const max = this.scrollRange();
    window.scrollTo({ top: ((index + 0.34) / this.stages.length) * max, behavior: 'auto' });
  }

  private syncSize(): void {
    this.renderer?.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1);
  }
}
