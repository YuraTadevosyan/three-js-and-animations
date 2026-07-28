/**
 * Shared chart prop types.
 *
 * These live in a plain module rather than in the components that consume them:
 * a Svelte component's instance script cannot export types, and a view that
 * needs `MorphMode` shouldn't have to reach into a `.svelte` file to get it.
 */

export type MorphMode = 'stacked' | 'grouped' | 'share' | 'stream'

export interface MorphSeries {
  key: string
  label: string
  /** 1-based categorical slot. Bound to the entity, never to its rank. */
  slot: number
  values: number[]
}

export interface LineSeries {
  key: string
  label: string
  slot: number
  values: (number | null)[]
  /** Overrides the slot colour — used for status-meaning series. */
  color?: string
  /** Render as a supporting reference: thinner and dashed. */
  reference?: boolean
}

export interface LegendItem {
  label: string
  slot?: number
  color?: string
  /**
   * Overrides the legend's default swatch for this row. A legend mirrors the
   * mark it stands for, so a chart carrying both bars and lines needs both
   * shapes in the same legend.
   */
  mark?: 'rect' | 'line' | 'dot'
}

export interface BarItem {
  label: string
  value: number
  color?: string
  /** Secondary value shown in the tooltip only. */
  detail?: string
}

export interface ShareSegment {
  label: string
  slot: number
  value: number
}

export interface OverlaySeries {
  key: string
  label: string
  slot: number
  values: (number | null)[]
}
