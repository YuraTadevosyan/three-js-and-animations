/**
 * Runs the real world in Node against PlayCanvas's null graphics device.
 *
 * The renderer cannot be seen here, but everything that runs *per frame* can:
 * this builds the scene, plays real moves through the real choreography, and
 * steps the update loop. An exception anywhere in there would, in a browser,
 * leave the canvas frozen on its last good frame while the UI kept
 * responding — which looks exactly like "nothing moves".
 */
import { NullGraphicsDevice } from 'playcanvas'
import { CINEMA_BY_ID } from '../app/data/games'
import { ChessGame } from '../app/game/game'
import { PALETTES, THEME, fromHex, toHex, type PaletteValues } from '../app/world/theme'
import { ChessWorld } from '../app/world/world'

/* ---- the smallest DOM the engine and the board texture need ------------ */

function fakeCanvas(): HTMLCanvasElement {
  const canvas = {
    width: 1280,
    height: 720,
    clientWidth: 1280,
    clientHeight: 720,
    style: {} as CSSStyleDeclaration,
    parentElement: null as unknown,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720, right: 1280, bottom: 720 }),
    getContext: () => context2d(),
    addEventListener: () => {},
    removeEventListener: () => {},
    setPointerCapture: () => {},
    releasePointerCapture: () => {},
    hasPointerCapture: () => false,
  }
  canvas.parentElement = { clientWidth: 1280, clientHeight: 720 }
  return canvas as unknown as HTMLCanvasElement
}

function context2d(): CanvasRenderingContext2D {
  const noop = () => {}
  return {
    fillRect: noop, strokeRect: noop, beginPath: noop, moveTo: noop, lineTo: noop, stroke: noop,
    fill: noop, arc: noop, save: noop, restore: noop, translate: noop, scale: noop, rotate: noop,
    clearRect: noop, drawImage: noop, putImageData: noop,
    createRadialGradient: () => ({ addColorStop: noop }),
    createLinearGradient: () => ({ addColorStop: noop }),
    getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    canvas: { width: 512, height: 512 },
    fillStyle: '', strokeStyle: '', lineWidth: 1, globalCompositeOperation: 'source-over',
  } as unknown as CanvasRenderingContext2D
}

const globals = globalThis as Record<string, unknown>
globals.window = { devicePixelRatio: 1, innerWidth: 1280, innerHeight: 720, addEventListener: () => {}, removeEventListener: () => {} }
globals.document = { createElement: () => fakeCanvas(), addEventListener: () => {}, removeEventListener: () => {} }
globals.ResizeObserver = class { observe(): void {} disconnect(): void {} }
globals.requestAnimationFrame = () => 0
globals.cancelAnimationFrame = () => {}

/* ---- run it ------------------------------------------------------------ */

let failures = 0
const errors: string[] = []
process.on('uncaughtException', (error) => {
  errors.push(String(error))
})

function check(label: string, condition: boolean, detail = ''): void {
  if (!condition) failures++
  console.log(`${condition ? '  ok  ' : ' FAIL '} ${label}${detail ? ` — ${detail}` : ''}`)
}

/** Steps the engine the way the browser's tick does: update, then render. */
function runFrames(app: ChessWorld['app'], count: number, dt = 1 / 60): string | null {
  for (let i = 0; i < count; i++) {
    try {
      app.update(dt)
      app.render()
    } catch (error) {
      return `frame ${i}: ${error instanceof Error ? `${error.message}\n${error.stack}` : String(error)}`
    }
  }
  return null
}

async function main(): Promise<void> {
  const canvas = fakeCanvas()
  const device = new NullGraphicsDevice(canvas)

  let world: ChessWorld
  try {
    world = new ChessWorld(canvas, {}, { graphicsDevice: device })
  } catch (error) {
    console.log(` FAIL  building the world threw: ${error instanceof Error ? error.stack : String(error)}`)
    process.exit(1)
  }
  check('world constructed', true)

  const game = new ChessGame()
  world.sync(game.pieces(), true)
  check('position synced', true)

  let failure = runFrames(world.app, 30)
  check('30 idle frames run clean', failure === null, failure ?? '')

  // Every piece type, a capture, a castle, a promotion and a mate — i.e. every
  // branch of the choreography.
  const script = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'O-O', 'Nf6', 'd3', 'd6', 'Bg5', 'h6', 'Bxf6', 'Qxf6', 'Nc3', 'Bg4', 'Qd2', 'O-O-O']
  for (const san of script) {
    const record = game.playSan(san)
    if (!record) {
      check(`script move ${san} is legal`, false)
      continue
    }
    void world.playMove(record, { kingSquare: game.checkedKingSquare() })
    failure = runFrames(world.app, 90)
    if (failure) {
      check(`animating ${san}`, false, failure)
      break
    }
  }
  if (!failure) check(`animated ${script.length} moves covering every piece type`, true)

  // Cinema: the exact thing that was reported broken.
  const kasparov = CINEMA_BY_ID.get('kasparov-topalov')!
  const replay = new ChessGame()
  world.sync(replay.pieces())
  let played = 0
  for (const san of kasparov.moves.slice(0, 30)) {
    const record = replay.playSan(san)
    if (!record) break
    void world.playMove(record, { kingSquare: replay.checkedKingSquare() })
    const problem = runFrames(world.app, 80)
    if (problem) {
      check(`Kasparov replay ply ${played + 1} (${san})`, false, problem)
      failures++
      break
    }
    played++
  }
  check('Kasparov–Topalov replays 30 plies without throwing', played === 30, `${played} plies`)

  /* ---- shared meshes must survive everything above -------------------- */

  // Destroying a MeshInstance frees its mesh once the refcount hits zero, so a
  // shared mesh can be freed while other instances are still rendering it.
  // Nothing in the scene may be left pointing at a destroyed mesh.
  function auditMeshes(label: string): void {
    const components = world.app.root.findComponents('render') as { meshInstances?: { mesh?: { vertexBuffer?: unknown; refCount: number } | null }[] }[]
    let live = 0
    const dead: string[] = []
    for (const component of components) {
      for (const instance of component.meshInstances ?? []) {
        const mesh = instance.mesh
        if (!mesh) {
          dead.push('instance with no mesh')
          continue
        }
        if (mesh.vertexBuffer === null || mesh.vertexBuffer === undefined) {
          dead.push(`destroyed mesh (refCount ${mesh.refCount})`)
          continue
        }
        live++
      }
    }
    check(`${label}: every mesh in the scene is alive`, dead.length === 0, dead.length ? `${dead.length} dead of ${live + dead.length}` : `${live} instances`)
  }

  auditMeshes('after a game and a replay')

  // The exact sequence that broke it: re-sync the board, which destroys all 32
  // pieces at once and then immediately respawns them from the same cache.
  for (let round = 0; round < 3; round++) {
    const fresh = new ChessGame()
    world.sync(fresh.pieces(), true)
    const problem = runFrames(world.app, 40)
    if (problem) {
      check(`re-sync round ${round + 1}`, false, problem)
      break
    }
    fresh.playSan('e4')
    void world.playMove(fresh.history[0]!, {})
    runFrames(world.app, 60)
  }
  auditMeshes('after three board resets')

  /* ---- palettes -------------------------------------------------------- */

  check('hex round trips', toHex(fromHex('#36d8ff')) === '#36d8ff', toHex(fromHex('#36d8ff')))
  check('bad hex falls back rather than throwing', toHex(fromHex('nonsense')) === '#808080', toHex(fromHex('nonsense')))

  for (const preset of PALETTES) {
    world.applyPalette(preset)
    const problem = runFrames(world.app, 20)
    if (problem) {
      check(`palette "${preset.name}" renders`, false, problem)
      break
    }
    const armyMatches = toHex(THEME.pieces.white.glow) === preset.lightArmy &&
      toHex(THEME.pieces.black.glow) === preset.darkArmy
    const boardMatches = toHex(THEME.board.light) === preset.lightSquare &&
      toHex(THEME.board.dark) === preset.darkSquare
    check(
      `palette "${preset.name}" repaints pieces and board`,
      armyMatches && boardMatches,
      `armies ${toHex(THEME.pieces.white.glow)}/${toHex(THEME.pieces.black.glow)}, squares ${toHex(THEME.board.light)}/${toHex(THEME.board.dark)}`,
    )
  }

  const custom: PaletteValues = {
    lightArmy: '#00ff88',
    darkArmy: '#ff00aa',
    lightSquare: '#332211',
    darkSquare: '#110a05',
    accent: '#ffaa00',
    background: '#000000',
  }
  world.applyPalette(custom)
  const customProblem = runFrames(world.app, 30)
  check('a custom palette renders', customProblem === null, customProblem ?? '')
  check('derived body colour stays distinct from the glow',
    toHex(THEME.pieces.white.body) !== toHex(THEME.pieces.white.glow),
    `${toHex(THEME.pieces.white.body)} vs ${toHex(THEME.pieces.white.glow)}`)

  // Repainting mid-game must not disturb the position or free anything.
  const midGame = new ChessGame()
  world.sync(midGame.pieces())
  midGame.playSan('e4')
  void world.playMove(midGame.history[0]!, {})
  world.applyPalette(PALETTES[2]!)
  const repaintProblem = runFrames(world.app, 60)
  check('repainting mid-move is safe', repaintProblem === null, repaintProblem ?? '')
  auditMeshes('after every palette')

  if (errors.length) {
    failures += errors.length
    console.log(` FAIL  uncaught: ${errors.join(' | ')}`)
  }
}

main()
  .then(() => {
    if (failures) {
      console.error(`\n${failures} failure(s)`)
      process.exit(1)
    }
    console.log('\nthe world runs clean headlessly')
  })
  .catch((error) => {
    console.error('threw:', error instanceof Error ? error.stack : error)
    process.exit(1)
  })
