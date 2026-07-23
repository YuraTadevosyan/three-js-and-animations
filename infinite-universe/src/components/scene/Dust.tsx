import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { UNIVERSE } from '@/lib/config';
import { useUniverse } from '@/state/universeStore';

const DUST_COUNT = 320;
const BX = 30;
const BY = 22;
const BZ = 90;

const DUST_VERT = /* glsl */ `
out float vFade;
void main() {
  vFade = clamp(1.0 - abs(position.z) / ${BZ.toFixed(1)}, 0.0, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const DUST_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform float uAlpha;
in float vFade;
out vec4 outColor;
void main() {
  outColor = vec4(uColor, uAlpha * vFade);
}
`;

/**
 * Near-field speck field rendered as line segments. At cruise the streaks are
 * tiny (a dusting of sparks giving parallax speed cues); as speed climbs — and
 * especially through a warp jump — each speck stretches into a long light
 * streak. The whole field recenters on the camera and wraps endlessly.
 */
export function Dust() {
  const ref = useRef<THREE.LineSegments>(null);
  const { camera } = useThree();
  const { shared } = useUniverse();

  const motes = useMemo(
    () =>
      Array.from({ length: DUST_COUNT }, () => ({
        x: (Math.random() * 2 - 1) * BX,
        y: (Math.random() * 2 - 1) * BY,
        z: (Math.random() * 2 - 1) * BZ,
      })),
    [],
  );

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(DUST_COUNT * 2 * 3), 3),
    );
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color('#bcd4ff') },
      uAlpha: { value: 0.5 },
    }),
    [],
  );

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.copy(camera.position);

    const clampedDt = Math.min(dt, 0.05);
    const effSpeed = shared.paused
      ? 0
      : UNIVERSE.baseSpeed *
        shared.speedMul *
        (1 + shared.warp * (UNIVERSE.warpMultiplier - 1));

    const flow = effSpeed * clampedDt;
    const streak = Math.min(0.5 + effSpeed * 0.05, 44);
    uniforms.uAlpha.value = Math.min(0.28 + effSpeed * 0.01, 0.95);

    const arr = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < DUST_COUNT; i++) {
      const m = motes[i];
      m.z += flow;
      if (m.z > BZ) {
        m.z -= 2 * BZ;
        m.x = (Math.random() * 2 - 1) * BX;
        m.y = (Math.random() * 2 - 1) * BY;
      }
      const a = i * 6;
      arr[a] = m.x;
      arr[a + 1] = m.y;
      arr[a + 2] = m.z;
      arr[a + 3] = m.x;
      arr[a + 4] = m.y;
      arr[a + 5] = m.z + streak;
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={ref} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={DUST_VERT}
        fragmentShader={DUST_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        glslVersion={THREE.GLSL3}
      />
    </lineSegments>
  );
}
