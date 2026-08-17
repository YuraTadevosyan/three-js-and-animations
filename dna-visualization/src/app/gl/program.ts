import type { Mat3, Mat4 } from './math';

/**
 * A compiled GLSL ES 3.00 program with a lazy uniform-location cache.
 *
 * Uniform lookups go through `loc()`, which caches misses as `null` too — a
 * uniform optimised out by the driver then costs one map hit per frame instead
 * of a `getUniformLocation` call, and setting it is a silent no-op.
 */
export class Program {
  readonly program: WebGLProgram;
  private readonly locations = new Map<string, WebGLUniformLocation | null>();

  constructor(
    private readonly gl: WebGL2RenderingContext,
    vertexSource: string,
    fragmentSource: string,
    private readonly label: string,
  ) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSource, `${label}:vertex`);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource, `${label}:fragment`);

    const program = gl.createProgram();
    if (!program) throw new Error(`[${label}] createProgram failed`);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    // Shaders are reference-counted by the program; drop our handles either way.
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`[${label}] link failed:\n${log}`);
    }

    this.program = program;
  }

  use(): this {
    this.gl.useProgram(this.program);
    return this;
  }

  loc(name: string): WebGLUniformLocation | null {
    let location = this.locations.get(name);
    if (location === undefined) {
      location = this.gl.getUniformLocation(this.program, name);
      this.locations.set(name, location);
    }
    return location;
  }

  f(name: string, v: number): this {
    this.gl.uniform1f(this.loc(name), v);
    return this;
  }

  i(name: string, v: number): this {
    this.gl.uniform1i(this.loc(name), v);
    return this;
  }

  v2(name: string, x: number, y: number): this {
    this.gl.uniform2f(this.loc(name), x, y);
    return this;
  }

  v3(name: string, x: number, y: number, z: number): this {
    this.gl.uniform3f(this.loc(name), x, y, z);
    return this;
  }

  v3a(name: string, v: readonly [number, number, number]): this {
    this.gl.uniform3f(this.loc(name), v[0], v[1], v[2]);
    return this;
  }

  v4(name: string, x: number, y: number, z: number, w: number): this {
    this.gl.uniform4f(this.loc(name), x, y, z, w);
    return this;
  }

  m4(name: string, m: Mat4): this {
    this.gl.uniformMatrix4fv(this.loc(name), false, m);
    return this;
  }

  m3(name: string, m: Mat3): this {
    this.gl.uniformMatrix3fv(this.loc(name), false, m);
    return this;
  }

  /** Bind a texture to a unit and point the sampler uniform at it. */
  tex(name: string, unit: number, texture: WebGLTexture | null): this {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(this.loc(name), unit);
    return this;
  }

  dispose(): void {
    this.gl.deleteProgram(this.program);
    this.locations.clear();
  }

  toString(): string {
    return `Program(${this.label})`;
  }
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
  label: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error(`[${label}] createShader failed`);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? '';
    gl.deleteShader(shader);
    throw new Error(`[${label}] compile failed:\n${log}\n\n${numberLines(log, source)}`);
  }
  return shader;
}

/**
 * Reprint the source with line numbers, keeping only a window around each line
 * the driver complained about. Full dumps of a 400-line shader bury the error.
 */
function numberLines(log: string, source: string): string {
  const lines = source.split('\n');
  const bad = new Set<number>();
  for (const match of log.matchAll(/ERROR:\s*\d+:(\d+)/g)) {
    bad.add(Number(match[1]));
  }

  const keep = new Set<number>();
  for (const line of bad) {
    for (let i = line - 4; i <= line + 4; i++) {
      if (i >= 1 && i <= lines.length) keep.add(i);
    }
  }
  if (keep.size === 0) return lines.map((l, i) => `${pad(i + 1)}| ${l}`).join('\n');

  const out: string[] = [];
  let previous = 0;
  for (const n of [...keep].sort((a, b) => a - b)) {
    if (n !== previous + 1) out.push('    ⋯');
    out.push(`${pad(n)}|${bad.has(n) ? '>' : ' '} ${lines[n - 1]}`);
    previous = n;
  }
  return out.join('\n');
}

const pad = (n: number): string => String(n).padStart(4, ' ');
