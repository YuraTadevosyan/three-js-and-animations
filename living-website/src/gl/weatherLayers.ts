import { Container, Graphics, Sprite } from 'pixi.js'
import { mixHsl, toHex } from '@/lib/color'
import { clamp, damp, lerp } from '@/lib/math'
import { makeRng } from '@/lib/rng'
import type { OrganismState } from '@/organism/state'
import { cloudPuff, rainStreak, snowFlake, softBlob } from './textures'

const rng = makeRng(0xc10d5)

interface Cloud {
  sprite: Sprite
  /** 0 (far, slow, small) to 1 (near, fast, large). */
  depth: number
  y01: number
  baseAlpha: number
}

/**
 * Drifting cumulus. Clouds are the layer that makes wind legible — the sky
 * shader has no way to show direction on its own.
 */
export class CloudField {
  readonly container = new Container()
  #clouds: Cloud[] = []
  #w = 1
  #h = 1

  constructor(count: number) {
    for (let i = 0; i < count; i++) {
      const sprite = new Sprite(cloudPuff(i % 6))
      sprite.anchor.set(0.5)
      sprite.alpha = 0

      const depth = rng.range(0.15, 1)
      this.#clouds.push({
        sprite,
        depth,
        y01: rng.range(0.02, 0.52),
        baseAlpha: rng.range(0.45, 0.95),
      })
      this.container.addChild(sprite)
    }
  }

  resize(w: number, h: number) {
    const first = this.#w <= 1
    for (const cloud of this.#clouds) {
      const scale = lerp(0.55, 1.5, cloud.depth) * (w / 1440) * 1.35
      cloud.sprite.scale.set(Math.max(scale, 0.42))
      // Keep relative positions across a resize instead of re-scattering.
      cloud.sprite.x = first ? rng.range(0, w) : (cloud.sprite.x / this.#w) * w
      cloud.sprite.y = cloud.y01 * h
    }
    this.#w = w
    this.#h = h
  }

  update(dt: number, state: OrganismState) {
    const { weather: w, circadian: c } = state
    const cover = w.params.cloud

    // Lit from the sun's side at golden hour, flat grey when overcast.
    const lit = mixHsl(c.palette.sun, c.palette.skyMid, 0.35 + w.params.gloom * 0.5)
    const tint = toHex(mixHsl(lit, c.palette.skyBottom, 0.25))

    for (let i = 0; i < this.#clouds.length; i++) {
      const cloud = this.#clouds[i]!
      const s = cloud.sprite

      s.x += w.wind * (30 + cloud.depth * 70) * dt
      // A slow vertical bob keeps the bank from looking like a slideshow.
      s.y = cloud.y01 * this.#h + Math.sin(state.time.elapsed * 0.14 + i) * 6

      const halfW = s.width / 2
      if (s.x - halfW > this.#w) s.x = -halfW
      else if (s.x + halfW < 0) s.x = this.#w + halfW

      // Distant clouds appear first as cover builds, near ones last.
      const threshold = i / this.#clouds.length
      const visible = clamp((cover - threshold * 0.85) * 3)
      s.alpha = damp(s.alpha, visible * cloud.baseAlpha * (0.35 + c.daylight * 0.65), 0.05, dt)
      s.tint = tint
      s.visible = s.alpha > 0.004
    }
  }

  destroy() {
    this.container.destroy({ children: true })
  }
}

/** Low, slow haze that sits on the horizon. */
export class FogBank {
  readonly container = new Container()
  #blobs: { sprite: Sprite; speed: number; y01: number; wx: number; hy: number }[] = []
  #w = 1

  constructor(count: number) {
    for (let i = 0; i < count; i++) {
      const sprite = new Sprite(softBlob(256, 1.4))
      sprite.anchor.set(0.5)
      sprite.alpha = 0
      // Proportions are rolled once, here — re-rolling them inside resize()
      // would make the whole fog bank change shape on every window drag.
      this.#blobs.push({
        sprite,
        speed: rng.range(0.3, 1),
        y01: rng.range(0.55, 1.02),
        wx: rng.range(0.5, 1.1),
        hy: rng.range(0.18, 0.34),
      })
      this.container.addChild(sprite)
    }
  }

  resize(w: number, h: number) {
    const first = this.#w <= 1
    for (const blob of this.#blobs) {
      blob.sprite.width = w * blob.wx
      blob.sprite.height = h * blob.hy
      blob.sprite.x = first ? rng.range(0, w) : (blob.sprite.x / this.#w) * w
      blob.sprite.y = blob.y01 * h
    }
    this.#w = w
  }

  update(dt: number, state: OrganismState) {
    const fog = state.weather.params.fog
    const tint = toHex(mixHsl(state.circadian.palette.skyBottom, state.circadian.palette.sun, 0.3))

    for (const blob of this.#blobs) {
      const s = blob.sprite
      s.x += state.weather.wind * 14 * blob.speed * dt
      const halfW = s.width / 2
      if (s.x - halfW > this.#w) s.x = -halfW
      else if (s.x + halfW < 0) s.x = this.#w + halfW

      s.alpha = damp(s.alpha, fog * 0.42 * blob.speed, 0.06, dt)
      s.tint = tint
      s.visible = s.alpha > 0.004
    }
  }

  destroy() {
    this.container.destroy({ children: true })
  }
}

interface Drop {
  sprite: Sprite
  speed: number
  sway: number
  phase: number
}

/**
 * Rain and snow share one pooled field. Sprites are allocated once up front
 * and parked with `visible = false`; the active count follows the weather, so
 * a downpour never triggers a garbage-collection stutter mid-storm.
 */
export class Precipitation {
  readonly container = new Container()
  #rain: Drop[] = []
  #snow: Drop[] = []
  #w = 1
  #h = 1

  constructor(private maxRain: number, private maxSnow: number) {
    for (let i = 0; i < maxRain; i++) {
      const sprite = new Sprite(rainStreak())
      sprite.anchor.set(0.5)
      sprite.visible = false
      sprite.alpha = 0.5
      this.#rain.push({ sprite, speed: rng.range(900, 1500), sway: 0, phase: 0 })
      this.container.addChild(sprite)
    }
    for (let i = 0; i < maxSnow; i++) {
      const sprite = new Sprite(snowFlake())
      sprite.anchor.set(0.5)
      sprite.visible = false
      this.#snow.push({
        sprite,
        speed: rng.range(28, 78),
        sway: rng.range(10, 34),
        phase: rng.range(0, Math.PI * 2),
      })
      this.container.addChild(sprite)
    }
  }

  resize(w: number, h: number) {
    this.#w = w
    this.#h = h
    for (const drop of [...this.#rain, ...this.#snow]) {
      if (drop.sprite.x === 0 && drop.sprite.y === 0) {
        drop.sprite.x = rng.range(0, w)
        drop.sprite.y = rng.range(0, h)
      }
    }
  }

  update(dt: number, state: OrganismState) {
    const { weather: w, circadian: c } = state
    const snowMix = w.params.snowiness
    const rainAmount = w.params.precip * (1 - snowMix)
    const snowAmount = w.params.precip * snowMix

    const dropTint = toHex(mixHsl(c.palette.skyBottom, c.palette.sun, 0.45))

    const activeRain = Math.round(this.maxRain * clamp(rainAmount))
    for (let i = 0; i < this.#rain.length; i++) {
      const drop = this.#rain[i]!
      const s = drop.sprite
      if (i >= activeRain) {
        s.visible = false
        continue
      }
      s.visible = true
      s.tint = dropTint
      s.alpha = 0.24 + rainAmount * 0.4

      const vx = w.wind * 260
      s.x += vx * dt
      s.y += drop.speed * dt

      // Lean the streak into the wind so heavy gusts read as slanting rain.
      s.rotation = Math.atan2(vx, drop.speed)
      s.scale.set(1, 0.4 + rainAmount * 0.75)

      if (s.y > this.#h + 60) {
        s.y = -60
        s.x = rng.range(-120, this.#w + 120)
      }
      if (s.x < -120) s.x = this.#w + 120
      else if (s.x > this.#w + 120) s.x = -120
    }

    const activeSnow = Math.round(this.maxSnow * clamp(snowAmount))
    for (let i = 0; i < this.#snow.length; i++) {
      const drop = this.#snow[i]!
      const s = drop.sprite
      if (i >= activeSnow) {
        s.visible = false
        continue
      }
      s.visible = true
      s.alpha = 0.42 + snowAmount * 0.45
      s.scale.set(0.1 + (i % 5) * 0.035)

      drop.phase += dt * 0.8
      s.x += (w.wind * 90 + Math.sin(drop.phase) * drop.sway) * dt
      s.y += drop.speed * dt
      s.rotation += dt * 0.4

      if (s.y > this.#h + 30) {
        s.y = -30
        s.x = rng.range(-60, this.#w + 60)
      }
      if (s.x < -60) s.x = this.#w + 60
      else if (s.x > this.#w + 60) s.x = -60
    }
  }

  destroy() {
    this.container.destroy({ children: true })
  }
}

/** A full-screen additive flash, driven by `weather.flash`. */
export class Lightning {
  readonly graphics = new Graphics()

  resize(w: number, h: number) {
    this.graphics.clear().rect(0, 0, w, h).fill(0xffffff)
  }

  constructor() {
    // Set once. Assigning it every frame dirties the renderable needlessly.
    this.graphics.blendMode = 'add'
  }

  update(state: OrganismState) {
    this.graphics.alpha = state.weather.flash * 0.42
    this.graphics.visible = this.graphics.alpha > 0.002
  }

  destroy() {
    this.graphics.destroy()
  }
}
