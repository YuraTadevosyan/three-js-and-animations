/**
 * Move-generation conformance test.
 *
 * Perft counts the leaf nodes of the legal move tree to a given depth. The
 * expected numbers below are the published values for the standard test
 * positions, so any mistake in castling, en passant, promotion or pin handling
 * shows up as a mismatched count rather than as a weird move in the UI.
 *
 *     npm run check:perft
 */
import { generateMoves, isLegal } from '../app/game/movegen'
import { Position } from '../app/game/position'
import { fromSan, toSan } from '../app/game/san'
import { STARTING_FEN, moveToUci } from '../app/game/types'

function perft(pos: Position, depth: number): number {
  if (depth === 0) return 1
  let nodes = 0
  for (const move of generateMoves(pos)) {
    if (!isLegal(pos, move)) continue
    if (depth === 1) {
      nodes++
      continue
    }
    pos.makeMove(move)
    nodes += perft(pos, depth - 1)
    pos.unmakeMove()
  }
  return nodes
}

interface Case {
  name: string
  fen: string
  expected: number[]
}

const CASES: Case[] = [
  { name: 'startpos', fen: STARTING_FEN, expected: [20, 400, 8902, 197281, 4865609] },
  {
    name: 'kiwipete',
    fen: 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
    expected: [48, 2039, 97862, 4085603],
  },
  {
    name: 'endgame (position 3)',
    fen: '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',
    expected: [14, 191, 2812, 43238, 674624],
  },
  {
    name: 'promotions (position 4)',
    fen: 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
    expected: [6, 264, 9467, 422333],
  },
  {
    name: 'position 5',
    fen: 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',
    expected: [44, 1486, 62379, 2103487],
  },
  {
    name: 'position 6',
    fen: 'r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10',
    expected: [46, 2079, 89890],
  },
]

let failures = 0

for (const testCase of CASES) {
  for (let depth = 1; depth <= testCase.expected.length; depth++) {
    const pos = Position.fromFen(testCase.fen)
    const started = Date.now()
    const nodes = perft(pos, depth)
    const want = testCase.expected[depth - 1]!
    const elapsed = Date.now() - started
    const ok = nodes === want
    if (!ok) failures++
    const rate = elapsed > 0 ? ` ${Math.round(nodes / elapsed)}k nps` : ''
    console.log(
      `${ok ? '  ok  ' : ' FAIL '} ${testCase.name} d${depth}  ${nodes}${ok ? '' : ` (expected ${want})`}${rate}`,
    )
    // A correct perft also implies make/unmake restored the position exactly.
    if (pos.toFen() !== testCase.fen) {
      failures++
      console.log(` FAIL  ${testCase.name} d${depth} did not restore the position: ${pos.toFen()}`)
    }
  }
}

/* ---- SAN and FEN round trips over a full random-ish game --------------- */

function sanRoundTrip(): void {
  const pos = Position.fromFen()
  let seed = 12345
  const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)
  for (let ply = 0; ply < 240; ply++) {
    const legal = generateMoves(pos).filter((m) => isLegal(pos, m))
    if (legal.length === 0) break
    const move = legal[Math.floor(rand() * legal.length)]!
    const san = toSan(pos, move)
    const parsed = fromSan(pos, san)
    if (parsed !== move) {
      failures++
      console.log(` FAIL  san round trip: ${san} parsed back as ${parsed ? moveToUci(parsed) : 'null'}`)
      return
    }
    const fen = pos.toFen()
    if (Position.fromFen(fen).toFen() !== fen) {
      failures++
      console.log(` FAIL  fen round trip: ${fen}`)
      return
    }
    pos.makeMove(move)
  }
  console.log('  ok   san + fen round trip over a 240-ply game')
}

sanRoundTrip()

if (failures) {
  console.error(`\n${failures} failure(s)`)
  process.exit(1)
}
console.log('\nall move generation checks passed')
