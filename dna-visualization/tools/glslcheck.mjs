/**
 * Static sanity check for the GLSL embedded in this project's TypeScript.
 *
 * Extracts every `/* glsl *\/` template literal, resolves the ${CHUNK}
 * interpolations against the real chunk sources, then verifies that:
 *   - every uniform / attribute / varying an identifier reads is declared
 *   - every function called is defined, a builtin, or a constructor
 *   - VS `out` varyings match the paired FS `in` varyings
 *   - no GLSL reserved word is used as an identifier
 *
 * Not a compiler, but it catches the class of mistake that otherwise only
 * shows up as a black screen.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.argv[2] ?? new URL('../src/app', import.meta.url).pathname;

const files = [];
for (const dir of ['gl', 'stages']) {
  for (const name of readdirSync(join(ROOT, dir))) {
    if (name.endsWith('.ts')) files.push(join(ROOT, dir, name));
  }
}

// --- Extract every `name = /* glsl */ `...`` template -----------------------
const sources = new Map(); // constName -> raw template text
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const re = /const (\w+) = \/\* glsl \*\/ `([\s\S]*?)\n`;/g;
  let m;
  while ((m = re.exec(text))) {
    const isProgram = /\bvoid\s+main\s*\(/.test(m[2]);
    const key = isProgram ? `${file.split('/').pop()}:${m[1]}` : m[1];
    if (sources.has(key)) throw new Error(`duplicate shader key ${key}`);
    sources.set(key, { body: m[2], file, name: m[1] });
  }
}

const ATTR = { position: 0, normal: 1, param: 2, instance0: 3, instance1: 4, instance2: 5, instance3: 6 };

function resolve(body, seen = new Set()) {
  return body.replace(/\$\{([^}]+)\}/g, (_, expr) => {
    const trimmed = expr.trim();
    if (trimmed.startsWith('ATTR.')) return String(ATTR[trimmed.slice(5)]);
    if (sources.has(trimmed)) {
      if (seen.has(trimmed)) return '';
      return resolve(sources.get(trimmed).body, new Set([...seen, trimmed]));
    }
    return `/*UNRESOLVED:${trimmed}*/`;
  });
}

const BUILTINS = new Set(`
abs acos acosh all any asin asinh atan atanh ceil clamp cos cosh cross degrees
determinant dFdx dFdy distance dot equal exp exp2 faceforward floatBitsToInt
floatBitsToUint floor fract frexp fwidth greaterThan greaterThanEqual intBitsToFloat
inverse inversesqrt isinf isnan ldexp length lessThan lessThanEqual log log2
matrixCompMult max min mix mod modf normalize not notEqual outerProduct packHalf2x16
packSnorm2x16 packUnorm2x16 pow radians reflect refract round roundEven sign sin sinh
smoothstep sqrt step tan tanh texelFetch texelFetchOffset texture textureGrad
textureLod textureOffset textureProj textureSize transpose trunc uintBitsToFloat
unpackHalf2x16 unpackSnorm2x16 unpackUnorm2x16
vec2 vec3 vec4 ivec2 ivec3 ivec4 uvec2 uvec3 uvec4 bvec2 bvec3 bvec4
mat2 mat3 mat4 mat2x2 mat2x3 mat2x4 mat3x2 mat3x3 mat3x4 mat4x2 mat4x3 mat4x4
float int uint bool main if for while return discard
layout precision struct switch case do else
`.trim().split(/\s+/));

const RESERVED = new Set(`
flat smooth noperspective sample patch subroutine common partition active asm class
union enum typedef template this packed goto inline noinline volatile public static
extern external interface long short double half fixed unsigned superp input output
hvec2 hvec3 hvec4 fvec2 fvec3 fvec4 dvec2 dvec3 dvec4 sizeof cast namespace using
row_major filter attribute varying
`.trim().split(/\s+/));

const problems = [];

function analyse(name, src) {
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ');

  // Declarations -----------------------------------------------------------
  const declared = new Set(['gl_Position', 'gl_FragCoord', 'gl_VertexID', 'gl_InstanceID',
    'gl_FrontFacing', 'gl_PointSize', 'gl_FragDepth', 'gl_PointCoord']);
  const functions = new Set();
  const outs = new Set();
  const ins = new Set();

  for (const m of stripped.matchAll(/\buniform\s+\w+\s+(\w+)/g)) declared.add(m[1]);
  for (const m of stripped.matchAll(/\b(?:layout\s*\([^)]*\)\s*)?in\s+\w+\s+(\w+)\s*;/g)) {
    declared.add(m[1]); ins.add(m[1]);
  }
  for (const m of stripped.matchAll(/\bout\s+\w+\s+(\w+)\s*;/g)) { declared.add(m[1]); outs.add(m[1]); }
  for (const m of stripped.matchAll(/\bconst\s+\w+\s+(\w+)\s*=/g)) declared.add(m[1]);

  // Function definitions and their parameters.
  for (const m of stripped.matchAll(/\b(\w+)\s+(\w+)\s*\(([^)]*)\)\s*\{/g)) {
    functions.add(m[2]);
    for (const param of m[3].split(',')) {
      const parts = param.trim().split(/\s+/);
      if (parts.length >= 2) declared.add(parts[parts.length - 1]);
    }
  }

  // Local variable declarations, incl. multi-declarators like `vec3 n, bi;`.
  const TYPES = 'float|int|uint|bool|vec2|vec3|vec4|ivec2|ivec3|ivec4|uvec2|uvec3|uvec4|bvec2|bvec3|bvec4|mat2|mat3|mat4|sampler2D';
  for (const m of stripped.matchAll(new RegExp(`\\b(?:${TYPES})\\s+([^;=(){}]+)[;=]`, 'g'))) {
    for (const part of m[1].split(',')) {
      const id = part.trim().split(/[\s\[]/)[0];
      if (/^[A-Za-z_]\w*$/.test(id)) declared.add(id);
    }
  }
  for (const m of stripped.matchAll(/\bfor\s*\(\s*\w+\s+(\w+)/g)) declared.add(m[1]);

  // Usage ------------------------------------------------------------------
  for (const m of stripped.matchAll(/\b([A-Za-z_]\w*)\s*\(/g)) {
    const id = m[1];
    if (!BUILTINS.has(id) && !functions.has(id) && !declared.has(id)) {
      problems.push(`${name}: calls undefined function '${id}'`);
    }
  }

  for (const m of stripped.matchAll(/\bu[A-Z]\w*/g)) {
    if (!declared.has(m[0])) problems.push(`${name}: uses undeclared uniform '${m[0]}'`);
  }
  for (const m of stripped.matchAll(/\bv[A-Z]\w*/g)) {
    if (!declared.has(m[0]) && !BUILTINS.has(m[0])) {
      problems.push(`${name}: uses undeclared varying '${m[0]}'`);
    }
  }
  for (const m of stripped.matchAll(/\b(?:float|int|vec2|vec3|vec4|mat3|mat4)\s+(\w+)/g)) {
    if (RESERVED.has(m[1])) problems.push(`${name}: '${m[1]}' is a GLSL reserved word`);
  }

  // Every `out` in a vertex shader must be written to somewhere.
  for (const name2 of outs) {
    if (!new RegExp(`\\b${name2}\\s*(=|\\.\\w+\\s*=)`).test(stripped)) {
      problems.push(`${name}: declares out '${name2}' but never assigns it`);
    }
  }

  return { outs, ins, declared };
}

const analysed = new Map();
for (const [name, { body }] of sources) {
  const src = resolve(body);
  if (src.includes('UNRESOLVED')) {
    problems.push(`${name}: unresolved interpolation ${src.match(/UNRESOLVED:[^*]+/)[0]}`);
  }
  // Chunks are fragments spliced into other shaders, not programs themselves.
  const isProgram = /\bvoid\s+main\s*\(/.test(src);
  if (!isProgram) continue;
  if (!src.trimStart().startsWith('#version 300 es')) {
    problems.push(`${name}: missing '#version 300 es' as the first line`);
  }
  analysed.set(name, analyse(name, src));
}

// --- VS/FS varying pairing --------------------------------------------------
for (const [name] of sources) {
  if (!name.endsWith('_VS')) continue;
  const fsName = name.replace(/_VS$/, '_FS');
  if (!analysed.has(fsName)) continue;
  const vs = analysed.get(name);
  const fs = analysed.get(fsName);
  for (const varying of fs.ins) {
    if (varying.startsWith('a')) continue;
    if (!vs.outs.has(varying)) {
      problems.push(`${fsName}: reads varying '${varying}' that ${name} does not output`);
    }
  }
}

console.log(`checked ${analysed.size} programs, ${sources.size - analysed.size} chunks`);
for (const key of [...analysed.keys()].sort()) console.log('  · ' + key);
if (problems.length === 0) {
  console.log('no problems found');
} else {
  for (const p of [...new Set(problems)].sort()) console.log('  ✗ ' + p);
  process.exitCode = 1;
}
