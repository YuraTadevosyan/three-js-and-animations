<script lang="ts">
  import type { Vehicle } from '@/data/telemetry'
  import { dec, elapsed } from '@/lib/format'

  interface Props {
    vehicle: Vehicle
    height?: number
  }

  let { vehicle, height = 240 }: Props = $props()

  let width = $state(0)

  const cx = $derived(width / 2)
  const cy = $derived(height / 2)
  const rx = $derived(Math.min(width, height * 1.7) * 0.36)
  const ry = $derived(rx * (1 - vehicle.eccentricity * 0.55))

  const craft = $derived({
    x: cx + Math.cos(vehicle.theta) * rx,
    y: cy + Math.sin(vehicle.theta) * ry,
  })

  /** A short arc trailing the craft, so direction of travel is unambiguous. */
  const trail = $derived.by(() => {
    const points: string[] = []
    for (let i = 0; i < 26; i++) {
      const t = vehicle.theta - i * 0.045
      points.push(`${cx + Math.cos(t) * rx},${cy + Math.sin(t) * ry}`)
    }
    return points.join(' ')
  })

  /** Ground-station line of sight — solid when the craft is on the near side. */
  const inContact = $derived(Math.sin(vehicle.theta) > -0.35)
</script>

<div class="relative w-full" bind:clientWidth={width}>
  {#if width > 0}
    <svg {width} {height} role="img" aria-label="Orbit track for {vehicle.name}" class="block">
      <ellipse
        {cx}
        {cy}
        {rx}
        {ry}
        fill="none"
        stroke="var(--viz-grid)"
        stroke-width="1"
      />

      <polyline
        points={trail}
        fill="none"
        stroke="var(--series-3)"
        stroke-width="2"
        stroke-linecap="round"
        opacity="0.42"
      />

      <!-- Body -->
      <circle {cx} {cy} r={ry * 0.34} fill="var(--seq-600)" opacity="0.32" />
      <circle {cx} {cy} r={ry * 0.28} fill="var(--seq-500)" />
      <text
        x={cx}
        y={cy}
        text-anchor="middle"
        dominant-baseline="middle"
        class="viz-tick"
        fill="var(--viz-ink)"
      >
        EARTH
      </text>

      {#if inContact}
        <line
          x1={cx}
          y1={cy - ry * 0.28}
          x2={craft.x}
          y2={craft.y}
          stroke="var(--status-good)"
          stroke-width="1"
          opacity="0.5"
        />
      {/if}

      <circle
        cx={craft.x}
        cy={craft.y}
        r="6"
        fill="var(--series-3)"
        stroke="var(--viz-surface)"
        stroke-width="2"
      />
      <text
        x={craft.x + 12}
        y={craft.y - 8}
        class="viz-tick"
        fill="var(--viz-ink-2)"
      >
        {vehicle.name}
      </text>
    </svg>

    <dl class="mt-2 grid grid-cols-3 gap-3 px-1 text-xs">
      <div>
        <dt class="text-muted-foreground">Elapsed</dt>
        <dd class="mt-0.5 font-medium tabular-nums">{elapsed(vehicle.met)}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">Altitude</dt>
        <dd class="mt-0.5 font-medium tabular-nums">{dec(vehicle.altitudeKm, 1)} km</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">Velocity</dt>
        <dd class="mt-0.5 font-medium tabular-nums">{Math.round(vehicle.velocityMs)} m/s</dd>
      </div>
    </dl>
  {/if}
</div>
