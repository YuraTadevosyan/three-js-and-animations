import { computed, ref, shallowRef } from 'vue'
import { CINEMA_BY_ID, CINEMA_GAMES, type CinemaGame } from '~/data/games'
import {
  Clock, DEFAULT_TIME_CONTROL, TIME_CONTROLS, TIME_CONTROL_BY_ID, URGENT_MS, type TimeControl,
} from '~/game/clock'
import { ChessGame, type GameStatus, type MoveRecord } from '~/game/game'
import { DIFFICULTIES, type Difficulty } from '~/game/search'
import {
  BISHOP, BLACK, KING, KNIGHT, QUEEN, STARTING_FEN, WHITE, type Color, moveCaptured, moveTo,
  pieceColor, pieceType, squareName,
} from '~/game/types'
import { DEFAULT_PIECE_SET, PIECE_SETS, PIECE_SET_BY_ID, type PieceSet } from '~/world/sets'
import {
  DEFAULT_PALETTE, PALETTES, type Palette, type PaletteValues,
} from '~/world/theme'
import type { CameraMode, MarkerKind, WorldOptions, WorldStats } from '~/world/world'
import { ChessWorld } from '~/world/world'
import { useAnalysis } from './useAnalysis'
import { createEngine } from './useEngine'

export type Mode = 'play' | 'cinema'
export type Opponent = 'engine' | 'human'

export interface HistoryEntry {
  ply: number
  moveNumber: number
  color: Color
  san: string
}

const engine = createEngine()
const analysis = useAnalysis()

/* --------------------------------------------------------------- state -- */

const mode = ref<Mode>('play')
const world = shallowRef<ChessWorld | null>(null)
const game = shallowRef(new ChessGame())
const ready = ref(false)

const turn = ref<Color>(WHITE)
const status = ref<GameStatus>({ over: false, outcome: null, winner: null, inCheck: false, turn: WHITE })
const history = ref<HistoryEntry[]>([])
const captured = ref<{ white: number[]; black: number[] }>({ white: [], black: [] })

const selected = ref(-1)
const targets = ref<{ square: number; capture: boolean }[]>([])
const hovered = ref(-1)
const promotionPrompt = ref<{ from: number; to: number } | null>(null)
const hint = ref<{ from: number; to: number } | null>(null)

const PALETTE_STORAGE_KEY = 'chess-world:palette'
const PIECE_SET_STORAGE_KEY = 'chess-world:piece-set'
const TIME_CONTROL_STORAGE_KEY = 'chess-world:time-control'

const paletteId = ref<string>(PALETTES[0]!.id)
const paletteValues = ref<PaletteValues>({ ...DEFAULT_PALETTE })
const pieceSetId = ref<string>(DEFAULT_PIECE_SET.id)

/**
 * A result the position cannot express. A flag falling ends the game while the
 * board is still perfectly playable, so it is kept beside `status` rather than
 * inside it — the engine's rules stay the engine's rules.
 */
interface Adjudication {
  outcome: 'timeout' | 'timeout-insufficient'
  winner: Color | null
}

const timeControlId = ref<string>(DEFAULT_TIME_CONTROL.id)
let clock = new Clock(DEFAULT_TIME_CONTROL)
/** Clocks as they stood before each ply, so undo can put them back. */
let clockHistory: [number, number][] = []
const clockTimes = ref<[number, number]>([0, 0])
const clockPaused = ref(false)
const clockActive = ref<Color | null>(null)
const adjudication = ref<Adjudication | null>(null)
let ticker: ReturnType<typeof setInterval> | null = null
let lastTickSecond = -1

/** Which ply the board is parked on while a review is being walked through. */
const browsingPly = ref<number | null>(null)

const worldError = ref<string | null>(null)
const frameError = ref<string | null>(null)
const postProcessing = ref(true)
const stats = ref<WorldStats | null>(null)
const thinking = ref(false)
const engineLine = ref<{ depth: number; score: number; nodes: number; mateIn: number | null; pv: string[] } | null>(null)
const animating = ref(false)

const playerSide = ref<Color>(WHITE)
const opponent = ref<Opponent>('engine')
const difficulty = ref<Difficulty>('club')
const cameraMode = ref<CameraMode>('follow')
const soundOn = ref(true)
const quality = ref<'high' | 'low'>('high')

const cinemaId = ref<string>(CINEMA_GAMES[0]!.id)
const cinemaPly = ref(0)
const cinemaPlaying = ref(false)
const cinemaSpeed = ref(1)
const cinemaNote = ref<string | null>(null)

const toast = ref<string | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

/* ------------------------------------------------------------- derived -- */

const cinemaGame = computed<CinemaGame>(() => CINEMA_BY_ID.get(cinemaId.value) ?? CINEMA_GAMES[0]!)
const cinemaLength = computed(() => cinemaGame.value.moves.length)

const timeControl = computed<TimeControl>(
  () => TIME_CONTROL_BY_ID.get(timeControlId.value) ?? DEFAULT_TIME_CONTROL,
)

/** Over by the rules, or over because someone ran out of time. */
const gameOver = computed(() => status.value.over || adjudication.value !== null)

const interactive = computed(
  () =>
    mode.value === 'play' &&
    !gameOver.value &&
    browsingPly.value === null &&
    !clockPaused.value &&
    !thinking.value &&
    !animating.value &&
    (opponent.value === 'human' || turn.value === playerSide.value),
)

const armyName = (color: Color): string => (color === WHITE ? 'Cyan' : 'Magenta')

const resultText = computed(() => {
  const flag = adjudication.value
  if (flag) {
    if (flag.winner === null) return 'Draw — time ran out, and nothing left to mate with'
    return `${armyName(flag.winner)} wins on time`
  }
  const value = status.value
  if (!value.over) return null
  switch (value.outcome) {
    case 'checkmate':
      return `${armyName(value.winner!)} wins by checkmate`
    case 'stalemate':
      return 'Draw — stalemate'
    case 'fifty-move':
      return 'Draw — fifty-move rule'
    case 'repetition':
      return 'Draw — threefold repetition'
    case 'insufficient':
      return 'Draw — insufficient material'
    default:
      return 'Game over'
  }
})

const materialBalance = computed(() => {
  const values = [0, 1, 3, 3, 5, 9, 0]
  const white = captured.value.white.reduce((sum, type) => sum + values[type]!, 0)
  const black = captured.value.black.reduce((sum, type) => sum + values[type]!, 0)
  return white - black
})

/* ------------------------------------------------------------- helpers -- */

/** Colours survive a reload; a failed read just means the default palette. */
function loadPalette(): void {
  try {
    const stored = localStorage.getItem(PALETTE_STORAGE_KEY)
    if (!stored) return
    const parsed = JSON.parse(stored) as { id?: string; values?: Partial<PaletteValues> }
    const preset = PALETTES.find((entry) => entry.id === parsed.id)
    if (preset) {
      paletteId.value = preset.id
      paletteValues.value = { ...preset }
      return
    }
    if (parsed.values) {
      paletteId.value = 'custom'
      paletteValues.value = { ...DEFAULT_PALETTE, ...parsed.values }
    }
  } catch {
    // Private browsing, cleared storage, corrupt JSON — the default is fine.
  }
}

function savePalette(): void {
  try {
    localStorage.setItem(
      PALETTE_STORAGE_KEY,
      JSON.stringify({ id: paletteId.value, values: paletteValues.value }),
    )
  } catch {
    // Not being able to remember the choice is not worth interrupting play.
  }
}

/** The chosen piece set, like the palette, survives a reload. */
function loadPieceSet(): void {
  try {
    const stored = localStorage.getItem(PIECE_SET_STORAGE_KEY)
    if (stored && PIECE_SET_BY_ID.has(stored)) pieceSetId.value = stored
  } catch {
    // Private browsing or cleared storage — the default set is fine.
  }
}

/** The chosen time control, like the palette, survives a reload. */
function loadTimeControl(): void {
  try {
    const stored = localStorage.getItem(TIME_CONTROL_STORAGE_KEY)
    if (stored && TIME_CONTROL_BY_ID.has(stored)) timeControlId.value = stored
  } catch {
    // Private browsing or cleared storage — untimed is fine.
  }
}

/* --------------------------------------------------------------- clock -- */

function readClock(): void {
  const now = Date.now()
  clockTimes.value = [clock.remaining(WHITE, now), clock.remaining(BLACK, now)]
  clockActive.value = clock.active
}

function stopTicker(): void {
  if (!ticker) return
  clearInterval(ticker)
  ticker = null
}

function startTicker(): void {
  if (ticker || !clock.enabled) return
  ticker = setInterval(pulse, 100)
}

/**
 * One reading of the clock: refresh the display, tick off the last ten
 * seconds, and drop the flag at zero. The clock itself keeps no running
 * total — this only ever asks it what the time is — so a throttled tab or a
 * dropped frame cannot make anyone's time drift.
 */
function pulse(): void {
  readClock()
  const running = clock.active
  if (running === null) return
  const left = clock.remaining(running, Date.now())
  if (left <= 0) {
    flagFall(running)
    return
  }
  if (left >= URGENT_MS) {
    lastTickSecond = -1
    return
  }
  const second = Math.ceil(left / 1000)
  if (second === lastTickSecond) return
  lastTickSecond = second
  world.value?.sound.tick()
}

/**
 * FIDE 6.9: running out of time only loses if the other side could mate by
 * *some* legal series of moves. A lone king, or a king and one minor piece,
 * cannot — so that is a draw, not a win on time.
 */
function canMate(color: Color): boolean {
  let minors = 0
  const board = game.value.position.board
  for (let square = 0; square < 128; square++) {
    if (square & 0x88) continue
    const piece = board[square] ?? 0
    if (piece === 0 || pieceColor(piece) !== color) continue
    const type = pieceType(piece)
    if (type === KING) continue
    if (type === BISHOP || type === KNIGHT) {
      minors++
      continue
    }
    return true
  }
  return minors >= 2
}

function flagFall(side: Color): void {
  clock.stop(Date.now())
  stopTicker()
  readClock()
  const other = (side ^ 1) as Color
  const winner = canMate(other) ? other : null
  adjudication.value = { outcome: winner === null ? 'timeout-insufficient' : 'timeout', winner }
  clearSelection()
  world.value?.sound.flag()
  notify(resultText.value ?? 'Out of time', 5200)
}

/** Hands the clock to whoever is on move, unless the game is not running. */
function startClockForTurn(): void {
  if (!clock.enabled || clockPaused.value || mode.value !== 'play') return
  if (adjudication.value !== null || status.value.over) return
  clock.start(game.value.turn, Date.now())
  lastTickSecond = -1
  readClock()
  startTicker()
}

function resetClock(): void {
  stopTicker()
  clock = new Clock(timeControl.value)
  clockHistory = []
  clockPaused.value = false
  adjudication.value = null
  lastTickSecond = -1
  readClock()
}

/** Puts both clocks back to where they stood before `ply` was played. */
function rewindClock(ply: number): void {
  if (!clock.enabled) return
  const times = clockHistory[ply]
  clock.stop(Date.now())
  if (times) clock.restore(times, Date.now())
  clockHistory.length = Math.min(clockHistory.length, ply)
  // Taking the move back takes the flag back with it, or the board would be
  // playable while the game insisted it was over.
  adjudication.value = null
  readClock()
  // Undone all the way back to the start, the clock waits for the first move
  // again rather than running on an empty board.
  if (game.value.history.length > 0) startClockForTurn()
}

function notify(message: string, duration = 2600): void {
  toast.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), duration)
}

function refresh(): void {
  const current = game.value
  turn.value = current.turn
  status.value = current.status()
  // The bar follows the board: one shallow search per position, on its own
  // worker, cancelled the moment another position arrives.
  void analysis.evaluate(current.fen, current.turn, status.value.over)
  captured.value = current.captured()
  history.value = current.history.map((record, index) => ({
    ply: index,
    moveNumber: record.moveNumber,
    color: record.color,
    san: record.san,
  }))
}

function markerList(): { square: number; kind: MarkerKind }[] {
  const markers: { square: number; kind: MarkerKind }[] = []
  if (selected.value >= 0) markers.push({ square: selected.value, kind: 'select' })
  for (const target of targets.value) {
    markers.push({ square: target.square, kind: target.capture ? 'capture' : 'move' })
  }
  if (hint.value) {
    markers.push({ square: hint.value.from, kind: 'select' })
    markers.push({ square: hint.value.to, kind: 'move' })
  }
  const checkedKing = game.value.checkedKingSquare()
  if (checkedKing >= 0) markers.push({ square: checkedKing, kind: 'check' })
  return markers
}

function syncMarkers(): void {
  world.value?.setMarkers(markerList(), ['select', 'move', 'capture', 'check'])
}

function clearSelection(): void {
  selected.value = -1
  targets.value = []
  hint.value = null
  syncMarkers()
}

/* ---------------------------------------------------------- move flow -- */

async function commit(move: number): Promise<void> {
  const current = game.value
  const mover = current.turn
  const timed = clock.enabled && mode.value === 'play'
  if (timed) clockHistory[current.history.length] = clock.snapshot(Date.now())

  const record = current.play(move)
  // The mover's time stops the moment the move is made. Everything that
  // follows — a knight's somersault, a queen rebuilding herself out of sparks
  // — is the app's time to spend, not theirs.
  if (timed) {
    clock.press(mover, Date.now())
    readClock()
  }
  clearSelection()
  refresh()

  animating.value = true
  const kingSquare = current.checkedKingSquare()
  await world.value?.playMove(record, { kingSquare })
  animating.value = false
  syncMarkers()

  if (mode.value !== 'play') return
  startClockForTurn()
  await afterMove()
}

async function afterMove(): Promise<void> {
  refresh()
  if (status.value.over) {
    clock.stop(Date.now())
    stopTicker()
    readClock()
    notify(resultText.value ?? 'Game over', 5200)
    world.value?.setCameraMode(cameraMode.value)
    return
  }
  if (opponent.value === 'engine' && turn.value !== playerSide.value) await think()
}

async function think(): Promise<void> {
  const current = game.value
  thinking.value = true
  try {
    const reply = await engine.think(current.fen, DIFFICULTIES[difficulty.value])
    engineLine.value = reply.move
      ? { depth: reply.depth, score: reply.score, nodes: reply.nodes, mateIn: reply.mateIn, pv: reply.pv }
      : null
    if (!reply.move) return
    const move = current.find(reply.move.from, reply.move.to, reply.move.promotion)
    if (move === null) {
      notify('The engine suggested an illegal move — resynchronising')
      resync()
      return
    }
    thinking.value = false
    await commit(move)
  } finally {
    thinking.value = false
  }
}

function resync(): void {
  world.value?.sync(game.value.pieces())
  refresh()
  syncMarkers()
}

/* ------------------------------------------------------------- public -- */

export function useChessWorld() {
  function attach(canvas: HTMLCanvasElement, options: WorldOptions = {}): void {
    if (world.value) return
    let instance: ChessWorld
    try {
      instance = new ChessWorld(canvas, {
        onPick: (square) => void pick(square),
        onHover: (square) => (hovered.value = square),
        canGrab: (square) => canGrab(square),
        onDrop: (from, to) => void drop(from, to),
        onFrameError: (message) => (frameError.value = message),
      }, options)
    } catch (error) {
      // Without this the loading veil would simply hang forever.
      console.error('[chess-world] the arena failed to start', error)
      worldError.value = error instanceof Error ? error.message : String(error)
      ready.value = true
      return
    }
    world.value = instance
    loadPalette()
    loadPieceSet()
    loadTimeControl()
    resetClock()
    instance.applyPalette(paletteValues.value)
    instance.setPieceSet(pieceSetId.value)
    instance.setCameraMode(cameraMode.value)
    instance.faceSide(playerSide.value, true)
    instance.sound.enabled = soundOn.value
    instance.setQuality(quality.value)
    instance.sync(game.value.pieces(), true)
    refresh()
    ready.value = true
  }

  function detach(): void {
    stopTicker()
    analysis.cancelReview()
    world.value?.destroy()
    world.value = null
    ready.value = false
  }

  async function pick(square: number): Promise<void> {
    if (mode.value === 'cinema') return
    const current = game.value
    if (!interactive.value) {
      if (thinking.value) notify('The engine is thinking')
      return
    }

    const piece = current.position.board[square] ?? 0
    const isOwn = piece !== 0 && pieceColor(piece) === current.turn

    if (selected.value >= 0) {
      const target = targets.value.find((entry) => entry.square === square)
      if (target) {
        if (current.needsPromotion(selected.value, square)) {
          promotionPrompt.value = { from: selected.value, to: square }
          return
        }
        const move = current.find(selected.value, square)
        if (move !== null) {
          await commit(move)
          return
        }
      }
      if (!isOwn) {
        clearSelection()
        world.value?.sound.deny()
        return
      }
    }

    if (!isOwn) return
    selected.value = square
    targets.value = current.movesFrom(square).map((move) => ({
      square: moveTo(move),
      capture: moveCaptured(move) !== 0,
    }))
    hint.value = null
    world.value?.sound.select()
    syncMarkers()
  }

  /** Can this square's piece be picked up right now? */
  function canGrab(square: number): boolean {
    if (mode.value !== 'play' || !interactive.value) return false
    const piece = game.value.position.board[square] ?? 0
    return piece !== 0 && pieceColor(piece) === game.value.turn
  }

  /** A dragged piece was released over `to` (-1 when dropped off the board). */
  async function drop(from: number, to: number): Promise<void> {
    if (to < 0 || to === from) return
    if (!interactive.value) return
    const current = game.value
    if (current.needsPromotion(from, to)) {
      promotionPrompt.value = { from, to }
      return
    }
    const move = current.find(from, to)
    if (move === null) {
      // Illegal drop: the piece is already back home and stays selected, so
      // the highlighted squares are still there to click.
      world.value?.sound.deny()
      return
    }
    await commit(move)
  }

  async function choosePromotion(type: number): Promise<void> {
    const prompt = promotionPrompt.value
    promotionPrompt.value = null
    if (!prompt) return
    const move = game.value.find(prompt.from, prompt.to, type)
    if (move === null) return
    await commit(move)
  }

  function cancelPromotion(): void {
    promotionPrompt.value = null
    clearSelection()
  }

  async function newGame(): Promise<void> {
    world.value?.finishAnimations()
    game.value.reset()
    cinemaNote.value = null
    engineLine.value = null
    browsingPly.value = null
    analysis.clearReview()
    resetClock()
    clearSelection()
    world.value?.sync(game.value.pieces(), true)
    world.value?.faceSide(playerSide.value)
    refresh()
    if (mode.value === 'play' && opponent.value === 'engine' && turn.value !== playerSide.value) {
      await think()
    }
  }

  async function undo(): Promise<void> {
    if (mode.value !== 'play' || thinking.value || browsingPly.value !== null) return
    const current = game.value
    if (!current.history.length) return
    world.value?.finishAnimations()
    current.undo()
    // Take back the engine's reply as well, so the player is on move again.
    if (opponent.value === 'engine' && current.turn !== playerSide.value && current.history.length) {
      current.undo()
    }
    clearSelection()
    resync()
    engineLine.value = null
    rewindClock(current.history.length)
    // Undoing back past the engine's opening move leaves it on move with
    // nothing to trigger it — ask for a fresh one rather than deadlocking.
    if (opponent.value === 'engine' && !status.value.over && current.turn !== playerSide.value) {
      await think()
    }
  }

  async function requestHint(): Promise<void> {
    if (!interactive.value) return
    thinking.value = true
    try {
      const reply = await engine.think(game.value.fen, DIFFICULTIES.club)
      if (!reply.move) return
      hint.value = { from: reply.move.from, to: reply.move.to }
      notify(`Try ${squareName(reply.move.from)} → ${squareName(reply.move.to)}`)
      syncMarkers()
    } finally {
      thinking.value = false
    }
  }

  function setMode(next: Mode): void {
    if (mode.value === next) return
    cinemaPlaying.value = false
    world.value?.finishAnimations()
    mode.value = next
    clearSelection()
    engineLine.value = null

    browsingPly.value = null
    analysis.clearReview()
    stopTicker()
    clock.stop(Date.now())
    readClock()

    if (next === 'cinema') {
      cameraMode.value = 'cinema'
      world.value?.setCameraMode('cinema')
      world.value?.setSpeed(cinemaSpeed.value)
      loadCinema(cinemaId.value)
      return
    }

    // Cinema's speed control drives the whole animator, so hand it back.
    world.value?.setSpeed(1)
    cameraMode.value = 'follow'
    world.value?.setCameraMode('follow')
    void newGame()
  }

  function setPlayerSide(side: Color): void {
    playerSide.value = side
    world.value?.faceSide(side)
    void newGame()
  }

  function setDifficulty(level: Difficulty): void {
    difficulty.value = level
  }

  function setCameraMode(next: CameraMode): void {
    cameraMode.value = next
    world.value?.setCameraMode(next)
  }

  function setSound(enabled: boolean): void {
    soundOn.value = enabled
    const instance = world.value
    if (!instance) return
    instance.sound.enabled = enabled
    if (enabled) instance.sound.resume()
  }

  function setQuality(level: 'high' | 'low'): void {
    quality.value = level
    world.value?.setQuality(level)
  }

  /** Switches to one of the built-in palettes. */
  function setPalette(id: string): void {
    const preset = PALETTES.find((entry) => entry.id === id)
    if (!preset) return
    paletteId.value = preset.id
    paletteValues.value = { ...preset }
    world.value?.applyPalette(paletteValues.value)
    savePalette()
  }

  /** Edits one colour, which moves the palette to "custom". */
  function setPaletteColor(key: keyof PaletteValues, hex: string): void {
    paletteValues.value = { ...paletteValues.value, [key]: hex }
    paletteId.value = 'custom'
    world.value?.applyPalette(paletteValues.value)
    savePalette()
  }

  function resetPalette(): void {
    setPalette(PALETTES[0]!.id)
  }

  /** Switches the piece set. Pieces are rebuilt where they stand. */
  function setPieceSet(id: string): void {
    if (!PIECE_SET_BY_ID.has(id) || id === pieceSetId.value) return
    pieceSetId.value = id
    world.value?.setPieceSet(id)
    try {
      localStorage.setItem(PIECE_SET_STORAGE_KEY, id)
    } catch {
      // Not being able to remember the choice is not worth interrupting play.
    }
  }

  /* ---------------------------------------------------------- clock --- */

  /** Changing the time control starts a fresh game; a clock cannot be added
   *  to a position that has already been thought about for ten minutes. */
  function setTimeControl(id: string): void {
    if (!TIME_CONTROL_BY_ID.has(id) || id === timeControlId.value) return
    timeControlId.value = id
    try {
      localStorage.setItem(TIME_CONTROL_STORAGE_KEY, id)
    } catch {
      // Not remembering the choice is not worth interrupting play.
    }
    void newGame()
  }

  function setClockPaused(paused: boolean): void {
    if (!clock.enabled || !game.value.history.length) return
    clockPaused.value = paused
    if (paused) {
      clock.stop(Date.now())
      stopTicker()
      readClock()
      return
    }
    startClockForTurn()
  }

  /* --------------------------------------------------------- review --- */

  /** Grades every move played so far. The clock waits while it runs. */
  async function startReview(): Promise<void> {
    if (mode.value !== 'play' || !game.value.history.length) return
    setClockPaused(true)
    const result = await analysis.runReview(STARTING_FEN, game.value.history)
    if (!result) return
    const mine = playerSide.value === WHITE ? result.white : result.black
    notify(`Reviewed — ${mine.accuracy.toFixed(1)}% accurate, ${mine.acpl} centipawns a move`, 4200)
  }

  /**
   * Parks the board on a position from the review. The live game is left
   * alone: this replays into a scratch board, so walking back through a game
   * cannot lose it.
   */
  function reviewSeek(ply: number): void {
    const records = game.value.history
    const target = Math.max(0, Math.min(ply, records.length))
    world.value?.finishAnimations()
    setClockPaused(true)

    const scratch = new ChessGame()
    for (let i = 0; i < target; i++) scratch.playSan(records[i]!.san)
    browsingPly.value = target
    selected.value = -1
    targets.value = []
    hint.value = null
    world.value?.sync(scratch.pieces())
    void analysis.evaluate(scratch.fen, scratch.turn, scratch.status().over)

    const markers: { square: number; kind: MarkerKind }[] = []
    const record = records[target - 1]
    if (record) {
      markers.push({ square: record.from, kind: 'last' }, { square: record.to, kind: 'last' })
      const reviewed = analysis.reviewedAt(target - 1)
      // What the engine would have played instead, where it disagreed.
      if (reviewed && reviewed.bestFrom >= 0 && reviewed.best) {
        markers.push({ square: reviewed.bestFrom, kind: 'select' })
        markers.push({ square: reviewed.bestTo, kind: 'move' })
      }
    }
    const checked = scratch.checkedKingSquare()
    if (checked >= 0) markers.push({ square: checked, kind: 'check' })
    world.value?.setMarkers(markers, ['select', 'move', 'capture', 'check', 'last'])
  }

  /** Back to the position the game is actually in. */
  function exitBrowse(): void {
    if (browsingPly.value === null) return
    browsingPly.value = null
    resync()
    // "Back to the game" means back to the game: a clock left paused here
    // would look like the board had stopped responding.
    if (!gameOver.value) setClockPaused(false)
  }

  function setPostProcessing(enabled: boolean): void {
    postProcessing.value = enabled
    world.value?.setPostProcessing(enabled)
  }

  /** Samples the renderer for the diagnostics panel. */
  function refreshStats(): void {
    stats.value = world.value?.stats() ?? null
  }

  /* --------------------------------------------------------- cinema --- */

  function loadCinema(id: string): void {
    cinemaPlaying.value = false
    cinemaId.value = id
    cinemaPly.value = 0
    cinemaNote.value = null
    world.value?.finishAnimations()
    game.value.reset()
    world.value?.sync(game.value.pieces(), true)
    world.value?.faceSide(WHITE)
    refresh()
  }

  async function cinemaStep(): Promise<boolean> {
    const fixture = cinemaGame.value
    if (cinemaPly.value >= fixture.moves.length) return false
    const san = fixture.moves[cinemaPly.value]!
    const record: MoveRecord | null = game.value.playSan(san)
    if (!record) {
      notify(`Replay stopped: ${san} is not legal here`)
      cinemaPlaying.value = false
      return false
    }
    cinemaPly.value++
    refresh()

    const highlight = fixture.highlights.find((entry) => entry.ply === cinemaPly.value)
    cinemaNote.value = highlight?.note ?? null

    animating.value = true
    await world.value?.playMove(record, { kingSquare: game.value.checkedKingSquare() })
    animating.value = false
    return true
  }

  async function cinemaPlay(): Promise<void> {
    if (cinemaPlaying.value) return
    cinemaPlaying.value = true
    world.value?.sound.resume()
    while (cinemaPlaying.value && cinemaPly.value < cinemaLength.value) {
      const advanced = await cinemaStep()
      if (!advanced) break
      const pause = (cinemaNote.value ? 900 : 260) / cinemaSpeed.value
      await new Promise((resolve) => setTimeout(resolve, pause))
    }
    cinemaPlaying.value = false
  }

  function cinemaPause(): void {
    cinemaPlaying.value = false
  }

  function cinemaSeek(ply: number): void {
    const fixture = cinemaGame.value
    const target = Math.max(0, Math.min(ply, fixture.moves.length))
    cinemaPlaying.value = false
    world.value?.finishAnimations()
    game.value.reset()
    for (let i = 0; i < target; i++) game.value.playSan(fixture.moves[i]!)
    cinemaPly.value = target
    cinemaNote.value = fixture.highlights.find((entry) => entry.ply === target)?.note ?? null
    world.value?.sync(game.value.pieces())
    refresh()
    syncMarkers()
  }

  function setCinemaSpeed(speed: number): void {
    cinemaSpeed.value = speed
    world.value?.setSpeed(speed)
  }

  return {
    // state
    mode,
    world,
    ready,
    turn,
    status,
    history,
    captured,
    selected,
    hovered,
    targets,
    promotionPrompt,
    thinking,
    worldError,
    frameError,
    postProcessing,
    stats,
    palettes: PALETTES as Palette[],
    paletteId,
    paletteValues,
    pieceSets: PIECE_SETS as PieceSet[],
    pieceSetId,
    timeControls: TIME_CONTROLS as TimeControl[],
    timeControlId,
    timeControl,
    clockTimes,
    clockActive,
    clockPaused,
    adjudication,
    browsingPly,
    engineLine,
    animating,
    playerSide,
    opponent,
    difficulty,
    cameraMode,
    soundOn,
    quality,
    toast,
    // derived
    interactive,
    gameOver,
    resultText,
    materialBalance,
    // cinema
    cinemaGames: CINEMA_GAMES,
    cinemaGame,
    cinemaId,
    cinemaPly,
    cinemaLength,
    cinemaPlaying,
    cinemaSpeed,
    cinemaNote,
    // actions
    attach,
    detach,
    pick,
    canGrab,
    drop,
    choosePromotion,
    cancelPromotion,
    newGame,
    undo,
    requestHint,
    setMode,
    setPlayerSide,
    setDifficulty,
    setCameraMode,
    setSound,
    setQuality,
    setPostProcessing,
    setPalette,
    setPaletteColor,
    resetPalette,
    setPieceSet,
    setTimeControl,
    setClockPaused,
    startReview,
    reviewSeek,
    exitBrowse,
    refreshStats,
    setOpponent: (value: Opponent) => {
      opponent.value = value
      void newGame()
    },
    loadCinema,
    cinemaStep,
    cinemaPlay,
    cinemaPause,
    cinemaSeek,
    setCinemaSpeed,
    // constants
    KING,
    QUEEN,
    WHITE,
    BLACK,
    pieceType,
    squareName,
  }
}
