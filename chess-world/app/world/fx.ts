/**
 * Effects: the particle field every capture explodes into, expanding ground
 * rings, motion beams, and light flashes.
 *
 * Particles are one dynamic mesh of camera-facing quads updated on the CPU
 * rather than an engine particle component: every burst needs aiming (the
 * column a queen dissolves up, the ring a rook slams out) and the whole field
 * needs to be clearable in one call when a game resets mid-explosion.
 */
import {
  BLEND_ADDITIVE, CULLFACE_NONE, Color, Entity, GraphicsDevice, Mesh, MeshInstance, PRIMITIVE_TRIANGLES,
  StandardMaterial, Vec3, type AppBase,
} from 'playcanvas'
import { Timeline, ease, noise1D } from './anim'
import { plane as planeGeometry, ring as ringGeometry } from './geometry'

const MAX_PARTICLES = 1400

interface Particle {
  x: number; y: number; z: number
  vx: number; vy: number; vz: number
  life: number
  age: number
  size: number
  drag: number
  gravity: number
  r: number; g: number; b: number
  spin: number
  flicker: number
}

export interface BurstOptions {
  color: Color
  count?: number
  speed?: [number, number]
  size?: [number, number]
  life?: [number, number]
  gravity?: number
  drag?: number
  /** Bias the burst along a direction, 0 = spherical, 1 = tight cone. */
  direction?: Vec3
  focus?: number
  /** Extra outward velocity applied in the XZ plane only. */
  radial?: number
  origin?: Vec3
  spread?: number
}

export class ParticleField {
  private readonly particles: Particle[] = []
  private readonly positions = new Float32Array(MAX_PARTICLES * 4 * 3)
  private readonly colors = new Float32Array(MAX_PARTICLES * 4 * 4)
  private readonly mesh: Mesh
  private readonly entity: Entity
  private alive = 0
  private seed = 1

  constructor(device: GraphicsDevice, parent: Entity) {
    const indices = new Uint16Array(MAX_PARTICLES * 6)
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const v = i * 4
      indices.set([v, v + 1, v + 2, v, v + 2, v + 3], i * 6)
    }

    this.mesh = new Mesh(device)
    this.mesh.setPositions(this.positions)
    this.mesh.setColors(this.colors, 4)
    this.mesh.setIndices(indices)
    this.mesh.update()

    const material = new StandardMaterial()
    material.useLighting = false
    material.emissive = new Color(1, 1, 1)
    material.emissiveVertexColor = true
    material.emissiveIntensity = 1.6
    material.blendType = BLEND_ADDITIVE
    material.depthWrite = false
    material.cull = CULLFACE_NONE
    material.useFog = false
    material.update()

    const instance = new MeshInstance(this.mesh, material)
    instance.castShadow = false
    // The field spans the whole board; without this it gets frustum-culled
    // whenever the origin leaves the view.
    instance.cull = false

    this.entity = new Entity('particles')
    this.entity.addComponent('render', { meshInstances: [instance], castShadows: false, receiveShadows: false })
    parent.addChild(this.entity)

    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles.push({
        x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0,
        life: 0, age: 0, size: 0, drag: 0, gravity: 0,
        r: 0, g: 0, b: 0, spin: 0, flicker: 0,
      })
    }
  }

  /** Deterministic RNG so a replayed game produces the same sparks. */
  private random(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0x7fffffff
    return this.seed / 0x7fffffff
  }

  private range([min, max]: [number, number]): number {
    return min + (max - min) * this.random()
  }

  emit(origin: Vec3, options: BurstOptions): void {
    const count = Math.min(options.count ?? 60, MAX_PARTICLES - this.alive)
    const speed = options.speed ?? [1.2, 3.4]
    const size = options.size ?? [0.03, 0.09]
    const life = options.life ?? [0.5, 1.1]
    const focus = options.focus ?? 0
    const direction = options.direction
    const spread = options.spread ?? 0

    for (let i = 0; i < count; i++) {
      const particle = this.particles[this.alive++]!
      const theta = this.random() * Math.PI * 2
      const phi = Math.acos(2 * this.random() - 1)
      let dx = Math.sin(phi) * Math.cos(theta)
      let dy = Math.cos(phi)
      let dz = Math.sin(phi) * Math.sin(theta)

      if (direction && focus > 0) {
        dx = dx * (1 - focus) + direction.x * focus
        dy = dy * (1 - focus) + direction.y * focus
        dz = dz * (1 - focus) + direction.z * focus
        const length = Math.hypot(dx, dy, dz) || 1
        dx /= length
        dy /= length
        dz /= length
      }

      const velocity = this.range(speed)
      particle.x = origin.x + (this.random() - 0.5) * spread
      particle.y = origin.y + (this.random() - 0.5) * spread
      particle.z = origin.z + (this.random() - 0.5) * spread
      particle.vx = dx * velocity + (options.radial ? dx * options.radial : 0)
      particle.vy = dy * velocity
      particle.vz = dz * velocity + (options.radial ? dz * options.radial : 0)
      particle.life = this.range(life)
      particle.age = 0
      particle.size = this.range(size)
      particle.drag = options.drag ?? 1.6
      particle.gravity = options.gravity ?? -3.2
      particle.r = options.color.r
      particle.g = options.color.g
      particle.b = options.color.b
      particle.spin = this.random() * 6.28
      particle.flicker = 6 + this.random() * 10
    }
  }

  update(dt: number, cameraRight: Vec3, cameraUp: Vec3): void {
    for (let i = this.alive - 1; i >= 0; i--) {
      const particle = this.particles[i]!
      particle.age += dt
      if (particle.age >= particle.life) {
        // Swap-remove keeps the live range contiguous.
        this.particles[i] = this.particles[this.alive - 1]!
        this.particles[this.alive - 1] = particle
        this.alive--
        continue
      }
      const damping = Math.max(0, 1 - particle.drag * dt)
      particle.vx *= damping
      particle.vz *= damping
      particle.vy = particle.vy * damping + particle.gravity * dt
      particle.x += particle.vx * dt
      particle.y += particle.vy * dt
      particle.z += particle.vz * dt
      // Sparks that reach the board skid along it instead of sinking through.
      if (particle.y < 0.02) {
        particle.y = 0.02
        particle.vy = Math.abs(particle.vy) * 0.28
      }
    }

    const positions = this.positions
    const colors = this.colors
    for (let i = 0; i < this.alive; i++) {
      const particle = this.particles[i]!
      const remaining = 1 - particle.age / particle.life
      const scale = particle.size * (0.35 + remaining * 0.65)
      const rx = cameraRight.x * scale
      const ry = cameraRight.y * scale
      const rz = cameraRight.z * scale
      const ux = cameraUp.x * scale
      const uy = cameraUp.y * scale
      const uz = cameraUp.z * scale

      const base = i * 12
      positions[base] = particle.x - rx - ux
      positions[base + 1] = particle.y - ry - uy
      positions[base + 2] = particle.z - rz - uz
      positions[base + 3] = particle.x + rx - ux
      positions[base + 4] = particle.y + ry - uy
      positions[base + 5] = particle.z + rz - uz
      positions[base + 6] = particle.x + rx + ux
      positions[base + 7] = particle.y + ry + uy
      positions[base + 8] = particle.z + rz + uz
      positions[base + 9] = particle.x - rx + ux
      positions[base + 10] = particle.y - ry + uy
      positions[base + 11] = particle.z - rz + uz

      // Additive blending means brightness *is* opacity: fading to black is
      // what makes a spark disappear.
      const flicker = 0.75 + 0.25 * Math.sin(particle.spin + particle.age * particle.flicker)
      const intensity = remaining * remaining * flicker
      const colorBase = i * 16
      for (let corner = 0; corner < 4; corner++) {
        const offset = colorBase + corner * 4
        colors[offset] = particle.r * intensity
        colors[offset + 1] = particle.g * intensity
        colors[offset + 2] = particle.b * intensity
        colors[offset + 3] = intensity
      }
    }

    // Collapse the unused quads to a point so they rasterise to nothing.
    positions.fill(0, this.alive * 12)
    colors.fill(0, this.alive * 16)

    this.mesh.setPositions(positions)
    this.mesh.setColors(colors, 4)
    // The field is never frustum-culled, so skip recomputing its bounds over
    // 5,600 vertices every frame.
    this.mesh.update(PRIMITIVE_TRIANGLES, false)
  }

  get count(): number {
    return this.alive
  }

  clear(): void {
    this.alive = 0
    this.positions.fill(0)
    this.colors.fill(0)
    this.mesh.setPositions(this.positions)
    this.mesh.setColors(this.colors, 4)
    this.mesh.update()
  }

  reseed(seed: number): void {
    this.seed = (seed | 1) & 0x7fffffff
  }
}

/* ---------------------------------------------------------------- decals -- */

function additiveMaterial(color: Color): StandardMaterial {
  const material = new StandardMaterial()
  material.useLighting = false
  material.emissive = color.clone()
  material.emissiveIntensity = 1
  material.blendType = BLEND_ADDITIVE
  material.depthWrite = false
  material.cull = CULLFACE_NONE
  material.useFog = false
  material.opacity = 1
  material.update()
  return material
}

export class Fx {
  readonly particles: ParticleField
  private readonly root: Entity
  private readonly ringMesh: Mesh
  private readonly beamMesh: Mesh
  private shakeAmount = 0
  private shakeTime = 0

  constructor(
    private readonly app: AppBase,
    parent: Entity,
    private readonly spawn: (timeline: Timeline) => void,
  ) {
    this.root = new Entity('fx')
    parent.addChild(this.root)
    this.particles = new ParticleField(app.graphicsDevice, this.root)
    this.ringMesh = Mesh.fromGeometry(app.graphicsDevice, ringGeometry(0.72, 1, 56))
    this.beamMesh = Mesh.fromGeometry(app.graphicsDevice, planeGeometry(1, 1))
  }

  burst(origin: Vec3, options: BurstOptions): void {
    this.particles.emit(origin, options)
  }

  /** A ring that expands and fades on the board plane. */
  ring(
    position: Vec3,
    color: Color,
    options: { from?: number; to?: number; duration?: number; intensity?: number; y?: number } = {},
  ): void {
    const material = additiveMaterial(color)
    const entity = new Entity('ring')
    const instance = new MeshInstance(this.ringMesh, material)
    instance.castShadow = false
    entity.addComponent('render', { meshInstances: [instance], castShadows: false, receiveShadows: false })
    entity.setPosition(position.x, (options.y ?? 0.03) + position.y * 0, position.z)
    this.root.addChild(entity)

    const from = options.from ?? 0.25
    const to = options.to ?? 1.6
    const peak = options.intensity ?? 2.2
    const timeline = new Timeline().add({
      duration: options.duration ?? 0.7,
      easing: ease.outQuart,
      onUpdate: (t) => {
        const scale = from + (to - from) * t
        entity.setLocalScale(scale, 1, scale)
        material.emissiveIntensity = peak * (1 - t) ** 1.5
        material.update()
      },
      onComplete: () => {
        entity.destroy()
        material.destroy()
      },
    })
    this.spawn(timeline)
  }

  /** A stretched quad from A to B — the streak a sliding piece leaves behind. */
  beam(from: Vec3, to: Vec3, color: Color, options: { width?: number; duration?: number; y?: number } = {}): void {
    const material = additiveMaterial(color)
    const entity = new Entity('beam')
    const instance = new MeshInstance(this.beamMesh, material)
    instance.castShadow = false
    entity.addComponent('render', { meshInstances: [instance], castShadows: false, receiveShadows: false })

    const dx = to.x - from.x
    const dz = to.z - from.z
    const length = Math.hypot(dx, dz)
    const width = options.width ?? 0.3
    entity.setPosition((from.x + to.x) / 2, options.y ?? 0.05, (from.z + to.z) / 2)
    entity.setLocalEulerAngles(0, (-Math.atan2(dz, dx) * 180) / Math.PI, 0)
    entity.setLocalScale(length * 1.05, 1, width)
    this.root.addChild(entity)

    const timeline = new Timeline().add({
      duration: options.duration ?? 0.5,
      easing: ease.outCubic,
      onUpdate: (t) => {
        material.emissiveIntensity = 2.4 * (1 - t) ** 2
        entity.setLocalScale(length * 1.05, 1, width * (1 - t * 0.7))
        material.update()
      },
      onComplete: () => {
        entity.destroy()
        material.destroy()
      },
    })
    this.spawn(timeline)
  }

  /** A short-lived light — what makes an explosion actually light the board. */
  flash(position: Vec3, color: Color, options: { intensity?: number; duration?: number; range?: number } = {}): void {
    const entity = new Entity('flash')
    entity.addComponent('light', {
      type: 'omni',
      color: color.clone(),
      intensity: 0,
      range: options.range ?? 4.5,
      castShadows: false,
    })
    entity.setPosition(position)
    this.root.addChild(entity)

    const peak = options.intensity ?? 6
    const timeline = new Timeline().add({
      duration: options.duration ?? 0.55,
      easing: ease.linear,
      onUpdate: (t) => {
        const curve = t < 0.15 ? t / 0.15 : (1 - t) / 0.85
        if (entity.light) entity.light.intensity = peak * Math.max(0, curve) ** 1.4
      },
      onComplete: () => entity.destroy(),
    })
    this.spawn(timeline)
  }

  shake(amount: number, duration = 0.45): void {
    this.shakeAmount = Math.max(this.shakeAmount, amount)
    this.shakeTime = Math.max(this.shakeTime, duration)
  }

  /** Current camera shake offset; decays on its own. */
  shakeOffset(dt: number, time: number, out: Vec3): Vec3 {
    if (this.shakeTime <= 0) return out.set(0, 0, 0)
    this.shakeTime = Math.max(0, this.shakeTime - dt)
    const strength = this.shakeAmount * this.shakeTime
    if (this.shakeTime === 0) this.shakeAmount = 0
    return out.set(
      noise1D(time * 37) * strength,
      noise1D(time * 41 + 13) * strength * 0.7,
      noise1D(time * 31 + 91) * strength,
    )
  }

  update(dt: number, cameraRight: Vec3, cameraUp: Vec3): void {
    this.particles.update(dt, cameraRight, cameraUp)
  }

  clear(): void {
    this.particles.clear()
    this.shakeAmount = 0
    this.shakeTime = 0
  }

  destroy(): void {
    this.root.destroy()
    this.ringMesh.destroy()
    this.beamMesh.destroy()
  }
}
