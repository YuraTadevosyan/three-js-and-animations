const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/DragScene-BfowWY-e.js","assets/tanstack-DkmCf9xt.js","assets/r3f-BUcHFckj.js","assets/three-Cne9AhED.js"])))=>i.map(i=>d[i]);
import{_ as t}from"./r3f-BUcHFckj.js";import{j as e}from"./tanstack-DkmCf9xt.js";import{E as o}from"./ExamplePage-0qWnZ_dA.js";import{L as r}from"./LazyScene-DSQ5lMvL.js";import"./three-Cne9AhED.js";import"./button-5B8zUrBJ.js";import"./utils-DH51L_4Q.js";import"./index-CRRPCOay.js";import"./code-xml-CkVGhwGM.js";const a=`import { Canvas } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Grid,
  OrbitControls,
  PivotControls,
} from '@react-three/drei';
import { Html } from '@react-three/drei';
import { useState } from 'react';

interface DraggableObjectProps {
  position: [number, number, number];
  color: string;
  shape: 'box' | 'sphere' | 'cone';
  label: string;
}

function DraggableObject({ position, color, shape, label }: DraggableObjectProps) {
  const [active, setActive] = useState(false);

  return (
    <PivotControls
      offset={position}
      depthTest={false}
      lineWidth={2.5}
      scale={75}
      fixed
      anchor={[0, 0, 0]}
      activeAxes={[true, true, true]}
      onDragStart={() => setActive(true)}
      onDragEnd={() => setActive(false)}
    >
      <mesh position={position} castShadow>
        {shape === 'box' && <boxGeometry args={[0.8, 0.8, 0.8]} />}
        {shape === 'sphere' && <sphereGeometry args={[0.5, 32, 32]} />}
        {shape === 'cone' && <coneGeometry args={[0.5, 0.9, 32]} />}
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.55}
          emissive={active ? color : '#000000'}
          emissiveIntensity={active ? 0.35 : 0}
        />
        {active && (
          <Html
            position={[0, 0.9, 0]}
            center
            distanceFactor={6}
            style={{ pointerEvents: 'none' }}
          >
            <span className="rounded-md bg-background/80 px-2 py-1 text-xs text-foreground backdrop-blur">
              dragging {label}
            </span>
          </Html>
        )}
      </mesh>
    </PivotControls>
  );
}

export default function DragScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [4, 4, 5], fov: 45 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0b0b14']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 6, 4]} intensity={1.1} castShadow />

      <DraggableObject position={[-1.6, 0.4, 0]} color="#a78bfa" shape="box" label="cube" />
      <DraggableObject position={[0, 0.5, 0]} color="#22d3ee" shape="sphere" label="sphere" />
      <DraggableObject position={[1.6, 0.45, 0]} color="#f472b6" shape="cone" label="cone" />

      <Grid
        position={[0, -0.001, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#1f2937"
        sectionSize={2}
        sectionThickness={1.2}
        sectionColor="#a78bfa"
        fadeDistance={20}
        fadeStrength={1}
        infiniteGrid
      />
      <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={10} blur={2.4} far={4} />

      <Environment preset="city" />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={4}
        maxDistance={10}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
`;function b(){return e.jsx(o,{title:"Draggable Objects",description:"Drei's PivotControls wrap each mesh with translate gizmos. Drag any object along the X/Y/Z axes; an HTML overlay (rendered via <Html />) shows which body is currently being moved.",seoDescription:"Three meshes with on-axis transform gizmos via Drei PivotControls — a tactile 3D editing experience.",path:"/examples/drag",tags:["PivotControls","Gizmos","HTML overlay"],sourceCode:a,filename:"DragScene.tsx",children:e.jsx(r,{loader:()=>t(()=>import("./DragScene-BfowWY-e.js"),__vite__mapDeps([0,1,2,3])),height:"h-[75vh]",label:"Calibrating gizmos…"})})}export{b as component};
