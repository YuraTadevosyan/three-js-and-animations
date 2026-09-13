import { Application, Container } from 'pixi.js'
import type { OrganismState } from '@/organism/state'
import { SkyMesh } from './sky'
import { CloudField, FogBank, Lightning, Precipitation } from './weatherLayers'

interface Budget {
  clouds: number
  fog: number
  rain: number
  snow: number
}

/**
 * Particle budgets scale with the viewport and the machine. A phone gets a
 * believable drizzle rather than a dropped-frame downpour.
 */
function budgetFor(reducedMotion: boolean): Budget {
  if (reducedMotion) return { clouds: 6, fog: 3, rain: 0, snow: 0 }

  const w = window.innerWidth
  const cores = navigator.hardwareConcurrency ?? 4
  const small = w < 720
  const weak = cores <= 4

  if (small) return { clouds: 7, fog: 4, rain: 130, snow: 90 }
  if (weak) return { clouds: 10, fog: 5, rain: 220, snow: 140 }
  return { clouds: 14, fog: 6, rain: 380, snow: 230 }
}

export class SkyStage {
  #observer?: ResizeObserver

  private constructor(
    readonly app: Application,
    readonly host: HTMLElement,
    private sky: SkyMesh,
    private clouds: CloudField,
    private fog: FogBank,
    private precip: Precipitation,
    private lightning: Lightning,
  ) {}

  /**
   * Returns null rather than throwing when WebGL is unavailable — a blocked
   * or exhausted context must degrade to the CSS gradient underneath, not
   * take the page down with it.
   */
  static async create(host: HTMLElement, reducedMotion: boolean): Promise<SkyStage | null> {
    let app: Application
    try {
      app = new Application()
      await app.init({
        // WebGL only. The sky is hand-written GLSL and there is no point
        // maintaining a parallel WGSL version for the WebGPU backend.
        preference: 'webgl',
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        powerPreference: 'high-performance',
        // The organism's heartbeat calls render(); Pixi must not also run a
        // ticker, or the sky would advance on a second, unrelated timeline.
        autoStart: false,
        sharedTicker: false,
      })
    } catch (err) {
      console.warn('[sky] WebGL unavailable, falling back to the CSS gradient', err)
      return null
    }

    app.ticker.stop()

    const canvas = app.canvas
    canvas.style.position = 'absolute'
    canvas.style.inset = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    host.appendChild(canvas)

    try {
      const budget = budgetFor(reducedMotion)

      const sky = new SkyMesh()
      const clouds = new CloudField(budget.clouds)
      const fog = new FogBank(budget.fog)
      const precip = new Precipitation(budget.rain, budget.snow)
      const lightning = new Lightning()

      const root = new Container()
      // Painter's order: shader sky, then everything suspended in front of it.
      root.addChild(sky.mesh, clouds.container, fog.container, precip.container, lightning.graphics)
      app.stage.addChild(root)

      const stage = new SkyStage(app, host, sky, clouds, fog, precip, lightning)
      stage.#watchSize()
      return stage
    } catch (err) {
      // Texture generation needs a 2D context, which can also be refused.
      // Tear the renderer back down rather than leaving an orphaned canvas.
      console.warn('[sky] scene construction failed, falling back to CSS', err)
      app.destroy({ removeView: true }, { children: true })
      return null
    }
  }

  #watchSize() {
    const apply = () => {
      const rect = this.host.getBoundingClientRect()
      const w = Math.max(1, Math.round(rect.width))
      const h = Math.max(1, Math.round(rect.height))
      this.app.renderer.resize(w, h)
      this.sky.resize(w, h)
      this.clouds.resize(w, h)
      this.fog.resize(w, h)
      this.precip.resize(w, h)
      this.lightning.resize(w, h)
    }

    apply()
    this.#observer = new ResizeObserver(apply)
    this.#observer.observe(this.host)
  }

  update(dt: number, state: OrganismState) {
    this.sky.update(state)
    this.clouds.update(dt, state)
    this.fog.update(dt, state)
    this.precip.update(dt, state)
    this.lightning.update(state)
    this.app.render()
  }

  destroy() {
    this.#observer?.disconnect()
    this.sky.destroy()
    this.clouds.destroy()
    this.fog.destroy()
    this.precip.destroy()
    this.lightning.destroy()
    this.app.destroy({ removeView: true }, { children: true })
  }
}
