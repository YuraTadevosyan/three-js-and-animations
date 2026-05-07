const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/ModelScene-Dibyx-mb.js","assets/tanstack-DkmCf9xt.js","assets/r3f-BUcHFckj.js","assets/three-Cne9AhED.js","assets/useReducedMotion-CPYmCr-8.js"])))=>i.map(i=>d[i]);
import{_ as o}from"./r3f-BUcHFckj.js";import{j as e}from"./tanstack-DkmCf9xt.js";import{E as t}from"./ExamplePage-0qWnZ_dA.js";import{L as r}from"./LazyScene-DSQ5lMvL.js";import"./three-Cne9AhED.js";import"./button-5B8zUrBJ.js";import"./utils-DH51L_4Q.js";import"./index-CRRPCOay.js";import"./code-xml-CkVGhwGM.js";const i=`import { Canvas, useFrame } from '@react-three/fiber';
import {
  Environment,
  Float,
  MeshDistortMaterial,
  OrbitControls,
  PerspectiveCamera,
} from '@react-three/drei';
import { useRef } from 'react';
import { Mesh } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function MorphingBlob({ color }: { color: string }) {
  const ref = useRef<Mesh>(null);
  const reduced = useReducedMotion();

  useFrame(({ clock }) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.25;
  });

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <icosahedronGeometry args={[1.2, 64]} />
      <MeshDistortMaterial
        color={color}
        distort={0.45}
        speed={1.6}
        roughness={0.1}
        metalness={0.6}
      />
    </mesh>
  );
}

export default function ModelScene() {
  return (
    <Canvas shadows dpr={[1, 1.75]} gl={{ antialias: true }}>
      <PerspectiveCamera makeDefault position={[0, 0.4, 4]} fov={45} />
      <color attach="background" args={['#0b0b14']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} castShadow />

      <Float rotationIntensity={0.4} floatIntensity={0.6} speed={1.4}>
        <MorphingBlob color="#22d3ee" />
      </Float>

      <Environment preset="studio" />
      <OrbitControls enablePan={false} enableZoom minDistance={3} maxDistance={6} />
    </Canvas>
  );
}
`;function u(){return e.jsx(t,{title:"Material Showcase",description:"An icosahedron with subdivision-driven smooth distortion, a studio environment map for realistic reflections, and orbit controls constrained to a comfortable zoom range.",seoDescription:"High-poly icosahedron with a distortion material, environment lighting, and orbit controls.",path:"/examples/model",tags:["PBR","Environment map","Distortion"],sourceCode:i,filename:"ModelScene.tsx",children:e.jsx(r,{loader:()=>o(()=>import("./ModelScene-Dibyx-mb.js"),__vite__mapDeps([0,1,2,3,4])),height:"h-[70vh]",label:"Loading model…"})})}export{u as component};
