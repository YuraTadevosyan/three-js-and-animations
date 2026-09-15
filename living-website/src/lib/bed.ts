/**
 * The garden bed's coordinate space.
 *
 * These are model units, not pixels — the bed renders into a fixed SVG
 * viewBox, so both the simulation and the renderer can work in the same
 * resolution-independent space. Pollinators need real positions to navigate
 * toward flowers, which means this can't live in the component alone.
 */
export const BED_W = 1000
export const BED_H = 340

/** The soil line. Plants are anchored here; +y in bed space is downward. */
export const SOIL_Y = 288

/** Margin so a plant at x = 0 or 1 still sits fully inside the bed. */
const EDGE = 60

/** A plant's normalised x (0..1) to its anchor in bed units. */
export const plantX = (x: number) => EDGE + x * (BED_W - EDGE * 2)
