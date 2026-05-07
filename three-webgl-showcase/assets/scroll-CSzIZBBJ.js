const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/ScrollScene-Bq7zeT52.js","assets/tanstack-DkmCf9xt.js","assets/r3f-BUcHFckj.js","assets/three-Cne9AhED.js"])))=>i.map(i=>d[i]);
import{_ as t}from"./r3f-BUcHFckj.js";import{j as o}from"./tanstack-DkmCf9xt.js";import{E as e}from"./ExamplePage-0qWnZ_dA.js";import{L as r}from"./LazyScene-DSQ5lMvL.js";import"./three-Cne9AhED.js";import"./button-5B8zUrBJ.js";import"./utils-DH51L_4Q.js";import"./index-CRRPCOay.js";import"./code-xml-CkVGhwGM.js";const s=`import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ScrollControls, useScroll } from '@react-three/drei';
import { useRef } from 'react';
import { Group, MathUtils } from 'three';

const stages = [
  { position: [0, 0, 0] as const, color: '#a78bfa' },
  { position: [3, -1, -3] as const, color: '#22d3ee' },
  { position: [-3, 1, -6] as const, color: '#f472b6' },
  { position: [0, 0, -10] as const, color: '#facc15' },
];

function ScrollRig() {
  const scroll = useScroll();
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const offset = scroll.offset; // 0..1

    // Lerp camera through key positions across scroll progress
    const segments = stages.length - 1;
    const segIndex = Math.min(Math.floor(offset * segments), segments - 1);
    const t = offset * segments - segIndex;
    const from = stages[segIndex].position;
    const to = stages[segIndex + 1].position;

    state.camera.position.x = MathUtils.lerp(from[0], to[0], t);
    state.camera.position.y = MathUtils.lerp(from[1], to[1], t) + 0.5;
    state.camera.position.z = MathUtils.lerp(from[2], to[2], t) + 4;
    state.camera.lookAt(0, 0, -5);
  });

  return (
    <group ref={groupRef}>
      {stages.map((s, i) => (
        <Float key={i} speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
          <mesh position={s.position}>
            <octahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial
              color={s.color}
              roughness={0.2}
              metalness={0.7}
              emissive={s.color}
              emissiveIntensity={0.25}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function ScrollScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4], fov: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0b0b14']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 3]} intensity={1.1} />
      <ScrollControls pages={3} damping={0.2}>
        <ScrollRig />
      </ScrollControls>
    </Canvas>
  );
}
`;function u(){return o.jsx(e,{title:"Scroll-driven Storytelling",description:"Drei's ScrollControls virtualizes 3 pages of scroll inside the canvas. The camera is interpolated through four key positions — the same pattern used for product launches and case studies.",seoDescription:"Camera fly-through bound to scroll progress with Drei ScrollControls — a storytelling pattern for product pages.",path:"/examples/scroll",tags:["ScrollControls","Camera lerp","Storytelling"],sourceCode:s,filename:"ScrollScene.tsx",children:o.jsx(r,{loader:()=>t(()=>import("./ScrollScene-Bq7zeT52.js"),__vite__mapDeps([0,1,2,3])),height:"h-[80vh]",label:"Wiring scroll proxy…"})})}export{u as component};
