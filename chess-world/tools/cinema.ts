/**
 * End-to-end replay of the reported flow: switch to Cinema, load
 * Kasparov–Topalov, press play — with the real world on a null device and a
 * frame pump standing in for requestAnimationFrame.
 */
import { NullGraphicsDevice } from 'playcanvas'
import { useChessWorld } from '../app/composables/useChessWorld'
import { installFakeDom, makeCanvas } from './fake-dom'

installFakeDom()

let failures = 0
function check(label: string, condition: boolean, detail = ''): void {
  if (!condition) failures++
  console.log(`${condition ? '  ok  ' : ' FAIL '} ${label}${detail ? ` — ${detail}` : ''}`)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function main(): Promise<void> {
  const canvas = makeCanvas()
  const state = useChessWorld()
  state.attach(canvas, { graphicsDevice: new NullGraphicsDevice(canvas) })

  const world = state.world.value
  check('world attached', world !== null)
  if (!world) return

  // Stand in for the browser's rAF loop.
  let frameError: string | null = null
  const pump = setInterval(() => {
    if (frameError) return
    try {
      world.app.update(1 / 60)
      world.app.render()
    } catch (error) {
      frameError = error instanceof Error ? `${error.message}\n${error.stack}` : String(error)
    }
  }, 3)

  state.setMode('cinema')
  check('mode switched to cinema', state.mode.value === 'cinema')

  state.loadCinema('kasparov-topalov')
  check('Kasparov game loaded', state.cinemaId.value === 'kasparov-topalov')
  check('board reset to ply 0', state.cinemaPly.value === 0)

  void state.cinemaPlay()
  await sleep(150)
  check('playing flag set', state.cinemaPlaying.value === true)

  await sleep(6000)
  check('frames ran without throwing', frameError === null, frameError ?? '')
  check(
    'moves advanced while playing',
    state.cinemaPly.value >= 3,
    `reached ply ${state.cinemaPly.value} of ${state.cinemaLength.value}, history=${state.history.value.length}`,
  )
  check('the world was told to animate', state.animating.value || state.cinemaPly.value > 0)

  state.cinemaPause()
  await sleep(1200)
  const paused = state.cinemaPly.value
  await sleep(800)
  check('pause stops it', state.cinemaPly.value === paused, `${paused} → ${state.cinemaPly.value}`)

  state.cinemaSeek(20)
  check('seek jumps to a ply', state.cinemaPly.value === 20 && state.history.value.length === 20,
    `ply=${state.cinemaPly.value} history=${state.history.value.length}`)

  clearInterval(pump)
}

main()
  .then(() => {
    if (failures) {
      console.error(`\n${failures} failure(s)`)
      process.exit(1)
    }
    console.log('\ncinema playback works')
    process.exit(0)
  })
  .catch((error) => {
    console.error('threw:', error instanceof Error ? error.stack : error)
    process.exit(1)
  })
