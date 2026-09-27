import { $, component$, useStore, useVisibleTask$ } from '@builder.io/qwik'
import {
  MINES,
  chord,
  count,
  exposeMines,
  flagsPlaced,
  hasWon,
  isFlag,
  isMine,
  isOpen,
  newBoard,
  plant,
  reveal,
  toggleFlag,
  type GameState,
} from './mines'

/** Seven-segment paths in a 13×23 box. */
const SEG: Record<string, string> = {
  a: 'M2 1h9l-2 2H4z',
  b: 'M12 2v9l-2-1V4z',
  c: 'M12 12.5v9l-2-2v-6z',
  d: 'M2 22h9l-2-2H4z',
  e: 'M1 12.5v9l2-2v-6z',
  f: 'M1 2v9l2-1V4z',
  g: 'M2.2 11.5l1.8-1h5l1.8 1-1.8 1H4z',
}
const DIGITS: Record<string, string> = {
  '0': 'abcdef',
  '1': 'bc',
  '2': 'abged',
  '3': 'abgcd',
  '4': 'fgbc',
  '5': 'afgcd',
  '6': 'afgedc',
  '7': 'abc',
  '8': 'abcdefg',
  '9': 'abcdfg',
  '-': 'g',
}

const Digits = (props: { value: number; label: string }) => {
  const v = Math.max(-99, Math.min(999, props.value))
  const text = v < 0 ? `-${String(-v).padStart(2, '0')}` : String(v).padStart(3, '0')
  return (
    <div class="ms-digits" role="img" aria-label={`${props.label}: ${v}`}>
      {text.split('').map((ch, i) => (
        <svg key={i} width="13" height="23" viewBox="0 0 13 23" aria-hidden="true">
          {Object.entries(SEG).map(([k, d]) => (
            <path key={k} d={d} fill={DIGITS[ch]?.includes(k) ? '#ff0000' : '#400000'} />
          ))}
        </svg>
      ))}
    </div>
  )
}

const Face = (props: { kind: 'smile' | 'wow' | 'cool' | 'dead' }) => (
  <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true">
    <circle cx="8.5" cy="8.5" r="7.5" fill="#ff0" stroke="#000" />
    {props.kind === 'dead' ? (
      <path d="M4.5 4.5l2 2m0-2l-2 2M10.5 4.5l2 2m0-2l-2 2M5 12.5c2-2 5-2 7 0" stroke="#000" fill="none" />
    ) : props.kind === 'cool' ? (
      <path d="M3 6h11v1l-1 2H10L9 7H8L7 9H4L3 7zM5.5 11.5c2 1.5 4 1.5 6 0" stroke="#000" fill="#000" stroke-linejoin="round" />
    ) : (
      <>
        <rect x="5" y="5" width="2" height="2" />
        <rect x="10" y="5" width="2" height="2" />
        {props.kind === 'wow' ? <circle cx="8.5" cy="11.5" r="1.8" fill="none" stroke="#000" /> : <path d="M5 10.5c2 2 5 2 7 0" stroke="#000" fill="none" />}
      </>
    )}
  </svg>
)

const NUM_COLORS = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080']

export const Minesweeper = component$(() => {
  const game = useStore({
    board: newBoard(),
    state: 'ready' as GameState,
    time: 0,
    boom: -1,
    pressing: false,
    downAt: 0,
  })

  // The clock runs only while a game is in progress.
  useVisibleTask$(({ track, cleanup }) => {
    track(() => game.state)
    if (game.state !== 'playing') return
    const id = window.setInterval(() => {
      game.time = Math.min(999, game.time + 1)
    }, 1000)
    cleanup(() => window.clearInterval(id))
  })

  const reset = $(() => {
    game.board = newBoard()
    game.state = 'ready'
    game.time = 0
    game.boom = -1
  })

  const act = $((i: number, flag: boolean) => {
    if (game.state === 'won' || game.state === 'lost') return
    const b = game.board
    if (flag) {
      toggleFlag(b, i)
      return
    }
    if (isFlag(b[i])) return
    if (game.state === 'ready') {
      plant(b, i)
      game.state = 'playing'
      game.time = 1
    }
    const boom = isOpen(b[i]) ? chord(b, i) : reveal(b, i)
    if (boom) {
      game.state = 'lost'
      game.boom = isMine(b[i]) ? i : b.findIndex((c) => isMine(c) && isOpen(c))
      exposeMines(b, false)
    } else if (hasWon(b)) {
      game.state = 'won'
      exposeMines(b, true)
    }
  })

  const face = game.state === 'lost' ? 'dead' : game.state === 'won' ? 'cool' : game.pressing ? 'wow' : 'smile'
  const over = game.state === 'lost' || game.state === 'won'

  return (
    <div class="ms">
      <div class="ms-head">
        <Digits value={MINES - flagsPlaced(game.board)} label="Mines left" />
        <button type="button" class="ms-face" aria-label="New game" onClick$={reset}>
          <Face kind={face} />
        </button>
        <Digits value={game.time} label="Seconds" />
      </div>
      <div class="ms-grid" role="grid" aria-label="Minefield" preventdefault:contextmenu onContextMenu$={() => {}}>
        {game.board.map((c, i) => {
          const open = isOpen(c)
          const wrongFlag = game.state === 'lost' && isFlag(c) && !isMine(c)
          let label = 'Hidden'
          if (open) label = isMine(c) ? 'Mine' : count(c) ? String(count(c)) : 'Empty'
          else if (isFlag(c)) label = 'Flagged'
          return (
            <button
              key={i}
              type="button"
              class={['ms-cell', open && 'open', i === game.boom && 'boom']}
              style={open && !isMine(c) && count(c) ? { color: NUM_COLORS[count(c)] } : undefined}
              aria-label={label}
              disabled={over && !open}
              onPointerDown$={(e) => {
                if (e.button === 0) game.pressing = true
                game.downAt = e.timeStamp
              }}
              onPointerUp$={(e) => {
                game.pressing = false
                // Right button, or a long press on touch, plants a flag.
                const long = e.pointerType !== 'mouse' && e.timeStamp - game.downAt > 380
                act(i, e.button === 2 || long)
              }}
              onPointerLeave$={() => {
                game.pressing = false
              }}
            >
              {wrongFlag ? (
                <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
                  <circle cx="6.5" cy="6.5" r="4" />
                  <path d="M1 1l11 11M12 1L1 12" stroke="#f00" stroke-width="1.6" />
                </svg>
              ) : open && isMine(c) ? (
                <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
                  <path d="M6.5 0v13M0 6.5h13M2 2l9 9M11 2l-9 9" stroke="#000" />
                  <circle cx="6.5" cy="6.5" r="4" />
                  <rect x="4.5" y="4.5" width="1.6" height="1.6" fill="#fff" />
                </svg>
              ) : !open && isFlag(c) ? (
                <svg width="11" height="12" viewBox="0 0 11 12" aria-hidden="true">
                  <path d="M6 1v7" stroke="#000" />
                  <path d="M6 1L1.5 3.5 6 6z" fill="#f00" />
                  <path d="M3 9h6v1H2v1h8" stroke="#000" fill="none" />
                </svg>
              ) : open && count(c) ? (
                count(c)
              ) : null}
            </button>
          )
        })}
      </div>
      <p class="ms-hint">{game.state === 'won' ? 'You won! It taught a generation to use a mouse.' : 'Right-click or long-press to flag.'}</p>
    </div>
  )
})
