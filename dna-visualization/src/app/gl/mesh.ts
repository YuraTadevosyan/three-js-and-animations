import type { MeshData } from './geometry';

interface AttributeRecord {
  buffer: WebGLBuffer;
  location: number;
  size: number;
  divisor: number;
  /** Capacity in floats, so growth can be detected without re-reading the GPU. */
  capacity: number;
}

/**
 * A VAO plus the buffers feeding it.
 *
 * Attribute locations are assigned explicitly by the caller (via `layout` in
 * the shader) rather than looked up by name, so a mesh can be shared between
 * programs that agree on the layout.
 */
export class Mesh {
  readonly vao: WebGLVertexArrayObject;
  private readonly attributes = new Map<string, AttributeRecord>();
  private indexBuffer: WebGLBuffer | null = null;
  private indexCount = 0;
  private indexType: number;

  constructor(private readonly gl: WebGL2RenderingContext) {
    const vao = gl.createVertexArray();
    if (!vao) throw new Error('createVertexArray failed');
    this.vao = vao;
    this.indexType = gl.UNSIGNED_SHORT;
  }

  /** Build from a {@link MeshData}, wiring whichever streams the caller wants. */
  static fromData(
    gl: WebGL2RenderingContext,
    data: MeshData,
    locations: { position?: number; normal?: number; param?: number },
  ): Mesh {
    const mesh = new Mesh(gl);
    if (locations.position !== undefined && data.positions.length) {
      mesh.attribute('position', locations.position, data.positions, 3);
    }
    if (locations.normal !== undefined && data.normals.length) {
      mesh.attribute('normal', locations.normal, data.normals, 3);
    }
    if (locations.param !== undefined && data.params?.length) {
      mesh.attribute('param', locations.param, data.params, 2);
    }
    mesh.indices(data.indices);
    return mesh;
  }

  /**
   * Define or replace a vertex/instance attribute.
   * `divisor: 1` makes it advance per instance instead of per vertex.
   */
  attribute(
    name: string,
    location: number,
    data: Float32Array,
    size: number,
    divisor = 0,
    usage?: number,
  ): this {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);

    let record = this.attributes.get(name);
    if (!record) {
      const buffer = gl.createBuffer();
      if (!buffer) throw new Error(`createBuffer failed for attribute "${name}"`);
      record = { buffer, location, size, divisor, capacity: 0 };
      this.attributes.set(name, record);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, record.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage ?? (divisor ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW));
    record.capacity = data.length;

    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(location, divisor);

    gl.bindVertexArray(null);
    return this;
  }

  /**
   * Re-upload an existing attribute's contents. Uses `bufferSubData` while the
   * data still fits, so per-frame instance updates don't reallocate.
   */
  update(name: string, data: Float32Array): this {
    const record = this.attributes.get(name);
    if (!record) throw new Error(`unknown attribute "${name}"`);
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, record.buffer);
    if (data.length <= record.capacity) {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
    } else {
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
      record.capacity = data.length;
    }
    return this;
  }

  indices(data: Uint16Array | Uint32Array): this {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    if (!this.indexBuffer) {
      this.indexBuffer = gl.createBuffer();
      if (!this.indexBuffer) throw new Error('createBuffer failed for indices');
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
    this.indexCount = data.length;
    this.indexType = data instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
    gl.bindVertexArray(null);
    return this;
  }

  /** Draw indexed triangles; pass an instance count to use instancing. */
  draw(instanceCount = 0): void {
    if (this.indexCount === 0 || instanceCount < 0) return;
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    if (instanceCount === 0) {
      gl.drawElements(gl.TRIANGLES, this.indexCount, this.indexType, 0);
    } else {
      gl.drawElementsInstanced(gl.TRIANGLES, this.indexCount, this.indexType, 0, instanceCount);
    }
    gl.bindVertexArray(null);
  }

  dispose(): void {
    const gl = this.gl;
    for (const { buffer } of this.attributes.values()) gl.deleteBuffer(buffer);
    this.attributes.clear();
    if (this.indexBuffer) gl.deleteBuffer(this.indexBuffer);
    gl.deleteVertexArray(this.vao);
  }
}

/** Shared attribute locations. Every shader in the app agrees on these. */
export const ATTR = {
  position: 0,
  normal: 1,
  param: 2,
  /** Instance streams start here. */
  instance0: 3,
  instance1: 4,
  instance2: 5,
  instance3: 6,
} as const;
