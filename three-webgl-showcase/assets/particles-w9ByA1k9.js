const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/ParticlesScene-DHv5ywT4.js","assets/tanstack-DkmCf9xt.js","assets/r3f-BUcHFckj.js","assets/three-Cne9AhED.js","assets/useReducedMotion-CPYmCr-8.js"])))=>i.map(i=>d[i]);
import{_ as t}from"./r3f-BUcHFckj.js";import{j as e}from"./tanstack-DkmCf9xt.js";import{E as r}from"./ExamplePage-0qWnZ_dA.js";import{L as a}from"./LazyScene-DSQ5lMvL.js";import"./three-Cne9AhED.js";import"./button-5B8zUrBJ.js";import"./utils-DH51L_4Q.js";import"./index-CRRPCOay.js";import"./code-xml-CkVGhwGM.js";const i=`import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, Points } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const COUNT = 6000;

function ParticleField() {
  const ref = useRef<Points>(null);
  const reduced = useReducedMotion();

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      // Galactic spiral distribution
      const r = Math.sqrt(Math.random()) * 4;
      const theta = Math.random() * Math.PI * 2 + r * 1.2;
      const y = (Math.random() - 0.5) * 0.4;
      arr[i * 3] = Math.cos(theta) * r;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(theta) * r;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y += delta * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        sizeAttenuation
        color="#a78bfa"
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

export default function ParticlesScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.5, 6], fov: 55 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#050507']} />
      <ParticleField />
    </Canvas>
  );
}
`;function f(){return e.jsx(r,{title:"GPU Particles",description:"A galactic spiral built from 6,000 points. The buffer is generated once on the CPU, uploaded to the GPU, and animated by rotating the container — keeping per-frame work near zero.",seoDescription:"6,000 particles arranged in a galactic spiral, rendered with additive blending and a single draw call.",path:"/examples/particles",tags:["BufferGeometry","Additive blending","Single draw call"],sourceCode:i,filename:"ParticlesScene.tsx",children:e.jsx(a,{loader:()=>t(()=>import("./ParticlesScene-DHv5ywT4.js"),__vite__mapDeps([0,1,2,3,4])),height:"h-[70vh]",label:"Loading particles…"})})}export{f as component};
