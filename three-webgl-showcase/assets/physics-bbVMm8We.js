const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/PhysicsScene-Dm8sgt2z.js","assets/tanstack-DkmCf9xt.js","assets/r3f-BUcHFckj.js","assets/three-Cne9AhED.js"])))=>i.map(i=>d[i]);
import{_ as r}from"./r3f-BUcHFckj.js";import{j as e}from"./tanstack-DkmCf9xt.js";import{E as i}from"./ExamplePage-0qWnZ_dA.js";import{L as o}from"./LazyScene-DSQ5lMvL.js";import"./three-Cne9AhED.js";import"./button-5B8zUrBJ.js";import"./utils-DH51L_4Q.js";import"./index-CRRPCOay.js";import"./code-xml-CkVGhwGM.js";const s=`import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { useEffect, useRef, useState } from 'react';

const COLORS = ['#a78bfa', '#22d3ee', '#f472b6', '#facc15', '#34d399'];

interface FallingShape {
  id: number;
  position: [number, number, number];
  color: string;
  shape: 'box' | 'sphere';
}

function Shape({ shape, color }: { shape: 'box' | 'sphere'; color: string }) {
  if (shape === 'sphere') {
    return (
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.4} />
      </mesh>
    );
  }
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[0.85, 0.85, 0.85]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.3} />
    </mesh>
  );
}

function Spawner() {
  const [shapes, setShapes] = useState<FallingShape[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const spawn = () => {
      idRef.current += 1;
      const id = idRef.current;
      setShapes((curr) => {
        const next: FallingShape = {
          id,
          position: [(Math.random() - 0.5) * 3, 6 + Math.random() * 2, (Math.random() - 0.5) * 3],
          color: COLORS[id % COLORS.length],
          shape: id % 2 === 0 ? 'box' : 'sphere',
        };
        // Cap to 30 falling bodies for perf
        const trimmed = curr.length >= 30 ? curr.slice(1) : curr;
        return [...trimmed, next];
      });
    };

    spawn();
    const interval = setInterval(spawn, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {shapes.map((s) => (
        <RigidBody
          key={s.id}
          position={s.position}
          colliders={s.shape === 'sphere' ? 'ball' : 'cuboid'}
          restitution={0.35}
          friction={0.6}
        >
          <Shape shape={s.shape} color={s.color} />
        </RigidBody>
      ))}
    </>
  );
}

export default function PhysicsScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [6, 5, 7], fov: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#09090b']} />
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[6, 8, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Physics gravity={[0, -9.81, 0]}>
        {/* Floor */}
        <RigidBody type="fixed" friction={0.8}>
          <CuboidCollider args={[5, 0.25, 5]} position={[0, -0.25, 0]} />
          <mesh receiveShadow position={[0, -0.25, 0]}>
            <boxGeometry args={[10, 0.5, 10]} />
            <meshStandardMaterial color="#18181b" />
          </mesh>
        </RigidBody>

        {/* Walls */}
        <RigidBody type="fixed">
          <CuboidCollider args={[0.25, 2, 5]} position={[5, 1.5, 0]} />
          <CuboidCollider args={[0.25, 2, 5]} position={[-5, 1.5, 0]} />
          <CuboidCollider args={[5, 2, 0.25]} position={[0, 1.5, 5]} />
          <CuboidCollider args={[5, 2, 0.25]} position={[0, 1.5, -5]} />
        </RigidBody>

        <Spawner />
      </Physics>

      <Environment preset="city" />
      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  );
}
`;function u(){return e.jsx(i,{title:"Physics with Rapier",description:"A WASM-powered physics world from @react-three/rapier. Bodies spawn every 700ms with restitution and friction tuned for satisfying bounces; the arena is capped at 30 active bodies.",seoDescription:"Real-time rigid-body physics with @react-three/rapier — falling cubes and spheres bouncing inside a walled arena.",path:"/examples/physics",tags:["Rapier","WASM","Rigid bodies"],sourceCode:s,filename:"PhysicsScene.tsx",children:e.jsx(o,{loader:()=>r(()=>import("./PhysicsScene-Dm8sgt2z.js"),__vite__mapDeps([0,1,2,3])),height:"h-[75vh]",label:"Booting physics world…"})})}export{u as component};
