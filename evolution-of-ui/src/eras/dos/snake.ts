/**
 * SNAKE: the text-mode game every DOS machine ended up with a copy of
 * (QBasic shipped one as NIBBLES.BAS). Pure logic: the terminal ticks it.
 */

import { COLS, ROWS, type Screen } from './screen'

const BAR = 0x70 // black on grey
const FRAME = 0x08 // dim
const BODY = 0x0a // bright green
const HEAD = 0x0e // yellow
const FOOD = 0x0c // bright red
const BLOCK = 0x2588 // █

export const FIELD_W = COLS - 2
export const FIELD_H = ROWS - 4

export type SnakeEvent = 'move' | 'ate' | 'died' | 'idle'

export class Snake {
  /** Cell indices (y * FIELD_W + x), head first. */
  body: number[] = []
  food = 0
  score = 0
  dead = false
  private dx = 1
  private dy = 0
  /** Turns queued since the last tick, so two quick key presses both count. */
  private turns: [number, number][] = []

  constructor(
    private rand: () => number = Math.random,
    public best = 0,
  ) {
    this.reset()
  }

  reset(): void {
    const y = Math.floor(FIELD_H / 2)
    const x = Math.floor(FIELD_W / 3)
    this.body = [0, 1, 2, 3].map((k) => y * FIELD_W + x - k)
    this.dx = 1
    this.dy = 0
    this.turns = []
    this.score = 0
    this.dead = false
    this.placeFood()
  }

  private placeFood(): void {
    const taken = new Set(this.body)
    const free = FIELD_W * FIELD_H - taken.size
    if (free <= 0) return
    let pick = Math.floor(this.rand() * free)
    for (let i = 0; i < FIELD_W * FIELD_H; i++) {
      if (taken.has(i)) continue
      if (pick-- === 0) {
        this.food = i
        return
      }
    }
  }

  turn(dx: number, dy: number): void {
    const [lx, ly] = this.turns.at(-1) ?? [this.dx, this.dy]
    // No reversing into yourself, and no queueing the same turn twice.
    if ((dx === -lx && dy === -ly) || (dx === lx && dy === ly)) return
    if (this.turns.length < 3) this.turns.push([dx, dy])
  }

  tick(): SnakeEvent {
    if (this.dead) return 'idle'
    const next = this.turns.shift()
    if (next) [this.dx, this.dy] = next
    const head = this.body[0]
    const x = (head % FIELD_W) + this.dx
    const y = Math.floor(head / FIELD_W) + this.dy
    const cell = y * FIELD_W + x
    // The tail moves out of the way this tick, so it isn't an obstacle.
    const hitsSelf = this.body.slice(0, -1).includes(cell)
    if (x < 0 || y < 0 || x >= FIELD_W || y >= FIELD_H || hitsSelf) {
      this.dead = true
      this.best = Math.max(this.best, this.score)
      return 'died'
    }
    this.body.unshift(cell)
    if (cell === this.food) {
      this.score++
      this.placeFood()
      return 'ate'
    }
    this.body.pop()
    return 'move'
  }

  draw(s: Screen): void {
    s.fill(0x07)
    s.fillRow(0, BAR)
    s.putAt(1, 0, 'SNAKE.BAS', BAR)
    s.putAt(14, 0, `Score ${this.score}`, BAR)
    s.putAt(26, 0, `Best ${this.best}`, BAR)
    s.putAt(COLS - 34, 0, 'Arrows steer    Esc quits to DOS', BAR)

    s.putAt(0, 1, `┌${'─'.repeat(COLS - 2)}┐`, FRAME)
    for (let r = 0; r < FIELD_H; r++) {
      s.putAt(0, 2 + r, '│', FRAME)
      s.putAt(COLS - 1, 2 + r, '│', FRAME)
    }
    s.putAt(0, ROWS - 2, `└${'─'.repeat(COLS - 2)}┘`, FRAME)

    const at = (cell: number): [number, number] => [1 + (cell % FIELD_W), 2 + Math.floor(cell / FIELD_W)]
    s.set(...at(this.food), BLOCK, FOOD)
    this.body.forEach((cell, i) => s.set(...at(cell), BLOCK, i === 0 ? HEAD : BODY))

    if (this.dead) {
      const msg = `  GAME OVER   Score ${this.score}   Enter = again   Esc = quit  `
      const x = Math.floor((COLS - msg.length) / 2)
      const y = Math.floor(ROWS / 2)
      s.putAt(x, y - 1, ' '.repeat(msg.length), BAR)
      s.putAt(x, y, msg, BAR)
      s.putAt(x, y + 1, ' '.repeat(msg.length), BAR)
    }
    // No cursor in a game: park it off the right edge, where nothing draws it.
    s.cx = COLS
    s.cy = ROWS - 1
    s.putAt(1, ROWS - 1, this.dead ? 'Dead. It happens to every snake.' : 'Eat the red block. Do not eat the wall, or yourself.', 0x08)
  }
}
