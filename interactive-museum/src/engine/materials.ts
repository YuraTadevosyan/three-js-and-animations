import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import type { Scene } from '@babylonjs/core/scene'
import { makePlasterTexture, makeStoneTexture } from './textures'

/**
 * StandardMaterial throughout, deliberately.
 *
 * PBR metals need an environment probe to reflect or they render black, and a
 * museum is mostly matte plaster and stone lit by a handful of hard sources —
 * which is exactly the case StandardMaterial's diffuse/specular model handles
 * well, at a fraction of the per-light cost across six rooms.
 */

export const hex = (value: string) => Color3.FromHexString(value)

/** Six lights can hit one surface before Babylon starts dropping them. */
const MAX_LIGHTS = 6

function base(scene: Scene, name: string) {
  const mat = new StandardMaterial(name, scene)
  mat.maxSimultaneousLights = MAX_LIGHTS
  return mat
}

export function stoneMaterial(scene: Scene, name: string, color: string, vein: string, tile = 6) {
  const mat = base(scene, name)
  const tex = makeStoneTexture(scene, color, vein, name.length * 13 + 5)
  tex.uScale = tile
  tex.vScale = tile
  mat.diffuseTexture = tex
  mat.specularColor = new Color3(0.16, 0.15, 0.13)
  mat.specularPower = 48
  return mat
}

export function plasterMaterial(scene: Scene, name: string, color: string, tile = 4) {
  const mat = base(scene, name)
  const tex = makePlasterTexture(scene, color, name.length * 7 + 11)
  tex.uScale = tile
  tex.vScale = tile
  mat.diffuseTexture = tex
  mat.specularColor = new Color3(0.03, 0.03, 0.03)
  return mat
}

export function flatMaterial(scene: Scene, name: string, color: string) {
  const mat = base(scene, name)
  mat.diffuseColor = hex(color)
  mat.specularColor = new Color3(0.04, 0.04, 0.04)
  return mat
}

/** Polished metal — reads as brass under a warm spot, steel under a cold one. */
export function metalMaterial(scene: Scene, name: string, color: string, polish = 0.8) {
  const mat = base(scene, name)
  mat.diffuseColor = hex(color).scale(0.55)
  mat.specularColor = hex(color).scale(polish)
  mat.specularPower = 96
  mat.emissiveColor = hex(color).scale(0.05)
  return mat
}

/** Self-lit surfaces — these are what the glow layer picks up. */
export function emissiveMaterial(scene: Scene, name: string, color: string, intensity = 1) {
  const mat = base(scene, name)
  mat.emissiveColor = hex(color).scale(intensity)
  mat.diffuseColor = hex(color).scale(0.12)
  mat.specularColor = Color3.Black()
  mat.disableLighting = true
  return mat
}

/** Framed artwork: lit by the room, with just enough self-light to read. */
export function artworkMaterial(scene: Scene, name: string, texture: Texture) {
  const mat = base(scene, name)
  mat.diffuseTexture = texture
  mat.emissiveTexture = texture
  mat.emissiveColor = new Color3(0.16, 0.16, 0.16)
  mat.specularColor = new Color3(0.06, 0.06, 0.06)
  return mat
}

/** Signage: unlit so it stays legible wherever it hangs. */
export function signMaterial(scene: Scene, name: string, texture: Texture, hasAlpha = false) {
  const mat = base(scene, name)
  mat.diffuseTexture = texture
  mat.emissiveTexture = texture
  mat.emissiveColor = new Color3(0.85, 0.85, 0.85)
  mat.disableLighting = true
  mat.specularColor = Color3.Black()
  if (hasAlpha) {
    // The caption canvases are drawn on transparent ground, so the alpha comes
    // from the diffuse texture itself. Assigning it as an opacityTexture too
    // would make Babylon sample the same map twice and darken the edges.
    texture.hasAlpha = true
    mat.useAlphaFromDiffuseTexture = true
    mat.backFaceCulling = false
  }
  return mat
}

/** Additive haze used for light shafts and glows — never occludes. */
export function hazeMaterial(scene: Scene, name: string, color: string, alpha = 0.06) {
  const mat = base(scene, name)
  mat.emissiveColor = hex(color)
  mat.diffuseColor = Color3.Black()
  mat.specularColor = Color3.Black()
  mat.disableLighting = true
  mat.alpha = alpha
  mat.alphaMode = 1 /* ALPHA_ADD */
  mat.backFaceCulling = false
  mat.disableDepthWrite = true
  return mat
}
