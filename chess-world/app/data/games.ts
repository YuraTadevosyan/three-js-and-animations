/**
 * Cinema fixtures.
 *
 * Games are stored as SAN token lists and replayed through the same move
 * generator the interactive board uses. `npm run check:games` replays every
 * one of them at build time, so a wrong token is a failed check rather than a
 * replay that dead-ends halfway through.
 */
export interface CinemaGame {
  id: string
  title: string
  white: string
  black: string
  event: string
  year: number
  result: 'checkmate' | 'resignation'
  /** One line on why this game is worth watching. */
  blurb: string
  /** Moments the camera lingers on, keyed by ply (1-based). */
  highlights: { ply: number; note: string }[]
  moves: string[]
}

const split = (pgn: string): string[] =>
  pgn
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\d+\.(\.\.)?/g, ' ')
    .replace(/\s+(1-0|0-1|1\/2-1\/2|\*)\s*$/, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

export const CINEMA_GAMES: CinemaGame[] = [
  {
    id: 'immortal',
    title: 'The Immortal Game',
    white: 'Adolf Anderssen',
    black: 'Lionel Kieseritzky',
    event: 'London',
    year: 1851,
    result: 'checkmate',
    blurb:
      'Anderssen gives away a bishop, both rooks and the queen, and mates with the three minor pieces he has left.',
    highlights: [
      { ply: 35, note: 'Both rooks are hanging. Anderssen ignores them.' },
      { ply: 43, note: 'The queen goes too — 22.Qf6+.' },
      { ply: 45, note: 'Mate by a bishop, with three pieces on the board.' },
    ],
    moves: split(`1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6
      7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6
      13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1
      19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0`),
  },
  {
    id: 'opera',
    title: 'The Opera Game',
    white: 'Paul Morphy',
    black: 'Duke of Brunswick & Count Isouard',
    event: 'Paris Opera House',
    year: 1858,
    result: 'checkmate',
    blurb:
      'Played in a theatre box during a performance of Norma. Every piece Morphy develops goes straight at the king.',
    highlights: [
      { ply: 19, note: '10.Nxb5 — the knight is poisoned, and the file opens.' },
      { ply: 25, note: '13.Rxd7 clears the last defender.' },
      { ply: 31, note: '16.Qb8+!! and mate next move.' },
    ],
    moves: split(`1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6
      7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8
      13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`),
  },
  {
    id: 'evergreen',
    title: 'The Evergreen Game',
    white: 'Adolf Anderssen',
    black: 'Jean Dufresne',
    event: 'Berlin',
    year: 1852,
    result: 'checkmate',
    blurb:
      'Black is a rook up and threatening mate. Anderssen answers with a queen sacrifice and a bishop that mates from two squares.',
    highlights: [
      { ply: 37, note: '19...Qxf3 — Black threatens mate on g2.' },
      { ply: 41, note: '21.Qxd7+!! The king is dragged into the open.' },
      { ply: 47, note: '24.Bxe7#.' },
    ],
    moves: split(`1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4
      7. O-O d3 8. Qb3 Qf6 9. e5 Qg6 10. Re1 Nge7 11. Ba3 b5 12. Qxb5 Rb8
      13. Qa4 Bb6 14. Nbd2 Bb7 15. Ne4 Qf5 16. Bxd3 Qh5 17. Nf6+ gxf6 18. exf6 Rg8
      19. Rad1 Qxf3 20. Rxe7+ Nxe7 21. Qxd7+ Kxd7 22. Bf5+ Ke8 23. Bd7+ Kf8
      24. Bxe7# 1-0`),
  },
  {
    id: 'reti-tartakower',
    title: 'Réti — Tartakower',
    white: 'Richard Réti',
    black: 'Savielly Tartakower',
    event: 'Vienna',
    year: 1910,
    result: 'checkmate',
    blurb: 'Eleven moves. The queen sacrifice on move nine is one of the shortest famous mates ever played.',
    highlights: [
      { ply: 17, note: '9.Qd8+!! — the queen offers itself to open the file.' },
      { ply: 21, note: '11.Rd8# — mate delivered by the rook that was never developed.' },
    ],
    moves: split(`1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nf6 5. Qd3 e5 6. dxe5 Qa5+
      7. Bd2 Qxe5 8. O-O-O Nxe4 9. Qd8+ Kxd8 10. Bg5+ Ke8 11. Rd8# 1-0`),
  },
  {
    id: 'game-of-the-century',
    title: 'The Game of the Century',
    white: 'Donald Byrne',
    black: 'Bobby Fischer',
    event: 'Rosenwald Trophy, New York',
    year: 1956,
    result: 'checkmate',
    blurb: 'Fischer, thirteen years old, gives up his queen on move seventeen and is winning anyway.',
    highlights: [
      { ply: 33, note: '17...Be6!! — the queen is offered and cannot be taken safely.' },
      { ply: 35, note: '18.Bxb6 Bxc4+ — the windmill begins.' },
      { ply: 81, note: '41...Rc2# — a mate delivered with two bishops and a rook.' },
    ],
    moves: split(`1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4
      7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3
      13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6
      18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+
      23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1
      29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7
      35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+
      41. Kc1 Rc2# 0-1`),
  },
  {
    id: 'kasparov-topalov',
    title: "Kasparov's Immortal",
    white: 'Garry Kasparov',
    black: 'Veselin Topalov',
    event: 'Hoogovens, Wijk aan Zee',
    year: 1999,
    result: 'resignation',
    blurb:
      'A rook sacrifice on move 24 drags the black king from b6 all the way to c3, hunted the entire width of the board.',
    highlights: [
      { ply: 47, note: '24.Rxd4!! — the sacrifice that starts the hunt.' },
      { ply: 51, note: '26.Qxd4+ Kxa5 — the king leaves home for good.' },
      { ply: 65, note: '33.c3+ Kxc3 — seven ranks from where it started.' },
    ],
    moves: split(`1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7
      8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O
      14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5
      20. Qf4+ Ka7 21. Rhe1 d4 22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6
      26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 Qc4 31. Qxf6 Kxa3
      32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2 35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7
      38. Bxc4 bxc4 39. Qxh8 Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2
      44. Qa7 1-0`),
  },
]

export const CINEMA_BY_ID = new Map(CINEMA_GAMES.map((game) => [game.id, game]))
