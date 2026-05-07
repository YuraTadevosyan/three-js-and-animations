const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/ParallaxScene-BUFvPiKC.js","assets/tanstack-DkmCf9xt.js","assets/r3f-BUcHFckj.js","assets/three-Cne9AhED.js","assets/useReducedMotion-CPYmCr-8.js"])))=>i.map(i=>d[i]);
import{_ as r}from"./r3f-BUcHFckj.js";import{j as e}from"./tanstack-DkmCf9xt.js";import{E as t}from"./ExamplePage-0qWnZ_dA.js";import{L as o}from"./LazyScene-DSQ5lMvL.js";import"./three-Cne9AhED.js";import"./button-5B8zUrBJ.js";import"./utils-DH51L_4Q.js";import"./index-CRRPCOay.js";import"./code-xml-CkVGhwGM.js";const a=`import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Group, MathUtils } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Card {
  position: [number, number, number];
  color: string;
  size: [number, number];
  depth: number;
}

function ParallaxLayers() {
  const groupRef = useRef<Group>(null);
  const reduced = useReducedMotion();

  const cards = useMemo<Card[]>(() => {
    const palette = ['#a78bfa', '#22d3ee', '#f472b6', '#facc15', '#34d399', '#f97316'];
    return Array.from({ length: 18 }, (_, i) => {
      const depth = -1 - Math.random() * 6;
      return {
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6,
          depth,
        ],
        color: palette[i % palette.length],
        size: [0.6 + Math.random() * 0.6, 0.8 + Math.random() * 0.6],
        depth,
      };
    });
  }, []);

  useFrame(({ pointer }) => {
    if (!groupRef.current) return;
    if (reduced) {
      groupRef.current.position.set(0, 0, 0);
      return;
    }
    // Inverse-direction parallax: closer layers move more, far layers less
    groupRef.current.position.x = MathUtils.lerp(
      groupRef.current.position.x,
      pointer.x * 0.6,
      0.05,
    );
    groupRef.current.position.y = MathUtils.lerp(
      groupRef.current.position.y,
      pointer.y * 0.4,
      0.05,
    );
    groupRef.current.rotation.y = MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.x * 0.15,
      0.05,
    );
    groupRef.current.rotation.x = MathUtils.lerp(
      groupRef.current.rotation.x,
      -pointer.y * 0.1,
      0.05,
    );
  });

  return (
    <group ref={groupRef}>
      {cards.map((c, i) => {
        // Scale parallax effect by depth
        const offsetScale = 1 - Math.abs(c.depth) / 8;
        return (
          <mesh
            key={i}
            position={[
              c.position[0] * offsetScale,
              c.position[1] * offsetScale,
              c.position[2],
            ]}
          >
            <planeGeometry args={c.size} />
            <meshBasicMaterial color={c.color} transparent opacity={0.85} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function ParallaxScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4], fov: 60 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#09090b']} />
      <ambientLight intensity={1} />
      <ParallaxLayers />
    </Canvas>
  );
}
`;function f(){return e.jsx(t,{title:"Cursor Parallax",description:"18 colored cards distributed over six depth planes drift opposite the cursor with MathUtils.lerp damping. Closer layers move more, far layers less — a depth cue the brain reads instantly.",seoDescription:"18 layered cards drift in 3D space with cursor-driven parallax — depth-scaled offsets and damped lerp give a tactile, magazine-style feel.",path:"/examples/parallax",tags:["Interaction","Parallax","Lerp"],sourceCode:a,filename:"ParallaxScene.tsx",children:e.jsx(o,{loader:()=>r(()=>import("./ParallaxScene-BUFvPiKC.js"),__vite__mapDeps([0,1,2,3,4])),height:"h-[70vh]",label:"Layering cards…"})})}export{f as component};
