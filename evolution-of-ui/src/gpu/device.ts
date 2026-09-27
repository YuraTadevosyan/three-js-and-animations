/**
 * One GPUDevice for the whole page. The DOS CRT and the 2040 hologram each
 * configure their own canvas context against it.
 *
 * Append `?gpu=off` to the URL to force every era onto its fallback path.
 */

export interface Gpu {
  device: GPUDevice
  format: GPUTextureFormat
}

let pending: Promise<Gpu | null> | null = null

export const gpuDisabled = (): boolean =>
  typeof location !== 'undefined' && new URLSearchParams(location.search).get('gpu') === 'off'

export function getGpu(): Promise<Gpu | null> {
  if (!pending) {
    pending = (async () => {
      if (gpuDisabled() || typeof navigator === 'undefined' || !('gpu' in navigator)) return null
      try {
        const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' })
        if (!adapter) return null
        const device = await adapter.requestDevice()
        device.lost.then((info) => {
          // Let the next caller try again; renderers holding the old device
          // will simply stop drawing.
          console.warn('[evolution-of-ui] WebGPU device lost:', info.message)
          pending = null
        })
        return { device, format: navigator.gpu.getPreferredCanvasFormat() }
      } catch (err) {
        console.warn('[evolution-of-ui] WebGPU unavailable, using fallbacks.', err)
        return null
      }
    })()
  }
  return pending
}

/** Size a canvas's backing store to its CSS box, capped at 2× DPR. */
export function fitCanvas(canvas: HTMLCanvasElement, maxDpr = 2): boolean {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
  const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
  const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
  if (canvas.width === w && canvas.height === h) return false
  canvas.width = w
  canvas.height = h
  return true
}
