const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/HoloScene-CuVdtFsG.js","assets/tanstack-DkmCf9xt.js","assets/r3f-BUcHFckj.js","assets/three-Cne9AhED.js","assets/useReducedMotion-CPYmCr-8.js"])))=>i.map(i=>d[i]);
import{_ as r}from"./r3f-BUcHFckj.js";import{j as e}from"./tanstack-DkmCf9xt.js";import{E as o}from"./ExamplePage-0qWnZ_dA.js";import{L as t}from"./LazyScene-DSQ5lMvL.js";import"./three-Cne9AhED.js";import"./button-5B8zUrBJ.js";import"./utils-DH51L_4Q.js";import"./index-CRRPCOay.js";import"./code-xml-CkVGhwGM.js";const a=`import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, Color, DoubleSide, ShaderMaterial } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

import vertexShader from '@/shaders/holo.vert.glsl?raw';
import fragmentShader from '@/shaders/holo.frag.glsl?raw';

function HoloMesh() {
  const matRef = useRef<ShaderMaterial>(null);
  const reduced = useReducedMotion();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new Color('#22d3ee') },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (!matRef.current || reduced) return;
    matRef.current.uniforms.uTime.value += delta;
  });

  return (
    <group>
      {/* Outer holographic shell (additive, transparent) */}
      <mesh>
        <icosahedronGeometry args={[1.2, 8]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={DoubleSide}
          blending={AdditiveBlending}
        />
      </mesh>
      {/* Inner solid core for silhouette */}
      <mesh>
        <icosahedronGeometry args={[0.55, 2]} />
        <meshBasicMaterial color="#0e7490" wireframe />
      </mesh>
    </group>
  );
}

export default function HoloScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4], fov: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.3} />
      <HoloMesh />
      <OrbitControls
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.6}
        minDistance={2.5}
        maxDistance={6}
      />
    </Canvas>
  );
}
`;function f(){return e.jsx(o,{title:"Holographic Shader",description:"A custom GLSL fresnel shader gives the outer shell a rim glow that intensifies at glancing angles, with animated scanlines and a slow vertical sweep. The wireframe core inside provides depth cues.",seoDescription:"Custom GLSL fresnel + scanline shader applied to a glowing icosahedron with a wireframe core.",path:"/examples/holo",tags:["GLSL","Fresnel","Additive"],sourceCode:a,filename:"HoloScene.tsx",children:e.jsx(t,{loader:()=>r(()=>import("./HoloScene-CuVdtFsG.js"),__vite__mapDeps([0,1,2,3,4])),height:"h-[70vh]",label:"Energizing hologram…"})})}export{f as component};
