import { useEffect, useRef } from 'react';
import { lerp, rand, pick } from '@/lib/math';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** Parallax depth, 0 (far) .. 1 (near). */
  depth: number;
  color: string;
  alpha: number;
}

const COLORS = ['#22d3ee', '#818cf8', '#f472b6'];

/**
 * Ambient background layer — soft glowing particles that drift upward and
 * parallax-lerp toward the pointer. Purely decorative; no physics, no input.
 */
export function ParticleField({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let raf = 0;

    // Parallax: `target` follows the pointer, `eased` lerps toward it.
    const target = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };

    const seed = () => {
      const count = reduced
        ? 18
        : Math.round(Math.min(70, Math.max(28, (w * h) / 22000)));
      particles = Array.from({ length: count }, () => ({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-0.12, 0.12),
        vy: rand(-0.42, -0.1),
        r: rand(0.6, 2.4),
        depth: rand(0.15, 1),
        color: pick(COLORS),
        alpha: rand(0.15, 0.6),
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = () => {
      eased.x = lerp(eased.x, target.x, 0.06);
      eased.y = lerp(eased.y, target.y, 0.06);
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -8) {
            p.y = h + 8;
            p.x = rand(0, w);
          }
          if (p.x < -8) p.x = w + 8;
          if (p.x > w + 8) p.x = -8;
        }
        const px = p.x + eased.x * p.depth * 26;
        const py = p.y + eased.y * p.depth * 26;
        const glow = ctx.createRadialGradient(px, py, 0, px, py, p.r * 4);
        glow.addColorStop(0, p.color);
        glow.addColorStop(1, 'transparent');
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
