<script lang="ts">
  import {
    forceCenter,
    forceCollide,
    forceLink,
    forceManyBody,
    forceSimulation,
    type Simulation,
    type SimulationLinkDatum,
    type SimulationNodeDatum,
  } from 'd3-force'
  import Tooltip from './Tooltip.svelte'
  import TooltipRow from './TooltipRow.svelte'
  import { NODE_CLASSES, type NetLink, type NetNode, type NodeClass } from '@/data/network'
  import { onFrame, prefersReducedMotion } from '@/lib/ticker'
  import { cssVar, theme } from '@/lib/theme.svelte'
  import { compact, dec } from '@/lib/format'

  /**
   * A node-link diagram with packets moving along the links.
   *
   * Canvas rather than SVG: forty nodes is fine as elements, but the ~400
   * packets in flight are not — they change position every frame, and that is
   * exactly the workload the DOM is worst at.
   *
   * Node classes stop at three. This is an all-pairs form (any two nodes can end
   * up adjacent), and the palette's all-pairs cap is three slots. Shape carries
   * the class as well as hue, so identity never rests on colour alone.
   */

  interface Props {
    nodes: NetNode[]
    links: NetLink[]
    height?: number
  }

  let { nodes, links, height = 420 }: Props = $props()

  type SimNode = NetNode & SimulationNodeDatum
  type SimLink = SimulationLinkDatum<SimNode> & { util: number; capacityGbps: number }

  interface Packet {
    link: number
    t: number
    speed: number
    /** 1 = source → target, -1 = the other way. */
    dir: 1 | -1
  }

  let canvas = $state<HTMLCanvasElement | null>(null)
  let width = $state(0)
  let hover = $state<SimNode | null>(null)
  let pointer = $state({ x: 0, y: 0 })
  let paused = $state(false)

  // Non-reactive simulation state — these change every frame and must not drive
  // Svelte's reactivity, or the whole component would re-render at 60fps.
  let sim: Simulation<SimNode, SimLink> | null = null
  let simNodes: SimNode[] = []
  let simLinks: SimLink[] = []
  let packets: Packet[] = []
  let palette = {
    core: '#3987e5',
    edge: '#d95926',
    client: '#199e70',
    link: '#20252f',
    ink: '#ffffff',
    surface: '#141821',
  }

  const RADIUS: Record<NodeClass, number> = { core: 9, edge: 6.5, client: 4 }

  /**
   * Tokens are read once per theme change, never inside the draw loop —
   * `getComputedStyle` in a per-node loop would be thousands of style
   * resolutions a second.
   */
  function readPalette() {
    palette = {
      core: cssVar('--series-1'),
      edge: cssVar('--series-2'),
      client: cssVar('--series-3'),
      link: cssVar('--viz-grid'),
      ink: cssVar('--viz-ink'),
      surface: cssVar('--viz-surface'),
    }
  }

  function colorOf(cls: NodeClass): string {
    return cls === 'core' ? palette.core : cls === 'edge' ? palette.edge : palette.client
  }

  function build() {
    simNodes = nodes.map((n) => ({ ...n }))
    const byId = new Map(simNodes.map((n) => [n.id, n]))
    simLinks = links.map((l) => ({
      source: byId.get(l.source as number)!,
      target: byId.get(l.target as number)!,
      util: l.util,
      capacityGbps: l.capacityGbps,
    }))

    sim = forceSimulation<SimNode>(simNodes)
      .force(
        'link',
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          // Core-to-core links are short; client tails hang further out.
          .distance((l) => (l.capacityGbps >= 400 ? 70 : l.capacityGbps >= 100 ? 58 : 34))
          .strength(0.42),
      )
      .force('charge', forceManyBody<SimNode>().strength((d) => (d.cls === 'core' ? -260 : -68)))
      .force('collide', forceCollide<SimNode>().radius((d) => RADIUS[d.cls] + 6))
      .force('center', forceCenter(width / 2, height / 2))
      .stop()

    // Settle before the first paint, so the graph never explodes on screen.
    for (let i = 0; i < 320; i++) sim.tick()
    // Then keep a whisper of alpha so the fabric stays subtly alive.
    sim.alpha(0.08).alphaTarget(prefersReducedMotion() ? 0 : 0.006).restart()

    packets = []
    simLinks.forEach((l, i) => {
      const n = Math.max(1, Math.round(l.util * 7))
      for (let p = 0; p < n; p++) {
        packets.push({
          link: i,
          t: Math.random(),
          speed: 0.16 + l.util * 0.5,
          dir: Math.random() > 0.5 ? 1 : -1,
        })
      }
    })
  }

  function draw(dt: number) {
    const el = canvas
    if (!el || !sim) return
    const ctx = el.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(2, devicePixelRatio || 1)
    if (el.width !== Math.round(width * dpr) || el.height !== Math.round(height * dpr)) {
      el.width = Math.round(width * dpr)
      el.height = Math.round(height * dpr)
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    // Links first, so nodes and packets sit above them.
    for (const l of simLinks) {
      const s = l.source as SimNode
      const t = l.target as SimNode
      ctx.beginPath()
      ctx.moveTo(s.x ?? 0, s.y ?? 0)
      ctx.lineTo(t.x ?? 0, t.y ?? 0)
      ctx.strokeStyle = palette.link
      ctx.lineWidth = 0.6 + l.util * 1.6
      ctx.globalAlpha = 0.55 + l.util * 0.45
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // Packets.
    if (!paused) {
      for (const p of packets) {
        p.t += p.speed * dt * p.dir
        if (p.t > 1) p.t -= 1
        else if (p.t < 0) p.t += 1
      }
    }
    for (const p of packets) {
      const l = simLinks[p.link]
      const s = l.source as SimNode
      const t = l.target as SimNode
      const x = (s.x ?? 0) + ((t.x ?? 0) - (s.x ?? 0)) * p.t
      const y = (s.y ?? 0) + ((t.y ?? 0) - (s.y ?? 0)) * p.t
      ctx.beginPath()
      ctx.arc(x, y, 1.6, 0, Math.PI * 2)
      ctx.fillStyle = colorOf((t as SimNode).cls)
      ctx.globalAlpha = 0.85
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Nodes. Shape reinforces the class: circle for core, diamond for edge,
    // small circle for client.
    for (const n of simNodes) {
      const r = RADIUS[n.cls]
      const isHover = hover?.id === n.id
      ctx.beginPath()
      if (n.cls === 'edge') {
        ctx.moveTo(n.x!, n.y! - r)
        ctx.lineTo(n.x! + r, n.y!)
        ctx.lineTo(n.x!, n.y! + r)
        ctx.lineTo(n.x! - r, n.y!)
        ctx.closePath()
      } else {
        ctx.arc(n.x!, n.y!, r, 0, Math.PI * 2)
      }
      ctx.fillStyle = colorOf(n.cls)
      ctx.fill()
      // 2px surface ring so overlapping nodes stay legible.
      ctx.lineWidth = 2
      ctx.strokeStyle = palette.surface
      ctx.stroke()
      if (isHover) {
        ctx.beginPath()
        ctx.arc(n.x!, n.y!, r + 5, 0, Math.PI * 2)
        ctx.strokeStyle = palette.ink
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }

    // Core routers are directly labelled — the four names that matter are
    // always readable without hovering.
    ctx.font = '11px Inter, system-ui, sans-serif'
    ctx.fillStyle = cssVar('--viz-muted')
    ctx.textAlign = 'center'
    for (const n of simNodes) {
      if (n.cls !== 'core') continue
      ctx.fillText(n.name, n.x!, n.y! - RADIUS.core - 7)
    }
  }

  $effect(() => {
    // Re-read the tokens whenever the mode flips; canvas can't inherit CSS vars.
    void theme.mode
    readPalette()
  })

  $effect(() => {
    if (width <= 0) return
    build()
    return () => {
      sim?.stop()
      sim = null
    }
  })

  $effect(() => {
    return onFrame((dt) => {
      if (!paused) sim?.tick()
      draw(dt)
    })
  })

  function onPointerMove(event: PointerEvent) {
    const rect = (event.currentTarget as HTMLCanvasElement).getBoundingClientRect()
    const px = event.clientX - rect.left
    const py = event.clientY - rect.top
    pointer = { x: px, y: py }

    // Nearest-node hit testing with a generous radius — a 4px client dot is a
    // pinpoint nobody lands on, so the pointer only has to be *closest*.
    let best: SimNode | null = null
    let bestD = 26 ** 2
    for (const n of simNodes) {
      const d = (n.x! - px) ** 2 + (n.y! - py) ** 2
      if (d < bestD) {
        bestD = d
        best = n
      }
    }
    hover = best
  }
</script>

<div class="relative w-full" bind:clientWidth={width}>
  <!-- The accessible name lives on the wrapper: a <canvas> is an interactive
       element, so labelling it as an image is the wrong shape. The table view
       on the card carries every node's actual values. -->
  <div
    role="img"
    aria-label="Network topology: {nodes.length} nodes and {links.length} links, with packets in flight. The table view lists every node."
  >
    <canvas
      bind:this={canvas}
      style:width="{width}px"
      style:height="{height}px"
      class="block touch-none"
      onpointermove={onPointerMove}
      onpointerleave={() => (hover = null)}
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

  <Tooltip visible={hover != null} x={pointer.x} y={pointer.y} containerWidth={width}>
    {#if hover}
      <p class="mb-1 border-b pb-1 text-[11px] font-medium text-muted-foreground">
        {hover.name}
      </p>
      <TooltipRow
        label={NODE_CLASSES.find((c) => c.key === hover?.cls)?.label ?? hover.cls}
        value={compact(hover.pps)}
        color={colorOf(hover.cls)}
        strong
      />
      <TooltipRow label="Packets / s" value={compact(hover.pps)} />
      <TooltipRow label="Latency" value="{dec(hover.latencyMs, 1)} ms" />
    {/if}
  </Tooltip>
</div>
