import { computed, ref, shallowRef } from 'vue'
import { CINEMA_BY_ID, CINEMA_GAMES, type CinemaGame } from '~/data/games'
import { ChessGame, type GameStatus, type MoveRecord } from '~/game/game'
import { DIFFICULTIES, type Difficulty } from '~/game/search'
import {
  BLACK, KING, QUEEN, WHITE, type Color, moveCaptured, moveTo, pieceColor, pieceType, squareName,
} from '~/game/types'
import { DEFAULT_PIECE_SET, PIECE_SETS, PIECE_SET_BY_ID, type PieceSet } from '~/world/sets'
import {
  DEFAULT_PALETTE, PALETTES, type Palette, type PaletteValues,
} from '~/world/theme'
import type { CameraMode, MarkerKind, WorldOptions, WorldStats } from '~/world/world'
import { ChessWorld } from '~/world/world'
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

const paletteId = ref<string>(PALETTES[0]!.id)
const paletteValues = ref<PaletteValues>({ ...DEFAULT_PALETTE })
const pieceSetId = ref<string>(DEFAULT_PIECE_SET.id)

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

const interactive = computed(
  () =>
    mode.value === 'play' &&
    !status.value.over &&
    !thinking.value &&
    !animating.value &&
    (opponent.value === 'human' || turn.value === playerSide.value),
)

const resultText = computed(() => {
  const value = status.value
  if (!value.over) return null
  switch (value.outcome) {
    case 'checkmate':
      return `${value.winner === WHITE ? 'Cyan' : 'Magenta'} wins by checkmate`
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

function notify(message: string, duration = 2600): void {
  toast.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), duration)
}

function refresh(): void {
  const current = game.value
  turn.value = current.turn
  status.value = current.status()
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
  const record = current.play(move)
  clearSelection()
  refresh()

  animating.value = true
  const kingSquare = current.checkedKingSquare()
  await world.value?.playMove(record, { kingSquare })
  animating.value = false
  syncMarkers()

  if (mode.value === 'play') await afterMove()
}

async function afterMove(): Promise<void> {
  refresh()
  if (status.value.over) {
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
    clearSelection()
    world.value?.sync(game.value.pieces(), true)
    world.value?.faceSide(playerSide.value)
    refresh()
    if (mode.value === 'play' && opponent.value === 'engine' && turn.value !== playerSide.value) {
      await think()
    }
  }

  async function undo(): Promise<void> {
    if (mode.value !== 'play' || thinking.value) return
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
