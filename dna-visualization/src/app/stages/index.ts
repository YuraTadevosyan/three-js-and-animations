import type { SequenceStore } from '../bio/store';
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
export function createStages(sequence: SequenceStore): Stage[] {
  return [
    new TissueStage(),
    new CellStage(),
    new NucleusStage(),
    new ChromatinStage(),
    // The four scales below render the active sequence, so they read from the
    // store and rebuild their buffers when it changes.
    new HelixStage(sequence),
    new BasePairStage(sequence),
    new TranscriptionStage(sequence),
    new TranslationStage(sequence),
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
