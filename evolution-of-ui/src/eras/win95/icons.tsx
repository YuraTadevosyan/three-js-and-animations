/**
 * Windows 95-ish icons, drawn as 32×32 SVG in the spirit of the originals
 * (hard edges, a black outline, a highlight on the top-left). Inline
 * components rather than component$: they're pure markup, and inlining them
 * avoids a lazy boundary per icon.
 */

import type { JSXOutput } from '@builder.io/qwik'

export type IconName =
  | 'computer'
  | 'bin'
  | 'inbox'
  | 'ie'
  | 'notepad'
  | 'paint'
  | 'mines'
  | 'folder'
  | 'floppy'
  | 'drive'
  | 'control'
  | 'printer'
  | 'windows'
  | 'network'
  | 'network-off'
  | 'speaker'
  | 'error'
  | 'info'
  | 'warn'
  | 'programs'
  | 'documents'
  | 'find'
  | 'help'
  | 'run'
  | 'shutdown'
  | 'media'

const K = '#000'
const G = '#c0c0c0'
const D = '#808080'
const W = '#fff'

const folder = (extra?: JSXOutput): JSXOutput => (
  <>
    <path d="M3 9h9l2 2h15v16H3z" fill={K} />
    <path d="M4 10h7.6l2 2H28v14H4z" fill="#e8c24a" />
    <path d="M4 14h24v12H4z" fill="#f7d65a" />
    <path d="M4 14h24v1H4z" fill="#fff3b0" />
    {extra}
  </>
)

const ART: Record<IconName, () => JSXOutput> = {
  computer: () => (
    <g shape-rendering="crispEdges">
      <rect x="4" y="2" width="24" height="19" fill={K} />
      <rect x="5" y="3" width="22" height="17" fill={G} />
      <rect x="5" y="3" width="22" height="1" fill={W} />
      <rect x="5" y="3" width="1" height="17" fill={W} />
      <rect x="7" y="5" width="18" height="12" fill={D} />
      <rect x="8" y="6" width="16" height="10" fill="#008080" />
      <rect x="9" y="7" width="6" height="1" fill="#7fd6d6" />
      <rect x="13" y="21" width="6" height="2" fill={D} />
      <rect x="6" y="23" width="20" height="6" fill={K} />
      <rect x="7" y="24" width="18" height="4" fill={G} />
      <rect x="7" y="24" width="18" height="1" fill={W} />
      <rect x="18" y="26" width="5" height="1" fill={K} />
      <rect x="9" y="26" width="2" height="1" fill="#0a0" />
    </g>
  ),
  bin: () => (
    <>
      <path d="M8 8h16l-2 21H10z" fill="#e6e6e6" stroke={K} stroke-width="1" />
      <path d="M12 10l1 17M16 10v17M20 10l-1 17" stroke={D} stroke-width="1" />
      <ellipse cx="16" cy="8" rx="8.5" ry="2.2" fill="#f4f4f4" stroke={K} stroke-width="1" />
      <path d="M11 15h10M11.5 20h9" stroke={D} stroke-width=".8" />
    </>
  ),
  inbox: () => (
    <>
      <path d="M8 4h16v14H8z" fill={W} stroke={K} stroke-width="1" />
      <path d="M8 4l8 7 8-7" fill="none" stroke={K} stroke-width="1" />
      <path d="M3 16h7l2 4h8l2-4h7v11H3z" fill={G} stroke={K} stroke-width="1" />
      <path d="M4 17h5.4l2 4h9.2l2-4H28" fill="none" stroke={W} stroke-width="1" />
    </>
  ),
  ie: () => (
    <>
      <circle cx="16" cy="17" r="10" fill="#1d6fdc" stroke="#0a3f8c" stroke-width="1" />
      <path d="M10.5 17.5h11a5.5 5.5 0 1 0-1.6 3.9" fill="none" stroke={W} stroke-width="3" stroke-linecap="round" />
      <ellipse cx="16" cy="16" rx="14.5" ry="5.5" fill="none" stroke="#f5c400" stroke-width="2.2" transform="rotate(-24 16 16)" />
    </>
  ),
  notepad: () => (
    <g shape-rendering="crispEdges">
      <rect x="7" y="3" width="19" height="27" fill={K} />
      <rect x="8" y="4" width="17" height="25" fill={W} />
      <rect x="8" y="4" width="17" height="4" fill="#9ec5ff" />
      <rect x="10" y="11" width="13" height="1" fill="#6d8fd6" />
      <rect x="10" y="14" width="13" height="1" fill="#6d8fd6" />
      <rect x="10" y="17" width="13" height="1" fill="#6d8fd6" />
      <rect x="10" y="20" width="10" height="1" fill="#6d8fd6" />
      <rect x="10" y="23" width="12" height="1" fill="#6d8fd6" />
      <rect x="10" y="2" width="2" height="4" fill={D} />
      <rect x="15" y="2" width="2" height="4" fill={D} />
      <rect x="20" y="2" width="2" height="4" fill={D} />
    </g>
  ),
  paint: () => (
    <>
      <path d="M6 20c-4-6 1-15 10-15 8 0 12 5 11 10-1 4-5 3-7 5-2 3 1 7-5 7-4 0-7-3-9-7z" fill="#f0d9a8" stroke={K} stroke-width="1" />
      <circle cx="11" cy="12" r="2.2" fill="#e00" />
      <circle cx="17" cy="9.5" r="2.2" fill="#00c" />
      <circle cx="22" cy="12" r="2.2" fill="#0a0" />
      <circle cx="10" cy="18" r="2.2" fill="#fd0" />
      <path d="M21 29l8-12" stroke="#7a4a12" stroke-width="2.4" stroke-linecap="round" />
      <path d="M28.2 18.2l1.6-2.6" stroke={K} stroke-width="3" stroke-linecap="round" />
    </>
  ),
  mines: () => (
    <>
      <path d="M16 5v22M5 16h22M8.2 8.2l15.6 15.6M23.8 8.2L8.2 23.8" stroke={K} stroke-width="2" />
      <circle cx="16" cy="16" r="7.5" fill={K} />
      <rect x="12.5" y="12.5" width="3" height="3" fill={W} />
    </>
  ),
  folder: () => folder(),
  floppy: () => (
    <g shape-rendering="crispEdges">
      <rect x="5" y="5" width="22" height="22" fill={K} />
      <rect x="6" y="6" width="20" height="20" fill="#303030" />
      <rect x="10" y="6" width="12" height="8" fill={G} />
      <rect x="18" y="7" width="2" height="5" fill="#303030" />
      <rect x="9" y="17" width="14" height="9" fill={W} />
      <rect x="10" y="19" width="12" height="1" fill="#99f" />
      <rect x="10" y="22" width="9" height="1" fill="#99f" />
    </g>
  ),
  drive: () => (
    <g shape-rendering="crispEdges">
      <rect x="3" y="11" width="26" height="12" fill={K} />
      <rect x="4" y="12" width="24" height="10" fill={G} />
      <rect x="4" y="12" width="24" height="1" fill={W} />
      <rect x="6" y="18" width="12" height="1" fill={D} />
      <rect x="23" y="17" width="3" height="2" fill="#0c0" />
    </g>
  ),
  control: () =>
    folder(
      <g shape-rendering="crispEdges">
        <rect x="9" y="17" width="14" height="8" fill={W} stroke={K} stroke-width="1" />
        <rect x="11" y="19" width="10" height="1" fill={D} />
        <rect x="14" y="18" width="2" height="3" fill="#00c" />
        <rect x="11" y="22" width="10" height="1" fill={D} />
        <rect x="18" y="21" width="2" height="3" fill="#c00" />
      </g>,
    ),
  printer: () => (
    <g shape-rendering="crispEdges">
      <rect x="9" y="3" width="14" height="10" fill={W} stroke={K} stroke-width="1" />
      <rect x="3" y="12" width="26" height="12" fill={K} />
      <rect x="4" y="13" width="24" height="10" fill={G} />
      <rect x="4" y="13" width="24" height="1" fill={W} />
      <rect x="9" y="22" width="14" height="7" fill={W} stroke={K} stroke-width="1" />
      <rect x="23" y="16" width="3" height="2" fill="#0c0" />
    </g>
  ),
  windows: () => (
    <>
      <path d="M8 6c3-1.6 5-1.2 7.5 0v8.2c-2.5-1.2-4.5-1.6-7.5 0z" fill="#f33" />
      <path d="M17 6.6c2.5 1.1 4.6 1.4 7.5 0v8.2c-2.9 1.4-5 1.1-7.5 0z" fill="#3c3" />
      <path d="M8 16c3-1.6 5-1.2 7.5 0v8.2c-2.5-1.2-4.5-1.6-7.5 0z" fill="#36f" />
      <path d="M17 16.6c2.5 1.1 4.6 1.4 7.5 0v8.2c-2.9 1.4-5 1.1-7.5 0z" fill="#fc0" />
      <path d="M2 9h4M3 13h3M2 17h4M3 21h3" stroke={K} stroke-width="1.2" opacity=".55" />
    </>
  ),
  network: () => (
    <g shape-rendering="crispEdges">
      <rect x="2" y="4" width="14" height="11" fill={K} />
      <rect x="3" y="5" width="12" height="9" fill="#008080" />
      <rect x="16" y="15" width="14" height="11" fill={K} />
      <rect x="17" y="16" width="12" height="9" fill="#008080" />
      <rect x="8" y="15" width="2" height="7" fill={K} />
      <rect x="8" y="21" width="8" height="2" fill={K} />
    </g>
  ),
  'network-off': () => (
    <>
      <g shape-rendering="crispEdges" opacity=".7">
        <rect x="2" y="4" width="14" height="11" fill={K} />
        <rect x="3" y="5" width="12" height="9" fill={D} />
        <rect x="16" y="15" width="14" height="11" fill={K} />
        <rect x="17" y="16" width="12" height="9" fill={D} />
      </g>
      <path d="M9 9l14 14M23 9L9 23" stroke="#e00" stroke-width="3.5" />
    </>
  ),
  speaker: () => (
    <>
      <path d="M5 12h6l7-6v20l-7-6H5z" fill={G} stroke={K} stroke-width="1.4" />
      <path d="M22 11c2 3 2 7 0 10M25 8c4 5 4 11 0 16" stroke={K} stroke-width="1.6" fill="none" />
    </>
  ),
  error: () => (
    <>
      <circle cx="16" cy="16" r="13" fill="#e00" stroke="#600" stroke-width="1" />
      <path d="M10.5 10.5l11 11M21.5 10.5l-11 11" stroke={W} stroke-width="3.4" />
    </>
  ),
  info: () => (
    <>
      <path d="M4 6h24v16H13l-6 6v-6H4z" fill={W} stroke={K} stroke-width="1.2" />
      <circle cx="16" cy="9.5" r="1.8" fill="#00c" />
      <path d="M16 13v7" stroke="#00c" stroke-width="3" />
    </>
  ),
  warn: () => (
    <>
      <path d="M16 3l14 25H2z" fill="#fd0" stroke={K} stroke-width="1.2" />
      <path d="M16 11v9" stroke={K} stroke-width="3" />
      <circle cx="16" cy="24" r="1.7" fill={K} />
    </>
  ),
  programs: () =>
    folder(
      <g shape-rendering="crispEdges">
        <rect x="11" y="16" width="12" height="9" fill={K} />
        <rect x="12" y="17" width="10" height="7" fill={W} />
        <rect x="12" y="17" width="10" height="2" fill="#000080" />
      </g>,
    ),
  documents: () =>
    folder(
      <g shape-rendering="crispEdges">
        <rect x="12" y="15" width="10" height="12" fill={K} />
        <rect x="13" y="16" width="8" height="10" fill={W} />
        <rect x="14" y="18" width="6" height="1" fill={D} />
        <rect x="14" y="21" width="6" height="1" fill={D} />
      </g>,
    ),
  find: () => (
    <>
      <rect x="6" y="3" width="15" height="20" fill={W} stroke={K} stroke-width="1" />
      <circle cx="18" cy="17" r="6" fill="#bfe3ff" fill-opacity=".7" stroke={K} stroke-width="2" />
      <path d="M22 21l7 7" stroke={K} stroke-width="3" />
    </>
  ),
  help: () => (
    <>
      <path d="M5 5h10c1 0 1 1 1 1v22s0-1-1-1H5z" fill="#6b3fa0" stroke={K} stroke-width="1" />
      <path d="M27 5H17c-1 0-1 1-1 1v22s0-1 1-1h10z" fill="#7b4fb0" stroke={K} stroke-width="1" />
      <text x="21.5" y="21" font-size="12" font-weight="700" font-family="Arial, sans-serif" fill="#ff0" text-anchor="middle">?</text>
    </>
  ),
  run: () => (
    <g shape-rendering="crispEdges">
      <rect x="3" y="6" width="26" height="20" fill={K} />
      <rect x="4" y="7" width="24" height="18" fill={G} />
      <rect x="4" y="7" width="24" height="3" fill="#000080" />
      <rect x="7" y="15" width="18" height="4" fill={W} />
    </g>
  ),
  media: () => (
    <>
      <g shape-rendering="crispEdges">
        <rect x="3" y="4" width="26" height="24" fill={K} />
        <rect x="4" y="5" width="24" height="22" fill={G} />
        <rect x="4" y="5" width="24" height="4" fill="#000080" />
        <rect x="6" y="11" width="20" height="14" fill={W} />
      </g>
      <path d="M14 22V14l8-2v8" fill="none" stroke={K} stroke-width="1.8" />
      <ellipse cx="12" cy="22" rx="2.6" ry="1.9" fill={K} />
      <ellipse cx="20" cy="20" rx="2.6" ry="1.9" fill={K} />
    </>
  ),
  shutdown: () => (
    <g shape-rendering="crispEdges">
      <rect x="4" y="3" width="24" height="18" fill={K} />
      <rect x="5" y="4" width="22" height="16" fill={G} />
      <rect x="7" y="6" width="18" height="12" fill="#000030" />
      <rect x="18" y="8" width="3" height="3" fill="#ffd" />
      <rect x="10" y="13" width="1" height="1" fill={W} />
      <rect x="14" y="9" width="1" height="1" fill={W} />
      <rect x="6" y="23" width="20" height="5" fill={K} />
      <rect x="7" y="24" width="18" height="3" fill={G} />
    </g>
  ),
}

export const Icon = (props: { name: IconName; size?: number; class?: string }) => {
  const size = props.size ?? 32
  return (
    <svg class={props.class} width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      {ART[props.name]()}
    </svg>
  )
}
