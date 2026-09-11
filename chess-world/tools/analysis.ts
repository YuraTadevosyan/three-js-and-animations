/**
 * The clock and the game review.
 *
 * Both are arithmetic dressed up as chess, and both are the kind of thing that
 * looks right on screen while being quietly wrong: a clock that loses a second
 * per move, or a review that calls a good move a blunder because the sign of
 * an evaluation was flipped somewhere. The clock is driven here a millisecond
 * at a time, and the review is run over a real game with a real search.
 */
import { useAnalysis } from '../app/composables/useAnalysis'
import { Clock, TIME_CONTROLS, TIME_CONTROL_BY_ID, formatClock } from '../app/game/clock'
import { ChessGame } from '../app/game/game'
import {
  EVAL_CAP, classify, moveAccuracy, summarise, toCentipawns, type ReviewedMove,
} from '../app/game/review'
import { BLACK, STARTING_FEN, WHITE } from '../app/game/types'

let failures = 0

function check(label: string, condition: boolean, detail = ''): void {
  if (!condition) failures++
  console.log(`${condition ? '  ok  ' : ' FAIL '} ${label}${detail ? ` — ${detail}` : ''}`)
}

/* ---- the clock --------------------------------------------------------- */

const blitz = TIME_CONTROL_BY_ID.get('blitz')!

{
  const clock = new Clock(blitz)
  check('a fresh clock gives both sides the base time',
    clock.remaining(WHITE, 0) === 180_000 && clock.remaining(BLACK, 0) === 180_000)
  check('nothing runs until someone is put on move', clock.active === null)

  // White opens. Their clock was not running, so the first move is free — the
  // clock starts with the game, the way it does online.
  clock.press(WHITE, 1_000)
  check('White is not charged for the first move', clock.remaining(WHITE, 1_000) === 180_000)
  check('and gets no increment for it', clock.remaining(WHITE, 1_000) === 180_000)

  clock.start(BLACK, 1_000)
  check('Black is on move', clock.active === BLACK)
  check('time only comes off the side to move',
    clock.remaining(BLACK, 6_000) === 175_000 && clock.remaining(WHITE, 6_000) === 180_000,
    `${clock.remaining(BLACK, 6_000)} / ${clock.remaining(WHITE, 6_000)}`)

  clock.press(BLACK, 6_000)
  check('a completed move banks the time spent and adds the increment',
    clock.remaining(BLACK, 60_000) === 177_000, `${clock.remaining(BLACK, 60_000)}`)
  check('and stops the clock', clock.active === null)

  // Reading the clock must never change it: this is the bug that makes a clock
  // lose a second a move.
  clock.start(WHITE, 10_000)
  for (let now = 10_000; now <= 20_000; now += 37) clock.remaining(WHITE, now)
  check('polling the clock does not consume time',
    clock.remaining(WHITE, 20_000) === 170_000, `${clock.remaining(WHITE, 20_000)}`)

  clock.stop(20_000)
  check('a pause holds the time where it was',
    clock.remaining(WHITE, 90_000) === 170_000, `${clock.remaining(WHITE, 90_000)}`)
  clock.start(WHITE, 90_000)
  check('and resuming carries on from there',
    clock.remaining(WHITE, 95_000) === 165_000, `${clock.remaining(WHITE, 95_000)}`)
}

{
  const clock = new Clock(TIME_CONTROL_BY_ID.get('bullet')!)
  clock.start(WHITE, 0)
  check('no flag while there is time left', clock.flagged(59_000) === null)
  check('the flag falls at zero, not before', clock.flagged(60_000) === WHITE)
  check('a clock never goes negative', clock.remaining(WHITE, 120_000) === 0)
  check('only the running clock can fall', clock.flagged(120_000) === WHITE)

  // A move completed after the flag earns nothing: the game is already over.
  clock.press(WHITE, 120_000)
  check('a fallen flag gets no increment', clock.remaining(WHITE, 120_000) === 0)
}

{
  const clock = new Clock(TIME_CONTROLS[0]!)
  check('an untimed control keeps no clock', !clock.enabled)
  clock.start(WHITE, 0)
  check('and cannot be started', clock.active === null)
  check('and cannot fall', clock.flagged(10_000_000) === null)
}

{
  const clock = new Clock(blitz)
  clock.start(WHITE, 0)
  const before = clock.snapshot(5_000)
  clock.press(WHITE, 5_000)
  clock.start(BLACK, 5_000)
  clock.press(BLACK, 20_000)
  clock.restore(before, 30_000)
  check('an undo puts both clocks back',
    clock.remaining(WHITE, 30_000) === before[0] && clock.remaining(BLACK, 30_000) === before[1],
    `${clock.remaining(WHITE, 30_000)} / ${clock.remaining(BLACK, 30_000)}`)
}

check('a clock reads as minutes and seconds', formatClock(185_400) === '3:05', formatClock(185_400))
check('and to a tenth once it is urgent', formatClock(9_440) === '0:09.4', formatClock(9_440))
check('zero is zero', formatClock(0) === '0:00.0', formatClock(0))
check('every time control is distinct',
  new Set(TIME_CONTROLS.map((control) => control.id)).size === TIME_CONTROLS.length)

/* ---- grading ----------------------------------------------------------- */

check('the engine’s own move is always best', classify(0, true) === 'best')
check('so it is even if the search disagreed with itself', classify(400, true) === 'best')
check('a small slip is still a good move', classify(49, false) === 'good')
check('50 centipawns is an inaccuracy', classify(50, false) === 'inaccuracy')
check('120 is a mistake', classify(120, false) === 'mistake')
check('250 is a blunder', classify(250, false) === 'blunder')

check('a mate score is worth the cap', toCentipawns(29_995, 3) === EVAL_CAP)
check('being mated is worth minus the cap', toCentipawns(-29_995, -3) === -EVAL_CAP)
check('and an ordinary score passes through', toCentipawns(137, null) === 137)
check('past the cap is just won', toCentipawns(9_000, null) === EVAL_CAP)

check('a perfect move scores 100', Math.round(moveAccuracy(0)) === 100)
check('accuracy falls as the loss grows', moveAccuracy(30) > moveAccuracy(120))
check('a club-level slip still scores well', Math.round(moveAccuracy(30)) === 85, `${moveAccuracy(30).toFixed(1)}`)
check('accuracy never goes negative', moveAccuracy(100_000) >= 0)

{
  const moves: ReviewedMove[] = [
    { ply: 0, san: 'e4', color: WHITE, before: 20, after: 20, loss: 0, quality: 'best', best: null, bestFrom: -1, bestTo: -1 },
    { ply: 1, san: 'e5', color: BLACK, before: -20, after: -20, loss: 0, quality: 'best', best: null, bestFrom: -1, bestTo: -1 },
    { ply: 2, san: 'Qh5', color: WHITE, before: 20, after: -40, loss: 60, quality: 'inaccuracy', best: 'Nf3', bestFrom: 0, bestTo: 1 },
    { ply: 3, san: 'g6', color: BLACK, before: 40, after: -900, loss: 940, quality: 'blunder', best: 'Nc6', bestFrom: 0, bestTo: 1 },
  ]
  const review = summarise(moves, 200, 11)
  check('each side is counted separately',
    review.white.moves === 2 && review.black.moves === 2)
  check('blunders are attributed to whoever played them',
    review.white.blunders === 0 && review.black.blunders === 1)
  check('the worse side has the worse accuracy',
    review.black.accuracy < review.white.accuracy,
    `${review.black.accuracy} vs ${review.white.accuracy}`)
  check('the turning point is the costliest move',
    review.turningPoint?.san === 'g6', review.turningPoint?.san ?? 'none')
  check('centipawn loss is averaged over the side’s own moves',
    review.black.acpl === 470, `${review.black.acpl}`)
}

/* ---- a real review over a real game ------------------------------------ */

/**
 * Scholar's mate. Black's third move allows mate in one, so the review has to
 * call it a blunder — and White's mate has to come out as the best move rather
 * than the catastrophe it would look like if the evaluations were being
 * compared from the wrong side of the board.
 */
async function main(): Promise<void> {
  const analysis = useAnalysis()
  const game = new ChessGame()
  for (const san of ['e4', 'e5', 'Qh5', 'Nc6', 'Bc4', 'Nf6', 'Qxf7#']) {
    if (!game.playSan(san)) {
      check(`script move ${san} is legal`, false)
      return
    }
  }

  const started = Date.now()
  const review = await analysis.runReview(STARTING_FEN, game.history)
  if (!review) {
    check('the review ran', false)
    return
  }
  check(`the review ran — ${game.history.length} moves in ${Date.now() - started}ms`, true)
  check('every move was graded', review.moves.length === game.history.length,
    `${review.moves.length} of ${game.history.length}`)

  const grades = review.moves.map((entry) => `${entry.san}=${entry.quality}`).join(' ')
  const nf6 = review.moves.find((entry) => entry.san === 'Nf6')!
  const mate = review.moves.find((entry) => entry.san === 'Qxf7#')!

  check('allowing mate in one is a blunder', nf6.quality === 'blunder', grades)
  check('and it is the turning point', review.turningPoint?.san === 'Nf6',
    review.turningPoint?.san ?? 'none')
  check('delivering mate is the best move', mate.quality === 'best', grades)
  check('the mating move is not scored as a loss', mate.loss === 0, `${mate.loss}`)
  check('the position after mate is winning for the mating side',
    mate.after > 0, `${mate.after}`)
  check('a blunder is scored from the blunderer’s side of the board',
    nf6.after < nf6.before, `${nf6.before} → ${nf6.after}`)
  check('the engine names a better move than the blunder',
    nf6.best !== null && nf6.best !== 'Nf6', nf6.best ?? 'none')
  check('White comes out of Scholar’s mate ahead',
    review.white.accuracy > review.black.accuracy,
    `${review.white.accuracy} vs ${review.black.accuracy}`)
  check('no move claims to have gained material for nothing',
    review.moves.every((entry) => entry.loss >= 0))
}

main()
  .then(() => {
    if (failures) {
      console.error(`\n${failures} failure(s)`)
      process.exit(1)
    }
    console.log('\nthe clock keeps time and the review grades from the right side of the board')
  })
  .catch((error) => {
    console.error('threw:', error instanceof Error ? error.stack : error)
    process.exit(1)
  })
