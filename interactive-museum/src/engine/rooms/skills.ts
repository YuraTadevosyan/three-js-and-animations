import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder'
import { CreateLines } from '@babylonjs/core/Meshes/Builders/linesBuilder'
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { Light } from '@babylonjs/core/Lights/light'
import type { LinesMesh } from '@babylonjs/core/Meshes/linesMesh'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DARK_SKILL, SKILLS, type SkillDef } from '@/data/museum'
import type { Interactable, RoomContext, RoomRuntime } from '../types'
import { emissiveMaterial, flatMaterial, hex } from '../materials'
import { addCaption, addPlaque, addPoint, clamp01 } from './common'

/**
 * Room V — The Constellation.
 *
 * Every discipline suspended at the height it was first used. Sixteen orbs, but
 * only fifteen of them are lit — the sixteenth has been dark since the refit and
 * sits low enough that you have to be looking for it.
 *
 * Lighting it draws every line in the constellation at once.
 */

const GROUP_COLORS: Record<SkillDef['group'], string> = {
  render: '#7dd3fc',
  craft: '#c4b5fd',
  motion: '#fca5a5',
  sound: '#86efac',
}

interface Orb {
  mesh: Mesh
  material: StandardMaterial
  home: Vector3
  phase: number
  color: string
  /** The dark one. */
  dead: boolean
}

export function buildSkills(ctx: RoomContext): RoomRuntime {
  const { scene, room } = ctx
  const p = room.palette
  const cx = room.center.x
  const cz = room.center.z

  const lights: Light[] = []

  const ambient = new HemisphericLight('skills-ambient', new Vector3(0, 1, 0), scene)
  ambient.intensity = 0.1
  ambient.diffuse = hex(p.secondary)
  ambient.groundColor = hex('#03060c')
  lights.push(ambient)

  // Two soft fills so the orbs are not floating in absolute void.
  lights.push(
    addPoint(scene, 'skills-fill-a', new Vector3(cx, room.height * 0.75, cz), {
      intensity: 9,
      color: p.accent,
      range: 30,
    }),
  )
  lights.push(
    addPoint(scene, 'skills-fill-b', new Vector3(cx, 1.4, cz), {
      intensity: 5,
      color: p.secondary,
      range: 20,
    }),
  )

  /* -------------------------------------------------------------- *
   * A pedestal, so the room has a floor you read from
   * -------------------------------------------------------------- */

  const dais = CreateCylinder(
    'skills-dais',
    { diameterTop: 9, diameterBottom: 10, height: 0.3, tessellation: 64 },
    scene,
  )
  dais.position.set(cx, 0.15, cz)
  dais.material = flatMaterial(scene, 'skills-dais-mat', '#141b25')
  dais.checkCollisions = true
  dais.receiveShadows = true
  dais.freezeWorldMatrix()

  /* -------------------------------------------------------------- *
   * The orbs, on a spherical shell
   * -------------------------------------------------------------- */

  const orbs: Orb[] = []
  const shellRadius = 6.4
  const shellCenter = new Vector3(cx, 6.2, cz)

  const place = (skill: SkillDef, index: number, total: number, dead: boolean) => {
    // Fibonacci sphere, so nothing clusters and nothing lines up.
    const y = 1 - (index / Math.max(1, total - 1)) * 1.55
    const radius = Math.sqrt(Math.max(0.05, 1 - y * y))
    const theta = index * 2.399963

    const home = dead
      ? // The dark one sits below the shell, near the floor, behind the dais edge.
        new Vector3(cx + 3.4, 1.15, cz - 3.9)
      : new Vector3(
          shellCenter.x + Math.cos(theta) * radius * shellRadius,
          shellCenter.y + y * shellRadius * 0.72,
          shellCenter.z + Math.sin(theta) * radius * shellRadius,
        )

    const color = GROUP_COLORS[skill.group]
    const mesh = CreateSphere(`skills-orb-${index}`, { diameter: dead ? 0.44 : 0.52, segments: 16 }, scene)
    mesh.position.copyFrom(home)
    const material = emissiveMaterial(
      scene,
      `skills-orb-mat-${index}`,
      dead ? '#2a3038' : color,
      dead ? 0.25 : 1.4,
    )
    mesh.material = material
    mesh.isPickable = false

    addCaption(
      scene,
      `skills-label-${index}`,
      home.add(new Vector3(0, dead ? -0.5 : -0.62, 0)),
      skill.label,
      dead ? '#6b7480' : color,
      { width: 1.5, size: 74 },
    )

    orbs.push({ mesh, material, home, phase: index * 1.7, color, dead })
  }

  SKILLS.forEach((skill, i) => place(skill, i, SKILLS.length, false))
  place(DARK_SKILL, SKILLS.length, SKILLS.length + 1, true)

  const darkOrb = orbs[orbs.length - 1]

  /* -------------------------------------------------------------- *
   * The lines between them — built once, revealed on discovery
   * -------------------------------------------------------------- */

  const linkPairs: Array<[number, number]> = []
  for (let i = 0; i < SKILLS.length; i++) {
    for (let j = i + 1; j < SKILLS.length; j++) {
      // Same discipline, or close enough in space to be worth drawing.
      const sameGroup = SKILLS[i].group === SKILLS[j].group
      const distance = Vector3.Distance(orbs[i].home, orbs[j].home)
      if (sameGroup || distance < 4.4) linkPairs.push([i, j])
    }
  }
  // Everything connects to the dark one once it wakes up.
  for (let i = 0; i < SKILLS.length; i += 3) linkPairs.push([i, orbs.length - 1])

  const links: LinesMesh[] = linkPairs.map(([a, b], i) => {
    const mesh = CreateLines(`skills-link-${i}`, { points: [orbs[a].home, orbs[b].home] }, scene)
    mesh.color = Color3.FromHexString(orbs[a].color)
    mesh.alpha = 0.05
    mesh.isPickable = false
    mesh.freezeWorldMatrix()
    return mesh
  })

  addPlaque(scene, room, new Vector3(cx - room.size.w / 2 + 0.4, 2.6, cz + 4), Math.PI / 2, 'V')
    .isPickable = false

  /* -------------------------------------------------------------- *
   * State
   * -------------------------------------------------------------- */

  let closed = false
  let closing = 0
  let afterHours = false
  let pulseValue = 0

  const trigger: Interactable = {
    id: 'skills-dark-orb',
    position: darkOrb.home.clone(),
    radius: 2.6,
    prompt: 'Light the dark lamp',
    activate: () => {
      if (closed) return
      closed = true
      trigger.prompt = undefined
      return 'supernova'
    },
  }

  return {
    id: room.id,

    interactables: [trigger],

    update(dt, t) {
      if (closed && closing < 1) closing = clamp01(closing + dt * 0.85)
      if (pulseValue > 0) pulseValue = Math.max(0, pulseValue - dt * 0.8)

      const dim = afterHours ? 1.25 : 1 // the constellation is *better* in the dark

      for (const orb of orbs) {
        // Each orb drifts on its own slow orbit around where it belongs.
        const bob = Math.sin(t * 0.55 + orb.phase) * 0.24
        const sway = Math.cos(t * 0.37 + orb.phase * 1.3) * 0.18
        orb.mesh.position.set(orb.home.x + sway, orb.home.y + bob, orb.home.z + sway * 0.6)

        if (orb.dead) {
          // Comes up from a dead grey to the brightest thing in the room.
          const lit = closing
          orb.material.emissiveColor = hex('#2a3038')
            .scale(1 - lit)
            .add(hex('#ffffff').scale(lit * (2.6 + Math.sin(t * 3) * 0.3)))
          orb.mesh.scaling.setAll(1 + lit * 1.5)
          continue
        }

        const shimmer = 1.4 + Math.sin(t * 1.4 + orb.phase) * 0.22
        orb.material.emissiveColor = hex(orb.color).scale(
          (shimmer + closing * 1.1 + pulseValue) * dim,
        )
        orb.mesh.scaling.setAll(1 + closing * 0.25)
      }

      // Lines fade in together, then settle to a readable weight.
      const settle = closing > 0.7 ? 1 - (closing - 0.7) * 0.5 : closing
      const alpha = 0.05 + settle * 0.55 + pulseValue * 0.2
      for (let i = 0; i < links.length; i++) {
        // A slow travelling shimmer along the index, so the web feels alive.
        const wave = 0.85 + Math.sin(t * 1.6 - i * 0.35) * 0.15
        links[i].alpha = alpha * wave
      }
    },

    setActive(active) {
      lights.forEach((light) => light.setEnabled(active))
      links.forEach((link) => link.setEnabled(active))
    },

    setAfterHours(on) {
      afterHours = on
      ambient.intensity = on ? 0.04 : 0.1
    },

    pulse() {
      pulseValue = 1
    },
  }
}
