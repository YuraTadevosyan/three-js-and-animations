import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { globalUniforms } from '@/shaders/uniforms';
import { UNIVERSE } from '@/lib/config';
import type { WorldDesc } from '@/lib/worldgen';

const THRESHOLD = 70; // worlds closer than this get linked
const MAX_LINKS_PER_WORLD = 3;

const LINK_VERT = /* glsl */ `
uniform float uTime;
attribute float aLen;
attribute vec3 aColor;
out vec3 vColor;
out float vPulse;
out float vFade;
void main() {
  vColor = aColor;
  float phase = aLen * 0.16 - uTime * 1.3;
  vPulse = pow(0.5 + 0.5 * sin(phase), 4.0);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFade = smoothstep(${UNIVERSE.fogFar.toFixed(1)}, ${UNIVERSE.fogNear.toFixed(1)}, -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

const LINK_FRAG = /* glsl */ `
precision highp float;
in vec3 vColor;
in float vPulse;
in float vFade;
out vec4 outColor;
void main() {
  float a = (0.16 + 0.7 * vPulse) * vFade;
  outColor = vec4(vColor * (0.5 + 1.2 * vPulse), a);
}
`;

/**
 * Threads of light between neighbouring worlds — a constellation that rewires
 * itself as the corridor streams past, with energy pulses flowing along each
 * link. Rebuilt only when the active set of worlds changes.
 */
export function Connections({ descs }: { descs: WorldDesc[] }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const links: Array<[WorldDesc, WorldDesc, number]> = [];
    const counts = new Map<number, number>();

    for (let i = 0; i < descs.length; i++) {
      // Nearest-neighbour candidates, closest first.
      const a = descs[i];
      const cand: Array<[number, number]> = [];
      for (let j = 0; j < descs.length; j++) {
        if (i === j) continue;
        const d = a.position.distanceTo(descs[j].position);
        if (d < THRESHOLD) cand.push([j, d]);
      }
      cand.sort((p, q) => p[1] - q[1]);
      for (const [j, d] of cand.slice(0, MAX_LINKS_PER_WORLD)) {
        if (j < i) continue; // dedupe pairs
        const ca = counts.get(i) ?? 0;
        const cb = counts.get(j) ?? 0;
        if (ca >= MAX_LINKS_PER_WORLD || cb >= MAX_LINKS_PER_WORLD) continue;
        counts.set(i, ca + 1);
        counts.set(j, cb + 1);
        links.push([a, descs[j], d]);
      }
    }

    const n = links.length;
    const positions = new Float32Array(n * 2 * 3);
    const lens = new Float32Array(n * 2);
    const colors = new Float32Array(n * 2 * 3);
    const cA = new THREE.Color();
    const cB = new THREE.Color();

    links.forEach(([a, b, d], k) => {
      const o = k * 6;
      positions[o] = a.position.x;
      positions[o + 1] = a.position.y;
      positions[o + 2] = a.position.z;
      positions[o + 3] = b.position.x;
      positions[o + 4] = b.position.y;
      positions[o + 5] = b.position.z;
      lens[k * 2] = 0;
      lens[k * 2 + 1] = d;
      cA.set(a.palette.accent);
      cB.set(b.palette.accent);
      const c = k * 6;
      colors[c] = cA.r;
      colors[c + 1] = cA.g;
      colors[c + 2] = cA.b;
      colors[c + 3] = cB.r;
      colors[c + 4] = cB.g;
      colors[c + 5] = cB.b;
    });

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aLen', new THREE.BufferAttribute(lens, 1));
    g.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [descs]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(() => ({ uTime: globalUniforms.uTime }), []);

  return (
    <lineSegments geometry={geometry} frustumCulled={false} renderOrder={-1}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={LINK_VERT}
        fragmentShader={LINK_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        glslVersion={THREE.GLSL3}
      />
    </lineSegments>
  );
}
