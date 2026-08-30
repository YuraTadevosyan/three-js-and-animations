# chess-world

**Interactive Chess World** — a chess game where nothing slides politely from
square to square. Knights crouch, somersault over the corner of their L and land
hard enough to shake the camera. Queens do not travel at all: they come apart
into a column of sparks and reassemble on the far square. Rooks charge behind a
shockwave, bishops streak down the diagonal on a beam of light, captured pieces
are torn into a few hundred particles, and a mated king topples over.

**Live:** <https://yuratadevosyan.github.io/three-js-and-animations/chess-world/>

## Stack

| | |
| --- | --- |
| Framework | [Nuxt 4](https://nuxt.com/) (SPA, prerendered shell, `github-pages` Nitro preset) |
| Engine | [PlayCanvas 2](https://playcanvas.com/) — engine-only, no editor, no scene files |
| Chess | Hand-written: 0x88 board, legal move generation, SAN, alpha-beta search in a Web Worker |
| Audio | Web Audio API, synthesised per event |
| Build | Vite 8, TypeScript 5.9, Tailwind v3 |

Both are new to this repo: Nuxt is the first Nuxt app here, and PlayCanvas the
first entity-component 3D engine (after three.js, Babylon, OGL and raw WebGL2).

**No binary assets.** Every piece is a surface of revolution generated at boot,
the knight's head is an extruded silhouette, the floor grid is drawn to a canvas,
the particles are one dynamic mesh of camera-facing quads, and every sound is
oscillators and filtered noise.

## The choreography

| Piece | What it does |
| --- | --- |
| Pawn | A short hop with squash and stretch, and a puff of light on landing |
| Knight | Crouches, then a full somersault along a Bézier bent through the corner of the L — 1.55 units of air, a shockwave and a camera shake on landing |
| Bishop | Rises, spins up, and streaks down the diagonal behind a beam, spinning faster the further it goes |
| Rook | Rocks back, then charges on an exponential ease with a wide beam and a heavy bounce at the end |
| Queen | Draws light in, dissolves into a rising column of particles, crosses as a line of light, and rematerialises with an elastic snap |
| King | Walks — slower, with a guard turn. Castling sends the rook arcing over him to arrive at the same moment |
| Any capture | The victim stretches, tears apart into ~150 sparks, and lights the board as it goes |
| Promotion | The pawn rises spinning, bursts, and the new piece scales up out of the flash |
| Check / mate | A red ring and a push-in on the king; on mate he falls over |

The camera reads the move before it plays: it swings to look *across* the path
rather than down it, drops lower and closer the more dramatic the move is, and
drifts back to the wide view when the board goes quiet. Follow, Cinema (adds a
slow drift) and Manual are the three modes.

## Two modes

**Play** — a full game against the engine at three strengths, or hotseat. Legal
moves are highlighted on the board, with undo, a hint, a promotion picker, a
captured-material tray and the engine's depth / evaluation / node count as it
thinks.

**Cinema** — six famous games replayed with the full choreography: the Immortal
Game, the Opera Game, the Evergreen Game, Réti–Tartakower, the Game of the
Century and Kasparov–Topalov 1999. Play, pause, step, scrub, four speeds, and a
note at the moments worth pausing on.

## The chess engine

No chess library. `app/game/` is:

- `position.ts` — 0x88 board, make/unmake, Zobrist hashing (two 32-bit halves,
  because JavaScript bitwise ops are 32-bit), attack detection, repetition and
  insufficient-material rules
- `movegen.ts` — pseudo-legal generation plus a legality filter, including
  castling through attacked squares, en passant and under-promotion
- `san.ts` — SAN with correct disambiguation, and a tolerant SAN parser
- `eval.ts` — material, piece-square tables tapered by game phase, pawn
  structure, bishop pair, rook files
- `search.ts` — iterative deepening, alpha-beta, transposition table, killers,
  history heuristic, null-move pruning, late-move reductions, quiescence with
  delta pruning, mate-distance pruning
- `engine.worker.ts` — the search off the main thread, so a 1.8-second think
  never stutters an animation

Move generation is verified by perft against the six standard test positions:

| Position | Depth | Nodes |
| --- | --- | --- |
| Start position | 5 | 4,865,609 |
| Kiwipete | 4 | 4,085,603 |
| Endgame (position 3) | 5 | 674,624 |
| Promotions (position 4) | 4 | 422,333 |
| Position 5 | 4 | 2,103,487 |
| Position 6 | 3 | 89,890 |

`npm run check` runs those, replays every Cinema game through the move generator
(so a mistyped SAN token fails the build, not the replay), and asserts the search
finds a set of forced mates and tactics. It also checks the parts that have no
business being verified by eye:

| Check | What it catches |
| --- | --- |
| `check:geometry` | Face winding. Back-face culling means geometry wound the wrong way is simply not there — this computes every triangle's normal and asserts it points outward, or up for anything lying on the board. |
| `check:ui` | The click → select → move → capture → undo path, and drag-and-drop, driven against a stub renderer. |
| `check:world` | The whole world on PlayCanvas's null device: every piece type's choreography, castling, promotion, a replay, every palette. It also audits the scene for mesh instances left pointing at freed meshes. |
| `check:cinema` | Cinema playback end to end — load a game, press play, pause, seek — with a frame pump standing in for the browser. |

## Colours

Settings → **Colours**. Six built-in palettes (Neon Arena, Ember, Jade, Arctic,
Royal, Monochrome), or set your own with six pickers: the two armies, the two
square colours, the board glow and the background.

Only those six are chosen. Everything else is derived from them — piece bodies
are the army colour mixed towards white or black, sparks and rim lights take the
army hue, the board frame comes from the dark squares, and the fog and ambient
light come from the background — so a palette stays coherent whatever you pick.
Repainting happens in place: no material is rebuilt, nothing on the board moves,
and it is safe mid-animation. Your choice is remembered between visits.

## Controls

| | |
| --- | --- |
| Orbit | Drag the board |
| Zoom | Scroll, or pinch |
| Select / move | Drag a piece, or click it and click a highlighted square |
| Modes | Play / Cinema in the top bar; colours, camera, sound and quality under Settings |

## Running it

**Requires Node 22.12+.** Nuxt 4.5 uses `Set.prototype.difference`, which Node 20
does not have — the build fails with `trustedFunctions.difference is not a
function` on older runtimes. There is an `.nvmrc`:

```bash
nvm use                       # 22.22.3
npm install --legacy-peer-deps
npm run dev
```

`--legacy-peer-deps` is needed because npm 10.8's peer-set resolver crashes on
this dependency graph (`Cannot read properties of null (reading 'edgesOut')`).
It is an npm bug, not a real peer conflict.

```bash
npm run check       # typecheck + perft + engine/fixture tests
npm run build       # static SPA into .output/public
npm run deploy      # publishes to the gh-pages chess-world/ subfolder
```

The build writes its assets to `assets/` rather than Nuxt's default `_nuxt/`,
because GitHub Pages runs Jekyll and Jekyll refuses to serve any path starting
with an underscore. Each app here deploys into its own subfolder of one shared
branch, so a root-level `.nojekyll` is not an option.
