import renderCode from './holo.wgsl?raw'
import simCode from './holo-sim.wgsl?raw'
import { fitCanvas, type Gpu } from './device'
import type { Scene } from '@/eras/scifi/scene'

/** Everything a hologram frame needs, shared by the WebGPU and 2D renderers. */
export interface HoloFrame {
  viewProj: Float32Array
  right: readonly number[]
  up: readonly number[]
  time: number
  dpr: number
  /** 0 → 1 as the points fly in from the glass panels. */
  arrival: number
  /** 0 → 1 as everything collapses into one point. */
  collapse: number
  /** ndc x, ndc y, hovering 0/1, strength. */
  pointer: readonly [number, number, number, number]
  dt: number
  aspect: number
  scanX: number
  /** 0 → 1 for an expanding ring of light, or -1 for none. */
  pulse: number
  /** Skip the physics pass (reduced motion). */
  still: boolean
}

export interface HoloRenderer {
  readonly count: number
  setStarts(starts: Float32Array): void
  frame(f: HoloFrame): void
  destroy(): void
}

const UBO_SIZE = 144

/** WebGPU: a compute pass for the springs, then one instanced draw. */
export class GpuHolo implements HoloRenderer {
  private u = new Float32Array(UBO_SIZE / 4)

  private constructor(
    private gpu: Gpu,
    private canvas: HTMLCanvasElement,
    private ctx: GPUCanvasContext,
    readonly count: number,
    private ubo: GPUBuffer,
    private buffers: GPUBuffer[],
    private startBuf: GPUBuffer,
    private sim: GPUComputePipeline,
    private simBind: GPUBindGroup,
    private draw: GPURenderPipeline,
    private drawBind: GPUBindGroup,
  ) {}

  static async create(gpu: Gpu, canvas: HTMLCanvasElement, scene: Scene): Promise<GpuHolo | null> {
    const { device, format } = gpu
    const ctx = canvas.getContext('webgpu')
    if (!ctx) return null
    try {
      ctx.configure({ device, format, alphaMode: 'premultiplied' })
      const n = scene.count
      const V = GPUBufferUsage.VERTEX
      const S = GPUBufferUsage.STORAGE
      const D = GPUBufferUsage.COPY_DST
      const make = (usage: number, data?: Float32Array) => {
        const b = device.createBuffer({ size: n * 16, usage, mappedAtCreation: !!data })
        if (data) {
          new Float32Array(b.getMappedRange()).set(data)
          b.unmap()
        }
        return b
      }
      const baseBuf = make(V | S | D, scene.base)
      const colorBuf = make(V | D, scene.color)
      const startBuf = make(V | D)
      const offsBuf = make(V | S | D) // zero-initialised by WebGPU
      const velBuf = make(S | D)
      const ubo = device.createBuffer({ size: UBO_SIZE, usage: GPUBufferUsage.UNIFORM | D })

      const simModule = device.createShaderModule({ code: simCode })
      const drawModule = device.createShaderModule({ code: renderCode })
      const inst = (loc: number): GPUVertexBufferLayout => ({
        arrayStride: 16,
        stepMode: 'instance',
        attributes: [{ shaderLocation: loc, offset: 0, format: 'float32x4' }],
      })
      const add: GPUBlendComponent = { srcFactor: 'one', dstFactor: 'one', operation: 'add' }
      const [sim, draw] = await Promise.all([
        device.createComputePipelineAsync({ layout: 'auto', compute: { module: simModule, entryPoint: 'simulate' } }),
        device.createRenderPipelineAsync({
          layout: 'auto',
          vertex: { module: drawModule, entryPoint: 'vs', buffers: [inst(0), inst(1), inst(2), inst(3)] },
          fragment: { module: drawModule, entryPoint: 'fs', targets: [{ format, blend: { color: add, alpha: add } }] },
          primitive: { topology: 'triangle-list' },
        }),
      ])
      const simBind = device.createBindGroup({
        layout: sim.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: ubo } },
          { binding: 1, resource: { buffer: baseBuf } },
          { binding: 2, resource: { buffer: offsBuf } },
          { binding: 3, resource: { buffer: velBuf } },
        ],
      })
      const drawBind = device.createBindGroup({
        layout: draw.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: ubo } }],
      })
      return new GpuHolo(gpu, canvas, ctx, n, ubo, [baseBuf, colorBuf, startBuf, offsBuf, velBuf], startBuf, sim, simBind, draw, drawBind)
    } catch (err) {
      console.warn('[evolution-of-ui] Hologram pipeline failed, using the 2D fallback.', err)
      return null
    }
  }

  setStarts(starts: Float32Array): void {
    this.gpu.device.queue.writeBuffer(this.startBuf, 0, starts)
  }

  frame(f: HoloFrame): void {
    fitCanvas(this.canvas)
    const u = this.u
    u.set(f.viewProj, 0)
    u[16] = f.right[0]
    u[17] = f.right[1]
    u[18] = f.right[2]
    u[19] = f.time
    u[20] = f.up[0]
    u[21] = f.up[1]
    u[22] = f.up[2]
    u[23] = f.dpr
    u[24] = this.canvas.width
    u[25] = this.canvas.height
    u[26] = f.arrival
    u[27] = f.collapse
    u.set(f.pointer, 28)
    u[32] = f.dt
    u[33] = f.aspect
    u[34] = f.scanX
    u[35] = f.pulse

    const { device } = this.gpu
    device.queue.writeBuffer(this.ubo, 0, u)
    const enc = device.createCommandEncoder()
    if (!f.still) {
      const cp = enc.beginComputePass()
      cp.setPipeline(this.sim)
      cp.setBindGroup(0, this.simBind)
      cp.dispatchWorkgroups(Math.ceil(this.count / 64))
      cp.end()
    }
    const rp = enc.beginRenderPass({
      colorAttachments: [
        {
          view: this.ctx.getCurrentTexture().createView(),
          loadOp: 'clear',
          storeOp: 'store',
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
        },
      ],
    })
    rp.setPipeline(this.draw)
    rp.setBindGroup(0, this.drawBind)
    for (let k = 0; k < 4; k++) rp.setVertexBuffer(k, this.buffers[k])
    rp.draw(6, this.count)
    rp.end()
    device.queue.submit([enc.finish()])
  }

  destroy(): void {
    for (const b of this.buffers) b.destroy()
    this.ubo.destroy()
    this.ctx.unconfigure()
  }
}
