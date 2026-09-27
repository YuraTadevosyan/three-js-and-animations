/**
 * Beginner Minesweeper: 9×9, ten mines, first click always safe (and always
 * opens a patch, since its neighbours are kept clear too).
 *
 * A board is a flat array of small integers so it lives happily in a Qwik
 * store: bit 0 mine, bit 1 open, bit 2 flag, bits 3+ adjacent-mine count.
 */

export const COLS = 9
export const ROWS = 9
export const MINES = 10

export const MINE = 1
export const OPEN = 2
export const FLAG = 4

export type GameState = 'ready' | 'playing' | 'won' | 'lost'

export const count = (cell: number): number => cell >> 3
export const isMine = (cell: number): boolean => (cell & MINE) !== 0
export const isOpen = (cell: number): boolean => (cell & OPEN) !== 0
export const isFlag = (cell: number): boolean => (cell & FLAG) !== 0

export const newBoard = (): number[] => new Array<number>(COLS * ROWS).fill(0)

export function neighbours(i: number): number[] {
  const x = i % COLS
  const y = Math.floor(i / COLS)
  const out: number[] = []
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) out.push(ny * COLS + nx)
    }
  }
  return out
}

/** Lay mines everywhere except `safe` and its neighbours, then count. */
export function plant(board: number[], safe: number, rand: () => number = Math.random): void {
  const keepClear = new Set([safe, ...neighbours(safe)])
  const candidates = board.map((_, i) => i).filter((i) => !keepClear.has(i))
  for (let k = 0; k < MINES; k++) {
    const pick = k + Math.floor(rand() * (candidates.length - k))
    ;[candidates[k], candidates[pick]] = [candidates[pick], candidates[k]]
    board[candidates[k]] |= MINE
  }
  for (let i = 0; i < board.length; i++) {
    const n = neighbours(i).filter((j) => isMine(board[j])).length
    board[i] = (board[i] & 7) | (n << 3)
  }
}

/** Open a cell (flood-filling blanks). Returns true if it was a mine. */
export function reveal(board: number[], i: number): boolean {
  if (isOpen(board[i]) || isFlag(board[i])) return false
  if (isMine(board[i])) {
    board[i] |= OPEN
    return true
  }
  const stack = [i]
  while (stack.length) {
    const j = stack.pop()!
    if (isOpen(board[j]) || isFlag(board[j])) continue
    board[j] |= OPEN
    if (count(board[j]) === 0) for (const n of neighbours(j)) if (!isOpen(board[n])) stack.push(n)
  }
  return false
}

/**
 * Chord: clicking an open number whose flags are all placed opens the rest
 * of its neighbours. Returns true if that detonated a (mis-flagged) mine.
 */
export function chord(board: number[], i: number): boolean {
  const c = board[i]
  if (!isOpen(c) || count(c) === 0) return false
  const ns = neighbours(i)
  if (ns.filter((n) => isFlag(board[n])).length !== count(c)) return false
  let boom = false
  for (const n of ns) if (!isFlag(board[n]) && !isOpen(board[n])) boom = reveal(board, n) || boom
  return boom
}

export function toggleFlag(board: number[], i: number): void {
  if (!isOpen(board[i])) board[i] ^= FLAG
}

export const hasWon = (board: number[]): boolean => board.every((c) => isMine(c) || isOpen(c))

export const flagsPlaced = (board: number[]): number => board.filter(isFlag).length

/** End of game: show every mine (and, on a win, flag them all like Windows did). */
export function exposeMines(board: number[], won: boolean): void {
  for (let i = 0; i < board.length; i++) {
    if (!isMine(board[i])) continue
    if (won) board[i] |= FLAG
    else if (!isFlag(board[i])) board[i] |= OPEN
  }
}
