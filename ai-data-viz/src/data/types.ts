/** Metadata for the dataset gallery and the per-dataset view header. */
export interface DatasetMeta {
  id: string
  name: string
  /** One line, sentence case — used on the card and under the view title. */
  tagline: string
  /** What the generator actually models, for the About page and view intro. */
  method: string
  /** Which categorical slot leads this dataset's visual identity (1-based). */
  accent: number
  /** Chart forms this view demonstrates — shown as chips on the card. */
  forms: string[]
  /** Whether the view streams new points in real time. */
  live: boolean
}

/** A named series, ready to hand to a chart. */
export interface Series {
  key: string
  label: string
  /** 1-based categorical slot. Assigned once per entity and never re-assigned. */
  slot: number
  values: number[]
}

/** One row of a table view — the WCAG-clean twin every chart card ships with. */
export interface TableSpec {
  columns: string[]
  rows: (string | number)[][]
}
