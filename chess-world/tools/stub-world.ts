/** Stand-in for the PlayCanvas world, so the UI logic can be driven in Node. */
import type { BoardPiece, MoveRecord } from '../app/game/game'

export type CameraMode = 'orbit' | 'follow' | 'cinema'
export type MarkerKind = 'select' | 'move' | 'capture' | 'last' | 'check' | 'hover'

export interface WorldCallbacks {
  onPick?: (square: number) => void
  onHover?: (square: number) => void
  canGrab?: (square: number) => boolean
  onDrop?: (from: number, to: number) => void
}

export class ChessWorld {
  static last: ChessWorld | null = null
  readonly log: string[] = []
  markers: { square: number; kind: MarkerKind }[] = []
  readonly sound = {
    enabled: true,
    resume: () => {},
    select: () => {},
    deny: () => {},
  }

  constructor(_canvas: unknown, readonly callbacks: WorldCallbacks = {}) {
    ChessWorld.last = this
  }

  sync(pieces: BoardPiece[]): void {
    this.log.push(`sync:${pieces.length}`)
    this.markers = []
  }

  playMove(record: MoveRecord): Promise<void> {
    this.log.push(`play:${record.san}`)
    return Promise.resolve()
  }

  setMarkers(markers: { square: number; kind: MarkerKind }[], replace: MarkerKind[]): void {
    this.markers = this.markers.filter((m) => !replace.includes(m.kind)).concat(markers)
  }

  clearMarkers(): void {
    this.markers = []
  }

  palette: Record<string, string> | null = null

  applyPalette(values: Record<string, string>): void {
    this.palette = { ...values }
    this.log.push(`palette:${values.lightArmy ?? '?'}`)
  }

  setCameraMode(): void {}
  faceSide(): void {}
  setSpeed(): void {}
  setQuality(): void {}
  finishAnimations(): void {}
  destroy(): void {}
  get busy(): boolean {
    return false
  }
}
