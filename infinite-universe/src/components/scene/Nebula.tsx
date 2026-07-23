import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { NEBULA_FRAG, NEBULA_VERT } from '@/shaders/nebula';
import { globalUniforms } from '@/shaders/uniforms';

/**
 * The infinite backdrop: a giant inward-facing sphere re-centred on the camera
 * each frame so it never draws nearer. Colour depends only on view direction,
 * so the nebula reads as unreachably distant no matter how far you travel.
 */
export function Nebula() {
  const ref = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: globalUniforms.uTime,
      uWarp: globalUniforms.uWarp,
      uTintA: { value: new THREE.Color('#6a3cff') },
      uTintB: { value: new THREE.Color('#1f7cff') },
    }),
    [],
  );

  useFrame(() => {
    if (ref.current) ref.current.position.copy(camera.position);
  });

  return (
    <mesh ref={ref} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[1200, 48, 32]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={NEBULA_VERT}
        fragmentShader={NEBULA_FRAG}
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={false}
        fog={false}
        glslVersion={THREE.GLSL3}
      />
    </mesh>
  );
}
