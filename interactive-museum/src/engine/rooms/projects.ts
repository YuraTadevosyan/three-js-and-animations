import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { Light } from '@babylonjs/core/Lights/light'
import type { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { EXHIBITS, LOST_EXHIBIT, type ExhibitDef } from '@/data/museum'
import type { Interactable, RoomContext, RoomRuntime } from '../types'
import { artworkMaterial, emissiveMaterial, flatMaterial, hex } from '../materials'
import { makeExhibitTexture } from '../textures'
import { addCaption, addFramedCanvas, addPlaque, addSpot, clamp01, type Spot } from './common'

/**
 * Room III — The Gallery.
 *
 * Deliberately underlit everywhere except on the work. Each frame has its own
 * picture light that lifts as you approach, and the room hands its catalogue
 * entry to the HUD on proximity rather than on a key press.
 *
 * The seventh frame is unlit, in the corner, and not in any catalogue.
 */

interface Hanging {
  exhibit: ExhibitDef
  spot: Spot
  material: StandardMaterial
  /** 0..1 approach response. */
  attention: number
  target: number
}

export function buildProjects(ctx: RoomContext): RoomRuntime {
  const { scene, room } = ctx
  const p = room.palette
  const cx = room.center.x
  const cz = room.center.z
  const halfW = room.size.w / 2
  const halfD = room.size.d / 2

  const lights: Light[] = []

  // Just enough ambient to navigate by.
  const ambient = new HemisphericLight('projects-ambient', new Vector3(0, 1, 0), scene)
  ambient.intensity = 0.13
  ambient.diffuse = hex(p.secondary)
  ambient.groundColor = hex('#0a0806')
  lights.push(ambient)

  const hangings: Hanging[] = []
  const interactables: Interactable[] = []

  const hangHeight = 3.1
  const canvasSize = { w: 2.4, h: 3.1 }

  /**
   * Hang one work: frame, canvas, picture light, floor caption and the
   * proximity trigger that feeds the HUD.
   */
  function hang(exhibit: ExhibitDef, position: Vector3, rotationY: number, lit: boolean) {
    const texture = makeExhibitTexture(scene, exhibit)
    const material = artworkMaterial(scene, `projects-art-${exhibit.id}`, texture)
    addFramedCanvas(scene, `projects-${exhibit.id}`, position, rotationY, material, canvasSize)

    // The picture light sits above and in front, angled back at the canvas.
    const forward = new Vector3(Math.sin(rotationY), 0, Math.cos(rotationY))
    const lightPos = position.add(forward.scale(1.9)).add(new Vector3(0, 2.5, 0))
    const spot = addSpot(scene, `projects-spot-${exhibit.id}`, lightPos, position, {
      angle: Math.PI / 6,
      intensity: lit ? 34 : 0,
      color: p.accent,
      exponent: 14,
      range: 14,
    })
    if (!lit) spot.base = 46
    lights.push(spot.light)

    // The little brass housing the light comes out of.
    const housing = CreateBox(`projects-housing-${exhibit.id}`, { width: 0.5, height: 0.12, depth: 0.2 }, scene)
    housing.position.copyFrom(lightPos)
    housing.rotation.y = rotationY
    housing.material = flatMaterial(scene, `projects-housing-mat-${exhibit.id}`, '#3a3129')
    housing.freezeWorldMatrix()

    const caption = position
      .add(forward.scale(0.14))
      .add(new Vector3(0, -(canvasSize.h / 2) - 0.42, 0))
    addCaption(scene, `projects-caption-${exhibit.id}`, caption, exhibit.year, p.accent, {
      sub: exhibit.title,
      width: 1.9,
    })

    const hanging: Hanging = { exhibit, spot, material, attention: lit ? 1 : 0, target: lit ? 1 : 0 }
    hangings.push(hanging)

    interactables.push({
      id: `projects-${exhibit.id}`,
      // Stand-in-front-of point, not the wall position.
      position: position.add(forward.scale(2.2)),
      radius: 3.6,
      exhibit,
      onProximity: (inRange) => {
        hanging.target = lit ? (inRange ? 1.55 : 1) : hanging.target
      },
    })

    return hanging
  }

  // Three a side, spaced evenly down the long walls.
  const wallZ = [-8, 0, 8]
  EXHIBITS.forEach((exhibit, i) => {
    const onWest = i < 3
    const z = cz + wallZ[i % 3]
    const x = onWest ? cx - halfW + 0.35 : cx + halfW - 0.35
    // West wall faces +X, east wall faces -X.
    hang(exhibit, new Vector3(x, hangHeight, z), onWest ? Math.PI / 2 : -Math.PI / 2, true)
  })

  /* -------------------------------------------------------------- *
   * The seventh frame
   * -------------------------------------------------------------- */

  // Tucked into the dark north-west corner, behind a partition stub.
  const lostPos = new Vector3(cx - halfW + 4.2, hangHeight, cz - halfD + 0.35)
  const lost = hang(LOST_EXHIBIT, lostPos, 0, false)

  // The partition it was found behind — also what keeps it out of the light.
  const partition = CreateBox('projects-partition', { width: 0.4, height: room.height, depth: 5.5 }, scene)
  partition.position.set(cx - halfW + 6.6, room.height / 2, cz - halfD + 2.6)
  partition.material = flatMaterial(scene, 'projects-partition-mat', p.wall)
  partition.checkCollisions = true
  partition.receiveShadows = true
  partition.freezeWorldMatrix()

  const lostMarker = CreateBox('projects-lost-marker', { width: 0.3, height: 0.02, depth: 0.3 }, scene)
  const lostMarkerMat = emissiveMaterial(scene, 'projects-lost-marker-mat', p.accent, 0.4)
  lostMarker.position.set(lostPos.x, 0.02, lostPos.z + 2)
  lostMarker.material = lostMarkerMat
  lostMarker.isPickable = false

  let lostRevealed = false
  let reveal = 0

  const lostInteractable: Interactable = {
    id: 'projects-lost',
    position: lostPos.add(new Vector3(0, -1.4, 2.2)),
    radius: 3.2,
    prompt: 'Look closer at the unlit frame',
    activate: () => {
      if (lostRevealed) return
      lostRevealed = true
      lostInteractable.prompt = undefined
      lostInteractable.exhibit = LOST_EXHIBIT
      return 'lost'
    },
  }
  interactables.push(lostInteractable)

  addPlaque(scene, room, new Vector3(cx - 6, 2.6, cz + halfD - 0.4), Math.PI, 'III').isPickable = false

  /* -------------------------------------------------------------- *
   * State
   * -------------------------------------------------------------- */

  let afterHours = false
  let pulse = 0

  return {
    id: room.id,

    interactables,

    update(dt, t) {
      if (lostRevealed && reveal < 1) reveal = clamp01(reveal + dt * 1.6)
      if (pulse > 0) pulse = Math.max(0, pulse - dt * 0.8)

      const smoothing = 1 - Math.exp(-dt * 5)
      const dim = afterHours ? 0.4 : 1

      for (const hanging of hangings) {
        if (hanging === lost) continue
        hanging.attention += (hanging.target - hanging.attention) * smoothing
        hanging.spot.light.intensity = hanging.spot.base * hanging.attention * dim * (1 + pulse * 0.8)
        // The canvas itself lifts slightly, so the work reads before the light does.
        hanging.material.emissiveColor = hex('#ffffff').scale(0.13 + (hanging.attention - 1) * 0.22)
      }

      // The seventh frame comes up hard, then settles.
      const settle = reveal > 0.6 ? 1 - (reveal - 0.6) * 0.55 : reveal
      lost.spot.light.intensity = lost.spot.base * settle * dim * (1 + pulse)
      lost.material.emissiveColor = hex('#ffffff').scale(0.05 + reveal * 0.22)

      // The marker on the floor blinks until you find it, then holds steady.
      lostMarkerMat.emissiveColor = hex(p.accent).scale(
        lostRevealed ? 0.9 : 0.25 + Math.abs(Math.sin(t * 1.1)) * 0.75,
      )
    },

    setActive(active) {
      lights.forEach((light) => light.setEnabled(active))
    },

    setAfterHours(on) {
      afterHours = on
      ambient.intensity = on ? 0.05 : 0.13
    },

    pulse() {
      pulse = 1
    },
  }
}
