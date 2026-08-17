# dna-visualization — *Scale*

A scroll-driven descent through nine biological scales, from living tissue down
to hydrogen bonds and back out to the network a single gene holds together.

**Live:** <https://yuratadevosyan.github.io/three-js-and-animations/dna-visualization/>

Built with **Angular 21** (standalone, zoneless, signals) over a **hand-written
WebGL2 / GLSL ES 3.00 renderer**. No 3D engine, no math library, no model files,
no textures, no audio, no network calls. Every vertex, every curve and every
pixel of the atlas the labels are drawn from is generated at runtime.

---

## The journey

Scrolling moves one continuous parameter. Neighbouring scales overlap and
crossfade, so there is never a cut between them — the scale you are falling
into is drawn behind the one you are leaving, which is what sells the dive.

| # | Scale | What it shows |
| --- | --- | --- |
| 01 | Tissue · 10⁻³ m | A drifting field of cells, membranes displaced by simplex noise |
| 02 | Cell · 10⁻⁵ m | Mitochondria, vesicles, cytoskeleton, and the nucleus at the centre |
| 03 | Nucleus · 10⁻⁶ m | 23 chromosome territories, chromatin fibres, nuclear pore complexes |
| 04 | Chromatin · 10⁻⁸ m | A condensed higher-order coil releasing into beads-on-a-string |
| 05 | Double helix · 10⁻⁹ m | B-DNA carrying a real coding sequence, with major and minor grooves |
| 06 | Base pairs · 10⁻¹⁰ m | Atomic detail: ring systems, element colours, hydrogen bonds |
| 07 | Transcription · 10⁻⁹ m | A polymerase opening a bubble and laying down RNA |
| 08 | Translation · 10⁻⁹ m | The ribosome reading codons; the chain leaving the tunnel and folding |
| 09 | Connections · 10⁻⁸ m | The p53 interaction network, with its negative feedback loop |

Each scale is a deep link: `#helix`, `#basepairs`, `#interactome`, and so on.
The rail down the left edge navigates; arrow keys and Page Up/Down work because
the journey is driven by real document scroll rather than a hijacked wheel.

---

## What is real, and what is not

The visualisation is stylised, but the biology driving it is not decorative.

**Real:**

- The **standard genetic code** — all 64 codons, used to translate the sequence.
- **B-DNA helical parameters**: 3.4 Å rise per base pair, 10.5 bp per turn, a
  20 Å duplex, and the ~225°/135° angular offset between the two backbones that
  carves the major and minor grooves.
- **Base-pairing chemistry**: A–T across two hydrogen bonds, G–C across three,
  purines always facing pyrimidines. The specific atoms making each bond are the
  correct ones (N6–O4 and N1–N3 for A–T; O6–N4, N1–N3 and N2–O2 for G–C).
- **Ring topology**: purines are a fused six + five ring system, pyrimidines a
  single six ring, with nitrogen, carbon and oxygen placed at the right vertices
  and the sugar attached at N9 or N1.
- **Nucleosome packing**: 147 base pairs, 1.65 turns per histone octamer.
- **The p53 network**: every edge in the final scale is a documented interaction,
  including the MDM2 loop where p53 transcribes the ligase that destroys it.
- **p53 residues 1–60**, the transactivation domain, with its real secondary
  structure — intrinsically disordered apart from the amphipathic helix at
  residues 17–29, whose F19/W23/L26 face is the MDM2 binding site.
- **Kyte–Doolittle hydropathy** and side-chain classes, driving residue colour.

**Idealised — stated plainly because it matters:**

- The **nucleotide sequence is not the genomic TP53 sequence.** It is a reverse
  translation of the real p53 peptide using the most-frequent human codon for
  each residue. The codons on screen genuinely encode the real p53 residues under
  the real genetic code; they are simply not the exact bases on chromosome 17.
- **Atomic coordinates are constructed, not measured.** Rings are built as
  regular polygons at a uniform 1.39 Å bond length and then positioned so the
  hydrogen-bonding atoms land the right distance apart. No crystal structure is
  used, because the project ships no data files.
- The **folded conformation** is a plausible compact fold with correct α-helix
  geometry and Cα spacing, not a solved structure.
- Organelle counts, cell shapes and territory positions are artistic.

---

## Rendering architecture

```
src/app/
├── bio/            the data everything is derived from
│   ├── sequence.ts   genetic code, hydropathy, B-DNA constants, p53 peptide
│   ├── bases.ts      procedural nucleobase ring systems and pair assembly
│   └── fold.ts       Cα traces for the folded and extended chain
├── gl/             the renderer — no dependencies at all
│   ├── math.ts       mat4 / vec3, column-major, ~250 lines
│   ├── program.ts    shader compilation with windowed, line-numbered errors
│   ├── geometry.ts   icosphere, cylinder, torus, box, tube templates
│   ├── mesh.ts       VAO + instanced attribute buffers
│   ├── targets.ts    HDR render targets with capability probing
│   ├── chunks.ts     shared GLSL: simplex noise, curl, shading, B-DNA curve
│   ├── molecule.ts   instanced atoms and bonds
│   ├── particles.ts  additive billboards, motion entirely in the vertex shader
│   ├── labels.ts     canvas-rasterised text atlas, billboarded
│   ├── post.ts       bloom pyramid, depth of field, ACES grade
│   └── renderer.ts   the frame loop, crossfade and adaptive quality
└── stages/         one file per scale
```

A few decisions worth naming:

**The camera never moves between scales.** Each stage scales and translates its
own content past a fixed lens. Two scales can therefore be on screen at once
without any camera interpolation to go wrong, and float precision stays sane
whether the frame holds a millimetre of tissue or an ångström of hydrogen bond.
Each stage also gets its own depth clear, since they occupy the same world space
at wildly different sizes.

**Curves are evaluated on the GPU.** The helix, the chromatin fibre and the
transcription bubble are closed-form functions in GLSL, shared between the
shaders that need them. Unwinding a chromosome or opening a transcription bubble
is a uniform changing — no vertex buffer is ever rewritten, which is where the
smoothness comes from.

**Bloom is a downsample/upsample pyramid**, not a single blur: a soft-knee
prefilter, a 13-tap downsample chain, then a 9-tap tent upsample accumulated
back up. Filtering on the way down *and* the way up is what stops the glow
ringing where a bright base pair meets black.

**Change detection is signal-only.** There is no zone.js in the bundle. The
render loop runs on its own `requestAnimationFrame` and writes to signals only
when a displayed number would actually move, so a 60 fps scene does not imply
60 change-detection passes.

**Quality adapts in two stages** — instance density first, then resolution —
dropping fast and recovering slowly, so one hitch doesn't permanently degrade
the image but a sustained stall gets relief within about a second.

WebGL context loss is handled: the renderer tears down, rebuilds lazily on
restore, and reports a readable message if WebGL2 is unavailable at all.

---

## Local development

```bash
npm install
npm run dev        # http://localhost:4210
npm run build      # production build → dist/
npm run typecheck  # tsc, no emit
npm run check:glsl # static analysis of the embedded shaders
```

### `check:glsl`

Nothing in a normal build validates GLSL — a shader that fails to compile is a
runtime error, usually presenting as a black screen. `tools/glslcheck.mjs`
extracts every `/* glsl */` template, resolves the `${CHUNK}` composition the
way the app does, and checks each of the 37 resulting programs for undeclared
uniforms and varyings, calls to undefined functions, `out` varyings that are
never written, VS/FS varying mismatches, and identifiers that collide with GLSL
reserved words. It caught three real bugs while this was being written,
including a `vec3 flat` (reserved as an interpolation qualifier) that would have
failed to compile on every device.

### A note on versions

This app pins **TypeScript 5.9** rather than the 6.x its sibling apps use:
`@angular/build@21` declares a peer range of `typescript >=5.9 <6.0`, which is
tighter than `@angular/compiler-cli`'s own `<6.1`.

It also stays on **Angular 21** rather than 22. Angular 22 requires Node
`^22.22.3 || ^24.15.0 || >=26`, and this machine runs Node 20.19.5. Angular 21
supports `^20.19.0`, so it is the newest major that will actually run here —
bumping Node is the prerequisite for moving to 22.

## Deploying

```bash
npm run deploy     # builds, then publishes dist/ to gh-pages under /dna-visualization
```

## Browser support

Requires WebGL2. Half-float render targets are used when
`EXT_color_buffer_half_float` is available and the renderer falls back to RGBA8
without them, losing highlight headroom but nothing else. Tested targets are
current Chrome, Edge, Firefox and Safari with hardware acceleration enabled.
