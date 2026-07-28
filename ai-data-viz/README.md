# ai-data-viz

**AI Data Visualization** — six procedurally generated datasets, visualised properly.

Every series on this site is generated in the browser from a fixed seed. Then a
panel framed as an "AI analyst" reads them back: ordinary least squares, rolling
z-scores, CUSUM changepoints, autocorrelation. **No model is called anywhere.**
The framing is the fiction; the arithmetic is real, which is why every claim the
analyst prints can be checked against the chart beside it — and why the whole
thing works offline on a static host with no API key.

**Live:** <https://yuratadevosyan.github.io/three-js-and-animations/ai-data-viz/>

## Datasets

| Dataset | What's modelled | Forms |
| --- | --- | --- |
| Company analytics | 36 months × 4 segments: compounding trend × Q4 seasonality × an injected step change at the platform launch | Morphing chart, forecast band, ordinal funnel, stat tiles |
| Stock market | A full session of 1-minute OHLC bars; GBM where sigma is itself mean-reverting, so calm and violent stretches alternate | Candlesticks, volume panel, depth ladder, live tape |
| Spacecraft telemetry | Eight subsystem channels at 2–10 Hz, each with an orbital period, a drift term and real caution/limit thresholds | Small-multiple strip chart, meters, orbit track |
| City traffic | A week across eight corridors: twin commuter peaks on weekdays collapsing to one midday hump at the weekend | Heatmap, animated map, emphasis bars, incident log |
| Network packets | A 38-node fabric — core mesh, dual-homed edge gateways, client subnets, one deliberately hot gateway | Force graph, flowing area, share bar, log-normal histogram |
| Climate | 126 years of anomaly: slow early warming, a mid-century aerosol plateau, then an accelerating modern trend | Diverging bars, warming stripes, radial cycle, projection |

## Stack

- **Svelte 5** — runes throughout (`$state` / `$derived` / `$effect`), plus
  `Tween` from `svelte/motion` for the chart morph.
- **D3, modules only** — `d3-scale`, `d3-shape`, `d3-array`, `d3-force`,
  `d3-time`, `d3-format`, `d3-interpolate`. No `d3-selection`: Svelte owns the
  DOM, D3 does the maths.
- **No chart library.** Every mark here is hand-drawn.
- Vite, TypeScript, Tailwind, and a forty-line hash router.

SVG where marks are few and interactive; canvas where hundreds of things move
every frame (the force graph, the traffic map, the masthead).

## Design rules the charts follow

The palette and chart specs come from a data-visualization method rather than
from taste. The parts worth knowing:

- **The palette was validated, not eyeballed.** Both modes were run through the
  lightness band, chroma floor, CVD separation, normal-vision floor and
  surface-contrast checks against this app's own surfaces (light `#fcfcfb`,
  dark `#141821`):

  | Mode | Worst adjacent CVD ΔE | Worst adjacent normal-vision ΔE | Contrast |
  | --- | --- | --- | --- |
  | Dark | 8.4 | 19.3 | all 8 slots ≥ 3:1 |
  | Light | 9.1 | 19.6 | 3 slots below 3:1 — relief required |

  The light-mode warning is why **every chart card ships a table view**: it is
  the relief channel, not an optional extra. The force graph caps at three node
  classes because it's an all-pairs form, where the harder all-pairs gate only
  passes for the first three slots.

- **One axis, always.** CO₂ gets its own chart rather than a second scale on the
  temperature plot; volume is a stacked panel under the price plot with its own
  baseline. Two scales in one frame invent a correlation the data doesn't have.
- **Colour follows the entity, never its rank.** Changing a date range never
  repaints a series.
- **The right job gets the right ramp.** Sequential for magnitude (traffic
  heatmap), ordinal for ordered buckets (funnel stages, latency bins), diverging
  for polarity (climate anomaly, order-book depth), categorical only when the
  series *are* the subject, and emphasis when one series is the story.
- **Status colours stay reserved** for values that genuinely mean good-to-critical
  — and always ship with an icon and a word, never colour alone.
- **Tooltips enhance, never gate.** Keyboard focus shows exactly what hover
  shows; every value is also in the table view.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # svelte-check
npm run build
```

## Deploying

```bash
npm run deploy     # gh-pages -d dist -e ai-data-viz
```

## Layout

```
src/
├── lib/          seeded RNG + value noise, the statistics engine, formatters,
│                 the hash router, theme, and one shared rAF loop
├── data/         the six generators, each returning data + its own insights
├── charts/       hand-drawn chart primitives (SVG and canvas)
├── components/   app shell, chart card, filter bar, stat tile, analyst panel
└── views/        home, about, and one view per dataset
```

`lib/stats.ts` is the whole "AI": regression with R² and a widening forecast
band, rolling z-score anomaly detection, a CUSUM changepoint scan,
autocorrelation for seasonality, and annualised volatility of log returns. Each
generator runs it over its own series and returns typed `Insight` objects; the
panel types them out.
