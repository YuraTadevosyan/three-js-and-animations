const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/ReflectionsScene-DFlWKbpT.js","assets/tanstack-DkmCf9xt.js","assets/r3f-BUcHFckj.js","assets/three-Cne9AhED.js","assets/useReducedMotion-CPYmCr-8.js"])))=>i.map(i=>d[i]);
import{_ as t}from"./r3f-BUcHFckj.js";import{j as e}from"./tanstack-DkmCf9xt.js";import{E as o}from"./ExamplePage-0qWnZ_dA.js";import{L as r}from"./LazyScene-DSQ5lMvL.js";import"./three-Cne9AhED.js";import"./button-5B8zUrBJ.js";import"./utils-DH51L_4Q.js";import"./index-CRRPCOay.js";import"./code-xml-CkVGhwGM.js";const a=`import { Canvas, useFrame } from '@react-three/fiber';
import {
  Environment,
  Float,
  MeshReflectorMaterial,
  OrbitControls,
} from '@react-three/drei';
import { useRef } from 'react';
import { Group } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function FloatingShapes() {
  const groupRef = useRef<Group>(null);
  const reduced = useReducedMotion();

  useFrame((_, delta) => {
    if (!groupRef.current || reduced) return;
    groupRef.current.rotation.y += delta * 0.15;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.5}>
        <mesh position={[-1.6, 1.1, 0]} castShadow>
          <icosahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial color="#a78bfa" roughness={0.15} metalness={0.85} />
        </mesh>
      </Float>
      <Float speed={1.6} rotationIntensity={0.6} floatIntensity={0.6}>
        <mesh position={[0, 1.4, -0.6]} castShadow>
          <torusKnotGeometry args={[0.45, 0.16, 180, 24]} />
          <meshStandardMaterial color="#22d3ee" roughness={0.1} metalness={0.9} />
        </mesh>
      </Float>
      <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh position={[1.7, 1, 0.4]} castShadow>
          <dodecahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial color="#f472b6" roughness={0.2} metalness={0.7} />
        </mesh>
      </Float>
    </group>
  );
}

export default function ReflectionsScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.6, 5], fov: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0b0b14']} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <FloatingShapes />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={1024}
          mixBlur={1}
          mixStrength={1.2}
          roughness={0.9}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#1c1c24"
          metalness={0.6}
          mirror={0.5}
        />
      </mesh>

      <Environment preset="city" />
      <OrbitControls
        enablePan={false}
        minDistance={3.5}
        maxDistance={8}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
`;function u(){return e.jsx(o,{title:"Reflective Floor",description:"Drei's MeshReflectorMaterial renders the scene into an offscreen target each frame, then samples it back as a depth-aware blurred reflection — the classic showroom look without a custom shader.",seoDescription:"Real-time blurred reflections via Drei's MeshReflectorMaterial — a render-to-texture technique that gives a showroom feel.",path:"/examples/reflections",tags:["Render target","Reflections","Drei"],sourceCode:a,filename:"ReflectionsScene.tsx",children:e.jsx(r,{loader:()=>t(()=>import("./ReflectionsScene-DFlWKbpT.js"),__vite__mapDeps([0,1,2,3,4])),height:"h-[70vh]",label:"Building reflection target…"})})}export{u as component};
