import{j as o,a as n}from"./tanstack-DkmCf9xt.js";import{C as s,O as l,u}from"./r3f-BUcHFckj.js";import{i as a}from"./three-Cne9AhED.js";import{u as v}from"./useReducedMotion-CPYmCr-8.js";const m=`uniform float uTime;
varying vec2 vUv;
varying float vElevation;

void main() {
  vUv = uv;
  vec3 pos = position;

  float elevation =
    sin(pos.x * 2.0 + uTime * 0.8) * 0.18 +
    sin(pos.y * 2.5 + uTime * 1.2) * 0.14;

  pos.z += elevation;
  vElevation = elevation;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`,c=`uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec2 vUv;
varying float vElevation;

void main() {
  float mixFactor = smoothstep(-0.2, 0.3, vElevation);
  vec3 color = mix(uColorA, uColorB, mixFactor);

  // Subtle grid lines
  float grid = step(0.985, max(
    abs(fract(vUv.x * 12.0) - 0.5),
    abs(fract(vUv.y * 12.0) - 0.5)
  ));
  color += grid * 0.15;

  gl_FragColor = vec4(color, 1.0);
}
`;function f(){const e=n.useRef(null),r=v(),t=n.useMemo(()=>({uTime:{value:0},uColorA:{value:new a("#1e1b4b")},uColorB:{value:new a("#a78bfa")}}),[]);return u((p,i)=>{!e.current||r||(e.current.uniforms.uTime.value+=i)}),o.jsxs("mesh",{rotation:[-Math.PI/3,0,0],children:[o.jsx("planeGeometry",{args:[6,6,128,128]}),o.jsx("shaderMaterial",{ref:e,vertexShader:m,fragmentShader:c,uniforms:t})]})}function b(){return o.jsxs(s,{dpr:[1,1.5],camera:{position:[0,1.6,3.5],fov:50},gl:{antialias:!0,powerPreference:"high-performance"},children:[o.jsx("color",{attach:"background",args:["#09090b"]}),o.jsx(f,{}),o.jsx(l,{enablePan:!1,enableZoom:!1,autoRotate:!0,autoRotateSpeed:.6})]})}export{b as default};
