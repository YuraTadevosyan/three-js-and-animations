/**
 * Validates the engine's tactics and the Cinema fixtures.
 *
 * Every game shipped in Cinema mode is replayed here move by move through the
 * real move generator, so a mistyped SAN token fails the build instead of
 * dead-ending the replay in the browser.
 *
 *     npm run check:games
 */
import { CINEMA_GAMES } from '../app/data/games'
import { ChessGame } from '../app/game/game'
import { Position } from '../app/game/position'
import { findBestMove } from '../app/game/search'
import { moveFrom, movePromotion, moveTo, moveToUci } from '../app/game/types'

let failures = 0

for (const game of CINEMA_GAMES) {
  const chess = new ChessGame()
  let ply = 0
  let failed = false
  for (const san of game.moves) {
    const record = chess.playSan(san)
    if (!record) {
      failures++
      failed = true
      console.log(` FAIL  ${game.title}: illegal move "${san}" at ply ${ply + 1} (${chess.fen})`)
      break
    }
    if (record.san.replace(/[+#]/g, '') !== san.replace(/[+#]/g, '')) {
      failures++
      failed = true
      console.log(` FAIL  ${game.title}: "${san}" re-rendered as "${record.san}" at ply ${ply + 1}`)
      break
    }
    ply++
  }
  if (failed) continue

  const status = chess.status()
  const expectedMate = game.result === 'checkmate'
  if (expectedMate && status.outcome !== 'checkmate') {
    failures++
    console.log(` FAIL  ${game.title}: expected checkmate, got ${status.outcome ?? 'a game still in progress'}`)
    continue
  }
  console.log(`  ok   ${game.title} — ${ply} plies${status.outcome ? `, ${status.outcome}` : ''}`)
}

/* ---- the search has to actually find forced mates ---------------------- */

interface Tactic {
  name: string
  fen: string
  expect: string[]
  depth: number
}

const TACTICS: Tactic[] = [
  { name: 'back rank mate in 1', fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1', expect: ['a1a8'], depth: 3 },
  {
    name: "Legal's mate in 1",
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    expect: ['f3f7'],
    depth: 3,
  },
  {
    name: 'smothered mate in 2',
    fen: '6rk/6pp/8/6N1/8/8/8/6QK w - - 0 1',
    expect: ['g1d4', 'g5f7'],
    depth: 5,
  },
  {
    name: 'takes the hanging queen',
    fen: 'rnb1kbnr/pppp1ppp/8/4p3/6q1/5P2/PPPPP1PP/RNBQKBNR w KQkq - 0 1',
    expect: ['f3g4'],
    depth: 4,
  },
  {
    name: 'declines a poisoned pawn',
    fen: 'rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3',
    expect: ['f3e5', 'e4d5'],
    depth: 4,
  },
]

for (const tactic of TACTICS) {
  const position = Position.fromFen(tactic.fen)
  const info = findBestMove(position, { depth: tactic.depth, timeMs: 4000, randomness: 0, seed: 7 })
  const uci = info ? moveToUci(info.move) : 'none'
  if (!info || !tactic.expect.includes(uci)) {
    failures++
    console.log(` FAIL  ${tactic.name}: played ${uci}, expected one of ${tactic.expect.join(', ')}`)
  } else {
    const mate = info.mateIn ? `, mate in ${info.mateIn}` : ''
    console.log(`  ok   ${tactic.name} — ${uci} at depth ${info.depth} (${info.nodes} nodes${mate})`)
  }
}

/* ---- a full self-play game must terminate cleanly ---------------------- */

{
  const chess = new ChessGame()
  let plies = 0
  while (!chess.status().over && plies < 300) {
    const info = findBestMove(chess.position, { depth: 3, timeMs: 200, randomness: 40, seed: 1234 + plies })
    if (!info) break
    const move = chess.find(moveFrom(info.move), moveTo(info.move), movePromotion(info.move))
    if (!move) {
      failures++
      console.log(` FAIL  self-play: engine returned a move the game rejected at ply ${plies}`)
      break
    }
    chess.play(move)
    plies++
  }
  const status = chess.status()
  console.log(`  ok   self-play reached ${status.outcome ?? 'the ply limit'} after ${plies} plies`)
}

if (failures) {
  console.error(`\n${failures} failure(s)`)
  process.exit(1)
}
console.log('\nall engine and fixture checks passed')
