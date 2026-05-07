import{j as e,a as o}from"./tanstack-DkmCf9xt.js";import{C as s,O as t,u as l}from"./r3f-BUcHFckj.js";import{i as c,aC as m,D as v}from"./three-Cne9AhED.js";import{u}from"./useReducedMotion-CPYmCr-8.js";const d=`varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mvPosition;
}
`,f=`uniform float uTime;
uniform vec3 uColor;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
  // Fresnel: bright at glancing angles, dim head-on
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.5);

  // Animated scanlines along Y
  float scan = sin(vUv.y * 80.0 - uTime * 4.0) * 0.5 + 0.5;
  scan = smoothstep(0.4, 0.6, scan);

  // Soft horizontal sweep
  float sweep = smoothstep(
    0.0,
    0.4,
    abs(fract(vUv.y - uTime * 0.15) - 0.5)
  );

  vec3 color = uColor * (0.15 + fresnel * 1.4);
  color += uColor * scan * 0.18;
  color *= 0.85 + sweep * 0.3;

  // Output as additive-friendly: clamp alpha by fresnel for transparent edges
  gl_FragColor = vec4(color, 0.55 + fresnel * 0.45);
}
`;function p(){const n=o.useRef(null),r=u(),a=o.useMemo(()=>({uTime:{value:0},uColor:{value:new c("#22d3ee")}}),[]);return l((g,i)=>{!n.current||r||(n.current.uniforms.uTime.value+=i)}),e.jsxs("group",{children:[e.jsxs("mesh",{children:[e.jsx("icosahedronGeometry",{args:[1.2,8]}),e.jsx("shaderMaterial",{ref:n,vertexShader:d,fragmentShader:f,uniforms:a,transparent:!0,depthWrite:!1,side:v,blending:m})]}),e.jsxs("mesh",{children:[e.jsx("icosahedronGeometry",{args:[.55,2]}),e.jsx("meshBasicMaterial",{color:"#0e7490",wireframe:!0})]})]})}function y(){return e.jsxs(s,{dpr:[1,1.5],camera:{position:[0,0,4],fov:50},gl:{antialias:!0,powerPreference:"high-performance"},children:[e.jsx("color",{attach:"background",args:["#020617"]}),e.jsx("ambientLight",{intensity:.3}),e.jsx(p,{}),e.jsx(t,{enablePan:!1,autoRotate:!0,autoRotateSpeed:.6,minDistance:2.5,maxDistance:6})]})}export{y as default};
