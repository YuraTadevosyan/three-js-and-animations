const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/TrailScene-DnUrLuOE.js","assets/tanstack-DkmCf9xt.js","assets/r3f-BUcHFckj.js","assets/three-Cne9AhED.js"])))=>i.map(i=>d[i]);
import{_ as t}from"./r3f-BUcHFckj.js";import{j as e}from"./tanstack-DkmCf9xt.js";import{E as r}from"./ExamplePage-0qWnZ_dA.js";import{L as o}from"./LazyScene-DSQ5lMvL.js";import"./three-Cne9AhED.js";import"./button-5B8zUrBJ.js";import"./utils-DH51L_4Q.js";import"./index-CRRPCOay.js";import"./code-xml-CkVGhwGM.js";const i=`import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  Color,
  Points,
  Vector3,
} from 'three';

const COUNT = 600;
const COLOR_HEAD = new Color('#a78bfa');
const COLOR_TAIL = new Color('#22d3ee');

function CursorTrail() {
  const pointsRef = useRef<Points>(null);
  const { viewport } = useThree();

  // Pre-allocated buffers
  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      sizes[i] = 0.04 * (1 - i / COUNT) + 0.01;
    }
    return { positions, colors, sizes };
  }, []);

  // Ring buffer head
  const head = useRef(0);
  const target = useRef(new Vector3());

  useFrame(({ pointer }) => {
    const points = pointsRef.current;
    if (!points) return;

    target.current.set(
      (pointer.x * viewport.width) / 2,
      (pointer.y * viewport.height) / 2,
      0,
    );

    head.current = (head.current + 1) % COUNT;
    const i3 = head.current * 3;
    positions[i3] = target.current.x;
    positions[i3 + 1] = target.current.y;
    positions[i3 + 2] = 0;

    // Walk back through the ring buffer assigning age-based colors
    const tmp = new Color();
    for (let i = 0; i < COUNT; i++) {
      const age = (head.current - i + COUNT) % COUNT;
      const t = age / COUNT;
      tmp.copy(COLOR_HEAD).lerp(COLOR_TAIL, t);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }

    const geom = points.geometry;
    (geom.attributes.position as BufferAttribute).needsUpdate = true;
    (geom.attributes.color as BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={COUNT}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={COUNT}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.95}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

export default function TrailScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#050507']} />
      <CursorTrail />
    </Canvas>
  );
}
`;function d(){return e.jsx(r,{title:"Cursor Trail",description:"600 points stored in a ring buffer. Each frame, the head index advances and assumes the cursor's world position; per-vertex colors lerp from violet (head) to cyan (tail) by age, drawn additively for a glow.",seoDescription:"600-point ring-buffer cursor trail with age-lerped per-vertex colors and additive blending.",path:"/examples/trail",tags:["Ring buffer","Vertex colors","Pointer"],sourceCode:i,filename:"TrailScene.tsx",children:e.jsx(o,{loader:()=>t(()=>import("./TrailScene-DnUrLuOE.js"),__vite__mapDeps([0,1,2,3])),height:"h-[75vh]",label:"Allocating trail buffer…"})})}export{d as component};
