const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/PostFxScene-DvqtNe9v.js","assets/tanstack-DkmCf9xt.js","assets/r3f-BUcHFckj.js","assets/three-Cne9AhED.js","assets/useReducedMotion-CPYmCr-8.js"])))=>i.map(i=>d[i]);
import{_ as o}from"./r3f-BUcHFckj.js";import{j as e}from"./tanstack-DkmCf9xt.js";import{E as t}from"./ExamplePage-0qWnZ_dA.js";import{L as r}from"./LazyScene-DSQ5lMvL.js";import"./three-Cne9AhED.js";import"./button-5B8zUrBJ.js";import"./utils-DH51L_4Q.js";import"./index-CRRPCOay.js";import"./code-xml-CkVGhwGM.js";const i=`import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { useRef } from 'react';
import { Group, Vector2 } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function NeonRing({
  radius,
  speed,
  color,
  tilt,
}: {
  radius: number;
  speed: number;
  color: string;
  tilt: number;
}) {
  const ref = useRef<Group>(null);
  const reduced = useReducedMotion();

  useFrame((_, delta) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.z += delta * speed;
  });

  return (
    <group ref={ref} rotation={[tilt, 0, 0]}>
      <mesh>
        <torusGeometry args={[radius, 0.04, 16, 200]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function PostFxScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} intensity={0.5} color="#a78bfa" />

      <NeonRing radius={1.4} speed={0.5} color="#a78bfa" tilt={0.4} />
      <NeonRing radius={1.9} speed={-0.35} color="#22d3ee" tilt={-0.5} />
      <NeonRing radius={2.4} speed={0.25} color="#f472b6" tilt={0.3} />

      <mesh>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#22d3ee"
          emissiveIntensity={1.4}
          roughness={0.3}
          metalness={0.6}
          toneMapped={false}
        />
      </mesh>

      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.4} />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={1.4}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.85}
          kernelSize={KernelSize.LARGE}
          mipmapBlur
        />
        <ChromaticAberration
          offset={new Vector2(0.0015, 0.0015)}
          radialModulation={false}
          modulationOffset={0}
          blendFunction={BlendFunction.NORMAL}
        />
        <Vignette eskil={false} offset={0.2} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
`;function u(){return e.jsx(t,{title:"Post-processing",description:"Mip-mapped bloom, subtle chromatic aberration, and vignette stacked in an EffectComposer pipeline. Emissive, non-tone-mapped materials drive the bloom.",seoDescription:"Bloom, chromatic aberration, and vignette via the postprocessing EffectComposer.",path:"/examples/postfx",tags:["EffectComposer","Bloom","HDR"],sourceCode:i,filename:"PostFxScene.tsx",children:e.jsx(r,{loader:()=>o(()=>import("./PostFxScene-DvqtNe9v.js"),__vite__mapDeps([0,1,2,3,4])),height:"h-[70vh]",label:"Compiling effect chain…"})})}export{u as component};
