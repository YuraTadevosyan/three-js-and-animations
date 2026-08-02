import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { Light } from '@babylonjs/core/Lights/light'
import type { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { MILESTONES } from '@/data/museum'
import type { Interactable, RoomContext, RoomRuntime } from '../types'
import { emissiveMaterial, flatMaterial, hex } from '../materials'
import { addCaption, addPlaque, addSpot, clamp01, type Spot } from './common'

/**
 * Room IV — The Long Hall.
 *
 * A corridor is an honest shape for a timeline. Five stones, oldest at the door
 * you came in by, and a light line in the floor carrying a pulse from the first
 * to the last once every eight seconds.
 *
 * Touching the oldest stone runs the whole century past you at once.
 */

interface Stone {
  index: number
  z: number
  spot: Spot
  capMaterial: StandardMaterial
  /** 0..1 — how lit this stone currently is. */
  glow: number
}

const CYCLE_SECONDS = 8

export function buildCareer(ctx: RoomContext): RoomRuntime {
  const { scene, room } = ctx
  const p = room.palette
  const cx = room.center.x
  const cz = room.center.z
  const halfD = room.size.d / 2

  const lights: Light[] = []

  const ambient = new HemisphericLight('career-ambient', new Vector3(0, 1, 0), scene)
  ambient.intensity = 0.16
  ambient.diffuse = hex(p.secondary)
  ambient.groundColor = hex('#0a0705')
  lights.push(ambient)

  /* -------------------------------------------------------------- *
   * The line in the floor
   * -------------------------------------------------------------- */

  const lineStartZ = cz + halfD - 3
  const lineEndZ = cz - halfD + 3
  const lineLength = lineStartZ - lineEndZ

  const lineMat = emissiveMaterial(scene, 'career-line-mat', p.secondary, 0.35)
  const line = CreateBox('career-line', { width: 0.16, height: 0.02, depth: lineLength }, scene)
  line.position.set(cx, 0.011, (lineStartZ + lineEndZ) / 2)
  line.material = lineMat
  line.isPickable = false
  line.freezeWorldMatrix()

  // The pulse is a short bright segment that rides the line.
  const pulseMat = emissiveMaterial(scene, 'career-pulse-mat', p.accent, 2.6)
  const pulseMesh = CreateBox('career-pulse', { width: 0.3, height: 0.03, depth: 2.6 }, scene)
  pulseMesh.material = pulseMat
  pulseMesh.isPickable = false

  /* -------------------------------------------------------------- *
   * The stones
   * -------------------------------------------------------------- */

  const stones: Stone[] = []
  const interactables: Interactable[] = []
  const stoneMat = flatMaterial(scene, 'career-stone-mat', '#2e2620')

  let timelapse = 0
  let running = false

  MILESTONES.forEach((milestone, i) => {
    // Oldest nearest the entrance, so you walk forward through time.
    const t = MILESTONES.length === 1 ? 0 : i / (MILESTONES.length - 1)
    const z = lineStartZ - t * lineLength
    const side = i % 2 === 0 ? -1 : 1
    const x = cx + side * 4.2

    const height = 3.2 + (i / MILESTONES.length) * 1.1
    const stone = CreateBox(`career-stone-${i}`, { width: 1.3, height, depth: 0.75 }, scene)
    stone.position.set(x, height / 2, z)
    stone.material = stoneMat
    stone.checkCollisions = true
    stone.receiveShadows = true
    stone.freezeWorldMatrix()

    // A lit cap so each stone reads even before its spot comes up.
    const capMaterial = emissiveMaterial(scene, `career-cap-mat-${i}`, p.accent, 0.3)
    const cap = CreateBox(`career-cap-${i}`, { width: 1.34, height: 0.07, depth: 0.79 }, scene)
    cap.position.set(x, height + 0.03, z)
    cap.material = capMaterial
    cap.isPickable = false
    cap.freezeWorldMatrix()

    const spot = addSpot(
      scene,
      `career-spot-${i}`,
      new Vector3(x, room.height - 0.4, z),
      new Vector3(x, 0, z),
      { angle: Math.PI / 7, intensity: 26, color: p.accent, exponent: 16, range: 14 },
    )
    lights.push(spot.light)

    // Year on the stone face, detail below it.
    addCaption(
      scene,
      `career-label-${i}`,
      new Vector3(x + side * 0.9, height * 0.72, z),
      milestone.year,
      p.accent,
      { sub: milestone.title, width: 2.1 },
    )

    stones.push({ index: i, z, spot, capMaterial, glow: 0 })

    // Every stone hands its entry to the HUD on approach. The oldest one also
    // carries the trigger: it has to be the *same* interactable, because two of
    // them standing in the same spot would tie on distance and the exhibit
    // would always win the nearest-wins test, stranding the secret.
    const entry: Interactable = {
      id: `career-stone-${i}`,
      position: new Vector3(x - side * 1.6, 1.5, z),
      radius: 3,
      exhibit: {
        id: `milestone-${i}`,
        title: milestone.title,
        year: milestone.year,
        medium: 'The Long Hall',
        description: milestone.detail,
        pattern: 'machine',
        colors: ['#241d16', '#8c5a25', '#e8a33d'],
      },
    }

    if (i === 0) {
      entry.prompt = `Touch the ${milestone.year} stone`
      entry.activate = () => {
        if (running) return
        running = true
        timelapse = 0
        entry.prompt = undefined
        return 'timelapse'
      }
    }

    interactables.push(entry)
  })

  addPlaque(scene, room, new Vector3(cx + room.size.w / 2 - 0.4, 2.4, cz + halfD - 4), -Math.PI / 2, 'IV')
    .isPickable = false

  /* -------------------------------------------------------------- *
   * State
   * -------------------------------------------------------------- */

  let afterHours = false
  let pulse = 0
  let clock = 0

  return {
    id: room.id,

    interactables,

    update(dt, t) {
      if (pulse > 0) pulse = Math.max(0, pulse - dt * 0.8)

      // The timelapse compresses the whole cycle into two fast passes.
      let speed = 1
      if (running) {
        timelapse += dt
        speed = 6.5
        if (timelapse > 4.5) {
          running = false
        }
      }
      clock += dt * speed

      const phase = (clock % CYCLE_SECONDS) / CYCLE_SECONDS
      const pulseZ = lineStartZ - phase * lineLength
      pulseMesh.position.set(cx, 0.02, pulseZ)
      pulseMat.emissiveColor = hex(p.accent).scale(2.6 + (running ? 2.2 : 0))

      const dim = afterHours ? 0.35 : 1
      lineMat.emissiveColor = hex(p.secondary).scale(0.35 + pulse * 0.8 + (running ? 0.5 : 0))

      for (const stone of stones) {
        // A stone lights as the pulse passes it, then decays.
        const distance = Math.abs(stone.z - pulseZ)
        const hit = clamp01(1 - distance / 3.4)
        stone.glow = Math.max(stone.glow - dt * 1.1, hit)

        const base = 0.32 + stone.glow * 0.9
        stone.spot.light.intensity = stone.spot.base * base * dim * (1 + pulse * 0.7)
        stone.capMaterial.emissiveColor = hex(p.accent).scale(
          0.3 + stone.glow * 2.2 + pulse + Math.sin(t * 0.8 + stone.index) * 0.05,
        )
      }
    },

    setActive(active) {
      lights.forEach((light) => light.setEnabled(active))
      pulseMesh.setEnabled(active)
    },

    setAfterHours(on) {
      afterHours = on
      ambient.intensity = on ? 0.06 : 0.16
    },

    pulse() {
      pulse = 1
    },
  }
}
