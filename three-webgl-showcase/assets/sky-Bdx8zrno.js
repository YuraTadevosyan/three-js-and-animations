const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/SkyScene-Ck8DOmgh.js","assets/tanstack-DkmCf9xt.js","assets/r3f-BUcHFckj.js","assets/three-Cne9AhED.js","assets/useReducedMotion-CPYmCr-8.js"])))=>i.map(i=>d[i]);
import{_ as o}from"./r3f-BUcHFckj.js";import{j as e}from"./tanstack-DkmCf9xt.js";import{E as t}from"./ExamplePage-0qWnZ_dA.js";import{L as r}from"./LazyScene-DSQ5lMvL.js";import"./three-Cne9AhED.js";import"./button-5B8zUrBJ.js";import"./utils-DH51L_4Q.js";import"./index-CRRPCOay.js";import"./code-xml-CkVGhwGM.js";const i=`import { Canvas, useFrame } from '@react-three/fiber';
import { Cloud, Clouds, OrbitControls, Sky } from '@react-three/drei';
import { useRef } from 'react';
import { MeshLambertMaterial, Vector3 } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function MovingSun() {
  const sunPos = useRef(new Vector3(10, 5, 10));
  const reduced = useReducedMotion();

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.getElapsedTime() * 0.05;
    sunPos.current.set(Math.cos(t) * 12, Math.sin(t) * 6 + 2, Math.sin(t) * 12);
  });

  return (
    <Sky
      distance={450000}
      sunPosition={sunPos.current}
      mieCoefficient={0.005}
      mieDirectionalG={0.8}
      rayleigh={2}
      turbidity={6}
    />
  );
}

export default function SkyScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.6, 6], fov: 55 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} />

      <MovingSun />

      <Clouds material={MeshLambertMaterial}>
        <Cloud
          segments={40}
          bounds={[10, 2, 2]}
          volume={10}
          color="#ffffff"
          position={[0, 2, -4]}
        />
        <Cloud
          segments={30}
          bounds={[8, 1.5, 2]}
          volume={8}
          color="#e5e7eb"
          position={[-6, 3, -2]}
        />
        <Cloud
          segments={30}
          bounds={[8, 1.5, 2]}
          volume={8}
          color="#f1f5f9"
          position={[6, 1.6, -3]}
        />
      </Clouds>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1f2937" roughness={1} />
      </mesh>

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
`;function p(){return e.jsx(t,{title:"Atmospheric Sky",description:"Three.js' built-in Sky shader simulates Rayleigh + Mie scattering. The sun position traces a slow arc; volumetric clouds from @react-three/drei sit underneath.",seoDescription:"Three.js Sky shader with an animated sun position and volumetric clouds — atmospheric scattering driven by Rayleigh and Mie coefficients.",path:"/examples/sky",tags:["Atmospheric","Volumetric","Sky shader"],sourceCode:i,filename:"SkyScene.tsx",children:e.jsx(r,{loader:()=>o(()=>import("./SkyScene-Ck8DOmgh.js"),__vite__mapDeps([0,1,2,3,4])),height:"h-[75vh]",label:"Computing scattering…"})})}export{p as component};
