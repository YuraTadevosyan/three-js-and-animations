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
