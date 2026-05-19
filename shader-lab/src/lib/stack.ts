export interface TechItem {
  name: string;
  version?: string;
  role: string;
  accent: string;
  url: string;
}

export interface TechGroup {
  title: string;
  items: TechItem[];
}

/**
 * Versions mirror package.json — keep in sync when bumping dependencies.
 * Single source of truth so the About panel can't lie about what's shipped.
 */
export const STACK: TechGroup[] = [
  {
    title: 'Framework',
    items: [
      {
        name: 'React',
        version: '18.3',
        role: 'UI runtime for the lab shell, panels, and demo registry.',
        accent: '#22d3ee',
        url: 'https://react.dev',
      },
      {
        name: 'TypeScript',
        version: '5.6',
        role: 'Strict mode across the codebase, including shader-uniform shapes.',
        accent: '#60a5fa',
        url: 'https://www.typescriptlang.org',
      },
    ],
  },
  {
    title: '3D & GPU',
    items: [
      {
        name: 'Three.js',
        version: '0.169',
        role: 'Renderer, scene graph, ShaderMaterial pipeline.',
        accent: '#a78bfa',
        url: 'https://threejs.org',
      },
      {
        name: 'React Three Fiber',
        version: '8.17',
        role: 'Declarative R3F wrappers around the Three scene.',
        accent: '#c084fc',
        url: 'https://r3f.docs.pmnd.rs',
      },
      {
        name: 'GLSL ES (WebGL2)',
        role: 'Hand-written vertex & fragment shaders for every demo.',
        accent: '#34d399',
        url: 'https://registry.khronos.org/OpenGL-Refpages/es3.0/',
      },
    ],
  },
  {
    title: 'Build & Tooling',
    items: [
      {
        name: 'Vite',
        version: '5.4',
        role: 'Dev server, HMR, and production bundler.',
        accent: '#fbbf24',
        url: 'https://vitejs.dev',
      },
      {
        name: 'PostCSS + Autoprefixer',
        role: 'CSS pipeline behind Tailwind.',
        accent: '#fb923c',
        url: 'https://postcss.org',
      },
    ],
  },
  {
    title: 'Styling',
    items: [
      {
        name: 'Tailwind CSS',
        version: '3.4',
        role: 'Utility classes for the dark minimal UI.',
        accent: '#22d3ee',
        url: 'https://tailwindcss.com',
      },
      {
        name: 'clsx',
        version: '2.1',
        role: 'Conditional className composition.',
        accent: '#94a3b8',
        url: 'https://github.com/lukeed/clsx',
      },
    ],
  },
];
