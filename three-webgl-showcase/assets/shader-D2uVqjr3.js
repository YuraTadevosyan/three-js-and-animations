const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/ShaderScene-46csI6AY.js","assets/tanstack-DkmCf9xt.js","assets/r3f-BUcHFckj.js","assets/three-Cne9AhED.js","assets/useReducedMotion-CPYmCr-8.js"])))=>i.map(i=>d[i]);
import{_ as r}from"./r3f-BUcHFckj.js";import{j as e}from"./tanstack-DkmCf9xt.js";import{E as a}from"./ExamplePage-0qWnZ_dA.js";import{L as t}from"./LazyScene-DSQ5lMvL.js";import"./three-Cne9AhED.js";import"./button-5B8zUrBJ.js";import"./utils-DH51L_4Q.js";import"./index-CRRPCOay.js";import"./code-xml-CkVGhwGM.js";const o=`import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { Color, ShaderMaterial } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

import vertexShader from '@/shaders/wave.vert.glsl?raw';
import fragmentShader from '@/shaders/wave.frag.glsl?raw';

function WavePlane() {
  const matRef = useRef<ShaderMaterial>(null);
  const reduced = useReducedMotion();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new Color('#1e1b4b') },
      uColorB: { value: new Color('#a78bfa') },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (!matRef.current || reduced) return;
    matRef.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh rotation={[-Math.PI / 3, 0, 0]}>
      <planeGeometry args={[6, 6, 128, 128]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function ShaderScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.6, 3.5], fov: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#09090b']} />
      <WavePlane />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
}
`;function p(){return e.jsx(a,{title:"Custom GLSL Shader",description:"A 128×128 plane displaced in the vertex shader and shaded by a two-color ramp in the fragment shader. Loaded as raw GLSL via Vite's ?raw import.",seoDescription:"Vertex and fragment shaders driving a procedural wave plane with animated color ramp.",path:"/examples/shader",tags:["GLSL","ShaderMaterial","Vertex displacement"],sourceCode:o,filename:"ShaderScene.tsx",children:e.jsx(t,{loader:()=>r(()=>import("./ShaderScene-46csI6AY.js"),__vite__mapDeps([0,1,2,3,4])),height:"h-[70vh]",label:"Compiling shader…"})})}export{p as component};
