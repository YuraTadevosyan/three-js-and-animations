<script lang="ts">
  import type { RoadEdge, RoadNode } from '@/data/traffic'
  import { onFrame, prefersReducedMotion } from '@/lib/ticker'
  import { cssVar, theme } from '@/lib/theme.svelte'

  /**
   * The road network with vehicles moving along it.
   *
   * Node positions are fixed rather than force-simulated — a city map that
   * reshuffles itself on every reload stops reading as a map. Only the vehicles
   * move.
   *
   * Edge colour is sequential (one hue, light→dark) because link load is a
   * magnitude, not an identity. The scale legend sits under the canvas.
   */

  interface Props {
    nodes: RoadNode[]
    edges: RoadEdge[]
    height?: number
    /** 0–1 city-wide load, which scales vehicle speed and density. */
    load?: number
  }

  let { nodes, edges, height = 340, load = 0.5 }: Props = $props()

  interface Vehicle {
    edge: number
    t: number
    speed: number
    dir: 1 | -1
  }

  let canvas = $state<HTMLCanvasElement | null>(null)
  let width = $state(0)
  let paused = $state(false)

  let vehicles: Vehicle[] = []
  let ramp: string[] = []
  let surface = '#141821'
  let gridColor = '#20252f'
  // Queried once rather than per frame — `matchMedia` in the draw loop is a
  // needless style read sixty times a second.
  let reducedMotion = prefersReducedMotion()

  const SEQ_VARS = ['--seq-100', '--seq-200', '--seq-300', '--seq-400', '--seq-500', '--seq-600', '--seq-700']

  function project(n: RoadNode): { x: number; y: number } {
    const pad = 26
    return {
      x: pad + n.x * (width - pad * 2),
      y: pad + n.y * (height - pad * 2),
    }
  }

  function readPalette() {
    ramp = SEQ_VARS.map((v) => cssVar(v))
    surface = cssVar('--viz-surface')
    gridColor = cssVar('--viz-grid')
  }

  function edgeColor(loadValue: number): string {
    if (!ramp.length) return gridColor
    // Heavier load reads darker, the way a sequential ramp always should.
    const idx = Math.min(ramp.length - 1, Math.max(0, Math.round(loadValue * (ramp.length - 1))))
    return ramp[idx]
  }

  function build() {
    vehicles = []
    edges.forEach((e, i) => {
      const count = 1 + Math.round(e.load * 4)
      for (let v = 0; v < count; v++) {
        vehicles.push({
          edge: i,
          t: Math.random(),
          speed: 0.05 + (1 - e.load) * 0.22,
          dir: Math.random() > 0.5 ? 1 : -1,
        })
      }
    })
  }

  function draw(dt: number) {
    const el = canvas
    if (!el || width <= 0) return
    const ctx = el.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(2, devicePixelRatio || 1)
    if (el.width !== Math.round(width * dpr) || el.height !== Math.round(height * dpr)) {
      el.width = Math.round(width * dpr)
      el.height = Math.round(height * dpr)
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    const points = new Map(nodes.map((n) => [n.id, project(n)]))

    for (const e of edges) {
      const a = points.get(e.from)
      const b = points.get(e.to)
      if (!a || !b) continue
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.strokeStyle = edgeColor(e.load * (0.55 + load * 0.75))
      ctx.lineWidth = 1.5 + e.load * 3.5
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    if (!paused && !reducedMotion) {
      for (const v of vehicles) {
        // Congestion slows traffic — the animation carries the same information
        // the heatmap does, in a second channel.
        v.t += v.speed * dt * v.dir * (1.25 - load * 0.85)
        if (v.t > 1) v.t -= 1
        else if (v.t < 0) v.t += 1
      }
    }

    for (const v of vehicles) {
      const e = edges[v.edge]
      const a = points.get(e.from)
      const b = points.get(e.to)
      if (!a || !b) continue
      const x = a.x + (b.x - a.x) * v.t
      const y = a.y + (b.y - a.y) * v.t
      ctx.beginPath()
      ctx.arc(x, y, 1.7, 0, Math.PI * 2)
      ctx.fillStyle = ramp[ramp.length - 2] ?? gridColor
      ctx.globalAlpha = 0.95
      ctx.fill()
    }
    ctx.globalAlpha = 1

    for (const n of nodes) {
      const p = project(n)
      const r = 2.5 + n.weight * 3.5
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fillStyle = ramp[5] ?? gridColor
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = surface
      ctx.stroke()
    }
  }

  $effect(() => {
    void theme.mode
    readPalette()
  })

  $effect(() => {
    build()
  })

  $effect(() => {
    return onFrame((dt) => draw(dt))
  })
</script>

<div class="w-full">
  <div class="relative w-full" bind:clientWidth={width}>
    <div
      role="img"
      aria-label="Road network with {nodes.length} junctions and {edges.length} links; heavier links carry more load. Corridor values are listed in the table view."
    >
      <canvas
        bind:this={canvas}
        style:width="{width}px"
        style:height="{height}px"
        class="block"
        aria-hidden="true"
      ></canvas>
    </div>
    <button
      type="button"
      class="chip absolute right-2 top-2 bg-card/80 backdrop-blur"
      aria-pressed={paused}
      onclick={() => (paused = !paused)}
    >
      {paused ? 'Resume' : 'Pause'}
    </button>
  </div>

  <div class="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
    <span>Light</span>
    <span class="flex h-2.5 flex-1 max-w-[200px] overflow-hidden rounded-full" aria-hidden="true">
      {#each SEQ_VARS as v (v)}
        <span class="flex-1" style:background="var({v})"></span>
      {/each}
    </span>
    <span>Heavy</span>
    <span class="ml-1">link load</span>
  </div>
</div>
