<script lang="ts">
  import { fbm1d } from '@/lib/rng'
  import { onFrame, prefersReducedMotion } from '@/lib/ticker'
  import { cssVar, theme } from '@/lib/theme.svelte'

  /**
   * The masthead: four bands of flowing data.
   *
   * Decorative, and treated as such — `aria-hidden`, no values, no axis. It is
   * here to say "this site is about data in motion", not to be read. Charts that
   * carry meaning are all downstream of this.
   */

  interface Props {
    height?: number
  }

  let { height = 200 }: Props = $props()

  const BANDS = 4
  const waves = Array.from({ length: BANDS }, (_, i) => fbm1d(`hero:${i}`, 3))

  let canvas = $state<HTMLCanvasElement | null>(null)
  let width = $state(0)
  let colors: string[] = []
  let offset = 0

  $effect(() => {
    void theme.mode
    colors = [1, 2, 3, 4].map((n) => cssVar(`--series-${n}`))
  })

  $effect(() => {
    return onFrame((dt) => {
      if (!prefersReducedMotion()) offset += dt * 0.42
      draw()
    })
  })

  function draw() {
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

    const stepPx = 4
    for (let b = BANDS - 1; b >= 0; b--) {
      const wave = waves[b]
      const baseline = height * (0.42 + b * 0.13)
      const amp = height * (0.2 - b * 0.028)

      ctx.beginPath()
      ctx.moveTo(0, height)
      for (let x = 0; x <= width; x += stepPx) {
        const t = x * 0.008 + offset + b * 7
        const y = baseline - (wave(t) - 0.5) * amp * 2
        ctx.lineTo(x, y)
      }
      ctx.lineTo(width, height)
      ctx.closePath()
      // A wash, never a saturated block — the same 10% area fill the charts use.
      ctx.fillStyle = colors[b] ?? '#3987e5'
      ctx.globalAlpha = 0.1
      ctx.fill()

      ctx.beginPath()
      for (let x = 0; x <= width; x += stepPx) {
        const t = x * 0.008 + offset + b * 7
        const y = baseline - (wave(t) - 0.5) * amp * 2
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = colors[b] ?? '#3987e5'
      ctx.globalAlpha = 0.95
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }
</script>

<div class="w-full" bind:clientWidth={width} aria-hidden="true">
  <canvas bind:this={canvas} style:width="{width}px" style:height="{height}px" class="block"></canvas>
</div>
