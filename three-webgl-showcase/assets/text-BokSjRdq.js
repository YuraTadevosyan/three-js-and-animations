const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Text3DScene-ClJW24Sh.js","assets/tanstack-DkmCf9xt.js","assets/r3f-BUcHFckj.js","assets/three-Cne9AhED.js","assets/useReducedMotion-CPYmCr-8.js"])))=>i.map(i=>d[i]);
import{_ as t}from"./r3f-BUcHFckj.js";import{j as e}from"./tanstack-DkmCf9xt.js";import{E as r}from"./ExamplePage-0qWnZ_dA.js";import{L as o}from"./LazyScene-DSQ5lMvL.js";import"./three-Cne9AhED.js";import"./button-5B8zUrBJ.js";import"./utils-DH51L_4Q.js";import"./index-CRRPCOay.js";import"./code-xml-CkVGhwGM.js";const n=`import { Canvas, useFrame } from '@react-three/fiber';
import { Center, Environment, Float, OrbitControls, Text } from '@react-three/drei';
import { useRef } from 'react';
import { Group } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const lines = [
  { text: 'THREE.JS', color: '#a78bfa', y: 1.1 },
  { text: 'WEBGL', color: '#22d3ee', y: 0 },
  { text: 'SHOWCASE', color: '#f472b6', y: -1.1 },
];

function AnimatedText() {
  const groupRef = useRef<Group>(null);
  const reduced = useReducedMotion();

  useFrame(({ pointer }) => {
    if (!groupRef.current) return;
    if (reduced) {
      groupRef.current.rotation.set(0, 0, 0);
      return;
    }
    // Damped rotation toward pointer
    groupRef.current.rotation.y +=
      (pointer.x * 0.5 - groupRef.current.rotation.y) * 0.04;
    groupRef.current.rotation.x +=
      (-pointer.y * 0.3 - groupRef.current.rotation.x) * 0.04;
  });

  return (
    <Center>
      <group ref={groupRef}>
        {lines.map((l) => (
          <Float
            key={l.text}
            speed={1.4}
            rotationIntensity={0.15}
            floatIntensity={0.25}
          >
            <Text
              position={[0, l.y, 0]}
              fontSize={1}
              letterSpacing={0.04}
              anchorX="center"
              anchorY="middle"
              color={l.color}
              outlineWidth={0.012}
              outlineColor="#0b0b14"
            >
              {l.text}
            </Text>
          </Float>
        ))}
      </group>
    </Center>
  );
}

export default function Text3DScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5.5], fov: 45 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0b0b14']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 3]} intensity={1.0} />
      <AnimatedText />
      <Environment preset="city" />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.7}
      />
    </Canvas>
  );
}
`;function d(){return e.jsx(r,{title:"3D Text",description:"Three lines of SDF text (via troika-three-text under Drei's <Text>) float and rotate toward the cursor. SDF means the glyphs stay crisp at any zoom level, with a single draw call per line.",seoDescription:"SDF-rendered text in 3D space with cursor-tracked rotation, floating motion, and crisp outlines at any zoom.",path:"/examples/text",tags:["SDF","Troika","Typography"],sourceCode:n,filename:"Text3DScene.tsx",children:e.jsx(o,{loader:()=>t(()=>import("./Text3DScene-ClJW24Sh.js"),__vite__mapDeps([0,1,2,3,4])),height:"h-[70vh]",label:"Loading typography…"})})}export{d as component};
