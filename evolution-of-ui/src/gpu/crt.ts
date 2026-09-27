import shader from './crt.wgsl?raw'
import { fitCanvas, type Gpu } from './device'

export interface CrtFrame {
  time: number
  power: number
  glitch: number
  flicker: boolean
}

/** Draws a text canvas through a CRT shader onto a WebGPU canvas. */
export class CrtRenderer {
  private uniforms = new Float32Array(8)

  private constructor(
    private gpu: Gpu,
    private canvas: HTMLCanvasElement,
    private source: HTMLCanvasElement,
    private ctx: GPUCanvasContext,
    private pipeline: GPURenderPipeline,
    private ubo: GPUBuffer,
    private texture: GPUTexture,
    private bind: GPUBindGroup,
  ) {}

  static async create(gpu: Gpu, canvas: HTMLCanvasElement, source: HTMLCanvasElement): Promise<CrtRenderer | null> {
    const { device, format } = gpu
    const ctx = canvas.getContext('webgpu')
    if (!ctx) return null
    try {
      ctx.configure({ device, format, alphaMode: 'opaque' })
      const module = device.createShaderModule({ code: shader })
      const pipeline = await device.createRenderPipelineAsync({
        layout: 'auto',
        vertex: { module, entryPoint: 'vs' },
        fragment: { module, entryPoint: 'fs', targets: [{ format }] },
        primitive: { topology: 'triangle-list' },
      })
      const ubo = device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST })
      const texture = device.createTexture({
        size: [source.width, source.height],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      })
      const sampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge',
      })
      const bind = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: ubo } },
          { binding: 1, resource: sampler },
          { binding: 2, resource: texture.createView() },
        ],
      })
      return new CrtRenderer(gpu, canvas, source, ctx, pipeline, ubo, texture, bind)
    } catch (err) {
      console.warn('[evolution-of-ui] CRT pipeline failed, using the DOM screen.', err)
      return null
    }
  }

  /** Copy the text canvas into the texture. Call after redrawing it. */
  upload(): void {
    this.gpu.device.queue.copyExternalImageToTexture({ source: this.source }, { texture: this.texture }, [
      this.source.width,
      this.source.height,
    ])
  }

  frame(f: CrtFrame): void {
    fitCanvas(this.canvas)
    const u = this.uniforms
    u[0] = this.canvas.width
    u[1] = this.canvas.height
    u[2] = this.source.width
    u[3] = this.source.height
    u[4] = f.time
    u[5] = f.power
    u[6] = f.glitch
    u[7] = f.flicker ? 1 : 0
    const { device } = this.gpu
    device.queue.writeBuffer(this.ubo, 0, u)
    const encoder = device.createCommandEncoder()
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.ctx.getCurrentTexture().createView(),
          loadOp: 'clear',
          storeOp: 'store',
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
      ],
    })
    pass.setPipeline(this.pipeline)
    pass.setBindGroup(0, this.bind)
    pass.draw(3)
    pass.end()
    device.queue.submit([encoder.finish()])
  }

  destroy(): void {
    this.texture.destroy()
    this.ubo.destroy()
    this.ctx.unconfigure()
  }
}
