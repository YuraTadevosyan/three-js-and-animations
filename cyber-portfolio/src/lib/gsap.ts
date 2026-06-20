'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register on the client only (registerPlugin is idempotent). Importing this
// module from a client component guarantees the plugin is wired up before any
// animation runs.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
