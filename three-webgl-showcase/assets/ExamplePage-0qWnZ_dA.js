import{a as d,j as e,L as f}from"./tanstack-DkmCf9xt.js";import{B as x}from"./button-5B8zUrBJ.js";import{c,a as m,S as u}from"./utils-DH51L_4Q.js";import{C as j}from"./code-xml-CkVGhwGM.js";/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=c("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=c("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=c("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=c("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);function p({code:s,className:r,label:a="Copy"}){const[l,o]=d.useState(!1),n=async()=>{try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(s);else{const t=document.createElement("textarea");t.value=s,t.style.position="fixed",t.style.opacity="0",document.body.appendChild(t),t.select(),document.execCommand("copy"),document.body.removeChild(t)}o(!0),window.setTimeout(()=>o(!1),1800)}catch{}};return e.jsx(x,{type:"button",variant:"outline",size:"sm",onClick:n,className:m("gap-1.5",r),"aria-live":"polite",children:l?e.jsxs(e.Fragment,{children:[e.jsx(g,{className:"h-3.5 w-3.5 text-emerald-500"}),"Copied"]}):e.jsxs(e.Fragment,{children:[e.jsx(N,{className:"h-3.5 w-3.5"}),a]})})}function w({code:s,filename:r}){const[a,l]=d.useState(!1);return e.jsxs("section",{className:"mt-8 rounded-xl border bg-card",children:[e.jsxs("header",{className:"flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3",children:[e.jsxs("button",{type:"button",onClick:()=>l(o=>!o),className:"inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground","aria-expanded":a,children:[e.jsx(j,{className:"h-4 w-4"}),e.jsx("span",{children:r??"Source code"}),e.jsx(b,{className:m("h-4 w-4 transition-transform",a&&"rotate-180")})]}),e.jsx(p,{code:s,label:"Copy code"})]}),a&&e.jsx("div",{className:"max-h-[60vh] overflow-auto",children:e.jsx("pre",{className:"m-0 p-4 text-xs leading-relaxed",children:e.jsx("code",{className:"font-mono text-foreground/90",children:s})})})]})}function S({title:s,description:r,seoDescription:a,path:l,tags:o,sourceCode:n,filename:t,children:h}){return e.jsxs(e.Fragment,{children:[e.jsx(u,{title:s,description:a??r,path:l}),e.jsxs("article",{className:"container py-8 sm:py-12",children:[e.jsxs("div",{className:"mb-8 flex flex-col gap-4",children:[e.jsx(x,{asChild:!0,variant:"ghost",size:"sm",className:"self-start -ml-3",children:e.jsxs(f,{to:"/examples",children:[e.jsx(y,{})," All examples"]})}),e.jsxs("div",{className:"flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",children:[e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsx("div",{className:"flex flex-wrap gap-2",children:o.map(i=>e.jsx("span",{className:"rounded-full border bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground",children:i},i))}),e.jsx("h1",{className:"text-3xl font-bold tracking-tight sm:text-4xl",children:s}),e.jsx("p",{className:"max-w-2xl text-muted-foreground",children:r})]}),n&&e.jsx("div",{className:"shrink-0",children:e.jsx(p,{code:n,label:"Copy source"})})]})]}),h,n&&e.jsx(w,{code:n,filename:t})]})]})}export{S as E};
