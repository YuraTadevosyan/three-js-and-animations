# interactive-museum

A portfolio you **walk through** instead of scroll.

Six rooms in a chain — Entrance, Experience, Projects, Career, Skills, Contact —
each with its own lighting rig, its own procedurally synthesized spatial
ambience, its own kinetic animation, and one hidden interaction nobody tells you
about. First-person controls, with a guided tour for anyone who would rather be
shown around.

**Live:** <https://yuratadevosyan.github.io/three-js-and-animations/interactive-museum/>

## Stack

| | |
| --- | --- |
| Engine | [Babylon.js 9](https://www.babylonjs.com/) (`@babylonjs/core`, granular imports) |
| UI | [SolidJS](https://www.solidjs.com/) 1.9 — HUD only, never in the render loop |
| Audio | Web Audio API, hand-built — no library, no audio files |
| Build | Vite 8, TypeScript 6, Tailwind v3 |

Both the engine and the framework are new to this repo: Babylon is the first
non-three.js renderer here, and Solid the first fine-grained-reactive framework.

## The rooms

| # | Room | Light | Sound | Motion | Hidden |
| --- | --- | --- | --- | --- | --- |
| I | The Atrium | Six skylight shafts, warm, real shadows | Low drone, long tail | A hinged monolith turning on a plinth | It opens |
| II | The Kinetic Hall | Three orbiting coloured lights, near-dark | Drifting fifths | 240 brass rods running a radial wave | Stand in the node |
| III | The Gallery | One picture light per work, lifting on approach | Soft high hum, a chime per exhibit | Light follows you along the wall | A seventh frame |
| IV | The Long Hall | Floor line, one spot per stone | A slow tick, 46bpm | A pulse runs the timeline every 8s | Touch the oldest stone |
| V | The Constellation | Almost none — the orbs *are* the light | Random bell tones | Sixteen orbs drifting on a shell | One lamp is dark |
| VI | The Guest Hall | A single warm skylight | Warm pad, resolving | A bell you are allowed to ring | Ring it |

Find all six and the museum switches to **after hours**: the lights drop to
moonlight, the bloom opens up, and the constellation gets brighter rather than
dimmer.

## Controls

| | |
| --- | --- |
| `W` `A` `S` `D` | Walk |
| Mouse | Look (pointer lock) |
| `Shift` | Move quickly |
| `E` | Interact |
| `Esc` | Release the cursor |

On touch devices: left thumbstick to walk, drag anywhere to look, and a button
appears when something is in reach. The guided tour is the default suggestion
there, since pointer lock doesn't exist on a phone.

## Notes on the build

**No binary assets.** Every texture is painted at runtime onto a canvas — the
veined stone, the plaster, the engraved plaques, the billboarded captions, the
dust sprite, and all seven artworks (each generated from its own `pattern` in
[`textures.ts`](src/engine/textures.ts)). The build ships no images and no audio.

**No audio files either.** [`audio.ts`](src/engine/audio.ts) synthesizes each
room's bed from filtered brown noise and a detuned drone stack, parks it on a
`PannerNode` at the room's centre, and rides the Web Audio listener on the
camera — so a corridor cross-fades the two rooms either side of you for free.
The reverb is a generated impulse response (exponentially decaying noise with
sparse early reflections). Footsteps, ticks, chimes and the bell are all
synthesized on the fly.

**Movement doesn't use the camera.** The visitor is an invisible collision
ellipsoid that the camera rides on top of. Babylon 9 rewrote
`TargetCamera._checkInputs` to route `camera.cameraDirection` through a
framerate-independent velocity model that reinterprets whatever you write into
it — and scales it by frame time in milliseconds — so it is no longer a channel
you can push an exact per-frame displacement through.
`AbstractMesh.moveWithCollisions` takes a literal displacement and has stayed
stable, so the body owns movement and gravity and the camera is positioned from
it each frame. It also means the head bob has the camera transform to itself.

**Babylon 9 module layout.** v9 splits every module into a side-effect-free
`.pure` variant and a self-registering one. Granular imports pull the
registering variant, but scene components nothing else references — collisions,
the effect layer, shadows — have to be imported explicitly or they silently do
nothing. See the top of [`museum.ts`](src/engine/museum.ts).

**Only three rooms are lit at once.** Each room's lights are enabled only when
the visitor is in it or next to it, which keeps the per-material light count
inside StandardMaterial's budget and stops six rooms of spotlights from being
shaded every frame.

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc -b
npm run build      # typecheck + production build
npm run preview
```

## Deploying

```bash
npm run deploy     # → gh-pages, /interactive-museum subpath
```
