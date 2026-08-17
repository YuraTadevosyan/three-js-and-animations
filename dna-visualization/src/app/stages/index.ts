import type { Stage } from '../gl/stage';
import { BasePairStage } from './basepairs';
import { CellStage } from './cell';
import { ChromatinStage } from './chromatin';
import { HelixStage } from './helix';
import { InteractomeStage } from './interactome';
import { NucleusStage } from './nucleus';
import { TissueStage } from './tissue';
import { TranscriptionStage } from './transcription';
import { TranslationStage } from './translation';

/**
 * The journey, outermost scale first.
 *
 * Order is the whole narrative: each stage hands off to the next as the viewer
 * scrolls, and the renderer crossfades neighbours so no scale change is a cut.
 * The descent runs tissue → base pairs, then the last three stages pull back
 * out to what the sequence actually does.
 */
export function createStages(): Stage[] {
  return [
    new TissueStage(),
    new CellStage(),
    new NucleusStage(),
    new ChromatinStage(),
    new HelixStage(),
    new BasePairStage(),
    new TranscriptionStage(),
    new TranslationStage(),
    new InteractomeStage(),
  ];
}

/** Stages whose scene shows the nucleotide sequence, so the HUD can print it. */
export const HELIX_STAGE_IDS: ReadonlySet<string> = new Set([
  'helix',
  'basepairs',
  'transcription',
  'translation',
]);
