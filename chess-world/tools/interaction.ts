/**
 * Drives the real UI state machine with a stubbed world, so the click →
 * select → move path can be verified without a browser.
 */
import { useChessWorld } from '../app/composables/useChessWorld'
import { parseSquare, squareName } from '../app/game/types'
import { ChessWorld } from './stub-world'

const state = useChessWorld()
let failures = 0

function check(label: string, condition: boolean, detail = ''): void {
  if (!condition) failures++
  console.log(`${condition ? '  ok  ' : ' FAIL '} ${label}${detail ? ` — ${detail}` : ''}`)
}

async function main(): Promise<void> {
  state.attach({} as HTMLCanvasElement)
  const world = ChessWorld.last!

  check('world attached', world !== null)
  check('a palette is applied on attach', world.palette !== null, JSON.stringify(world.palette))
  check('a piece set is applied on attach', world.pieceSet === state.pieceSets[0]!.id, world.pieceSet)
  check('pieces placed', world.log.includes('sync:32'), world.log.join(','))
  check('interactive on load', state.interactive.value === true,
    `mode=${state.mode.value} over=${state.status.value.over} thinking=${state.thinking.value} animating=${state.animating.value} turn=${state.turn.value} side=${state.playerSide.value}`)

  // Click the e2 pawn.
  await state.pick(parseSquare('e2'))
  check('selecting e2 sets selection', state.selected.value === parseSquare('e2'),
    `selected=${state.selected.value >= 0 ? squareName(state.selected.value) : 'none'}`)
  check('e2 offers two targets', state.targets.value.length === 2,
    state.targets.value.map((t) => squareName(t.square)).join(' '))
  check('markers pushed to the world', world.markers.some((m) => m.kind === 'select'),
    JSON.stringify(world.markers.map((m) => `${m.kind}@${squareName(m.square)}`)))

  // Click e4 to play the move.
  state.setOpponent('human')
  await state.pick(parseSquare('e2'))
  await state.pick(parseSquare('e4'))
  check('move played', state.history.value.length === 1,
    `history=${state.history.value.map((h) => h.san).join(' ')}`)
  check('move animated', world.log.includes('play:e4'), world.log.join(','))
  check('turn passed to black', state.turn.value === 1)
  check('selection cleared after moving', state.selected.value === -1)

  // Black replies, then a capture.
  await state.pick(parseSquare('d7'))
  await state.pick(parseSquare('d5'))
  check('black replied d5', state.history.value.length === 2,
    state.history.value.map((h) => h.san).join(' '))
  await state.pick(parseSquare('e4'))
  await state.pick(parseSquare('d5'))
  check('capture exd5 played', state.history.value.at(-1)?.san === 'exd5',
    state.history.value.map((h) => h.san).join(' '))

  // Clicking an empty square should deselect, not throw.
  await state.pick(parseSquare('g1'))
  await state.pick(parseSquare('a6'))
  check('clicking a far empty square clears selection', state.selected.value === -1)

  await state.undo()
  check('undo removes the last move', state.history.value.length === 2,
    state.history.value.map((h) => h.san).join(' '))

  /* ---- the same moves again, but dragged rather than clicked ---------- */

  await state.newGame()
  state.setOpponent('human')
  const grab = world.callbacks.canGrab!
  const release = world.callbacks.onDrop!

  check('own piece can be grabbed', grab(parseSquare('d2')) === true)
  check('empty square cannot be grabbed', grab(parseSquare('d4')) === false)
  check('opponent piece cannot be grabbed', grab(parseSquare('d7')) === false)

  release(parseSquare('d2'), parseSquare('d4'))
  await Promise.resolve()
  await new Promise((r) => setTimeout(r, 0))
  check('dragging d2 to d4 plays the move', state.history.value.at(-1)?.san === 'd4',
    state.history.value.map((h) => h.san).join(' '))

  const before = state.history.value.length
  release(parseSquare('d7'), parseSquare('d3'))
  await new Promise((r) => setTimeout(r, 0))
  check('an illegal drop plays nothing', state.history.value.length === before)

  release(parseSquare('e7'), -1)
  await new Promise((r) => setTimeout(r, 0))
  check('dropping off the board plays nothing', state.history.value.length === before)

  /* ---- promotion, reached by dragging --------------------------------- */

  state.loadCinema('reti-tartakower')
  check('cinema load resets the board', state.history.value.length === 0)

  /* ---- colours -------------------------------------------------------- */

  state.setPalette('ember')
  check('preset selected', state.paletteId.value === 'ember' && world.palette?.lightArmy === '#ffc46b',
    JSON.stringify(world.palette))

  state.setPaletteColor('lightArmy', '#00ff88')
  check('editing a colour switches to custom', state.paletteId.value === 'custom')
  check('the edit reaches the world', world.palette?.lightArmy === '#00ff88', JSON.stringify(world.palette))
  check('other colours are kept', world.palette?.darkArmy === '#ff4530', JSON.stringify(world.palette))

  state.resetPalette()
  check('reset returns to the first preset', state.paletteId.value === state.palettes[0]!.id)

  state.setPalette('does-not-exist')
  check('an unknown palette is ignored', state.paletteId.value === state.palettes[0]!.id)

  // Piece sets.
  check('three sets are offered', state.pieceSets.length === 3,
    state.pieceSets.map((set) => set.id).join(' '))
  for (const set of state.pieceSets) {
    check(`set "${set.name}" describes itself`, set.name.length > 0 && set.hint.length > 0)
    check(`set "${set.name}" has all six pieces`,
      [1, 2, 3, 4, 5, 6].every((type) => set.shapes[type] !== undefined))
  }

  state.setPieceSet('glyph')
  check('choosing a set reaches the world',
    state.pieceSetId.value === 'glyph' && world.pieceSet === 'glyph', world.pieceSet)

  state.setPieceSet('does-not-exist')
  check('an unknown set is ignored', state.pieceSetId.value === 'glyph', state.pieceSetId.value)

  const logged = world.log.length
  state.setPieceSet('glyph')
  check('re-choosing the set in play does nothing', world.log.length === logged)

  state.setPieceSet('classic')
  check('switching back works', world.pieceSet === 'classic', world.pieceSet)

  /* ---- walking back through a game ------------------------------------ */

  // `loadCinema` above emptied the board; put a few moves back on it.
  for (const [from, to] of [['e2', 'e4'], ['e7', 'e5'], ['g1', 'f3']] as const) {
    await state.pick(parseSquare(from))
    await state.pick(parseSquare(to))
  }
  const played = state.history.value.length
  check('three moves on the board to walk back through', played === 3,
    state.history.value.map((h) => h.san).join(' '))
  state.reviewSeek(1)
  check('seeking parks the board on an earlier ply', state.browsingPly.value === 1,
    `${state.browsingPly.value}`)
  check('the live game is left alone', state.history.value.length === played,
    `${state.history.value.length} of ${played}`)
  check('the board stops taking moves while parked', state.interactive.value === false)
  check('the move that was played is marked',
    world.markers.filter((marker) => marker.kind === 'last').length === 2,
    JSON.stringify(world.markers.map((m) => `${m.kind}@${squareName(m.square)}`)))

  await state.pick(parseSquare('d2'))
  check('and picking up a piece does nothing there', state.selected.value === -1)

  state.exitBrowse()
  check('leaving review hands the game back', state.browsingPly.value === null)
  check('the board is put back on the live position',
    state.interactive.value === true, `interactive=${state.interactive.value}`)

  /* ---- the clock ------------------------------------------------------- */

  // Wall-clock time is pushed forward by hand, so a one-minute game can be
  // played out — and flagged — in a few hundred milliseconds.
  const realNow = Date.now
  let offset = 0
  Date.now = () => realNow.call(Date) + offset
  /** Moves time on, then waits for the clock's own interval to notice. */
  const advance = async (ms: number): Promise<void> => {
    offset += ms
    await new Promise((resolve) => setTimeout(resolve, 140))
  }

  state.setTimeControl('bullet')
  await new Promise((resolve) => setTimeout(resolve, 0))
  check('choosing a time control starts a fresh game', state.history.value.length === 0,
    `${state.history.value.length} moves`)
  check('both sides start with the full minute',
    state.clockTimes.value[0] === 60_000 && state.clockTimes.value[1] === 60_000,
    state.clockTimes.value.join(' / '))
  check('nothing is running before the first move', state.clockActive.value === null)

  await state.pick(parseSquare('e2'))
  await state.pick(parseSquare('e4'))
  check('the first move hands the clock to the other side', state.clockActive.value === 1,
    `${state.clockActive.value}`)
  check('the side that opened is not charged for it', state.clockTimes.value[0] === 60_000,
    `${state.clockTimes.value[0]}`)

  await advance(20_000)
  check('time comes off the side to move',
    Math.abs(state.clockTimes.value[1] - 40_000) < 500, `${state.clockTimes.value[1]}`)
  check('and not off the side waiting', state.clockTimes.value[0] === 60_000,
    `${state.clockTimes.value[0]}`)

  await advance(35_000)
  check('the last ten seconds tick', world.ticks > 0, `${world.ticks} ticks`)

  await advance(6_000)
  check('the flag falls', state.adjudication.value?.outcome === 'timeout',
    JSON.stringify(state.adjudication.value))
  check('the win goes to the side that still had time',
    state.adjudication.value?.winner === 0, `${state.adjudication.value?.winner}`)
  check('the game is over', state.gameOver.value === true)
  check('the board stops taking moves', state.interactive.value === false)
  check('and it is audible', world.flags === 1, `${world.flags}`)

  await state.undo()
  check('taking the move back takes the flag back', state.adjudication.value === null)
  check('and gives the time back',
    state.clockTimes.value[0] === 60_000 && state.clockTimes.value[1] === 60_000,
    state.clockTimes.value.join(' / '))
  check('with the clock waiting for a first move again', state.clockActive.value === null)
  check('the board is playable again', state.interactive.value === true)

  state.setTimeControl('off')
  await new Promise((resolve) => setTimeout(resolve, 0))
  check('an untimed game keeps no clock', state.clockActive.value === null)
  Date.now = realNow
}

main()
  .then(() => {
    if (failures) {
      console.error(`\n${failures} failure(s)`)
      process.exit(1)
    }
    console.log('\ninteraction path works')
  })
  .catch((error) => {
    console.error('threw:', error)
    process.exit(1)
  })
