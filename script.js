(() => {
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Year in footer.
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Reveal on scroll.
  const targets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    targets.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
      io.observe(el);
    });
  } else {
    targets.forEach((el) => el.classList.add('is-visible'));
  }

  // Cursor-tracked spotlight on cards.
  const cards = document.querySelectorAll('.card');
  cards.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    });
  });

  // Particle field on canvas. Light, throttled, DPR-clamped.
  if (prefersReducedMotion) return;
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let w = 0;
  let h = 0;
  let particles = [];
  const mouse = { x: -9999, y: -9999, active: false };

  const COLORS = ['#22d3ee', '#a78bfa', '#ec4899'];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    const area = w * h;
    // ~1 particle per 14000px², capped for high-res displays.
    const count = Math.max(28, Math.min(85, Math.round(area / 14000)));
    particles = new Array(count).fill(0).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.4,
      c: COLORS[(Math.random() * COLORS.length) | 0],
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    // Draw connecting lines.
    const linkDist = 130;
    const linkDistSq = linkDist * linkDist;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < linkDistSq) {
          const a = 1 - d2 / linkDistSq;
          ctx.strokeStyle = `rgba(167, 139, 250, ${a * 0.18})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    // Update and draw particles.
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 140 * 140 && d2 > 1) {
          const d = Math.sqrt(d2);
          const f = (140 - d) / 140;
          p.vx += (dx / d) * f * 0.06;
          p.vy += (dy / d) * f * 0.06;
        }
      }

      p.x += p.vx;
      p.y += p.vy;

      // Soft friction so they don't accelerate forever.
      p.vx *= 0.985;
      p.vy *= 0.985;

      // Wrap around edges.
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      ctx.fillStyle = p.c;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    rafId = requestAnimationFrame(step);
  }

  let rafId = 0;
  function start() {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(step);
  }
  function stop() {
    cancelAnimationFrame(rafId);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener(
    'pointermove',
    (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    },
    { passive: true },
  );
  window.addEventListener('pointerleave', () => {
    mouse.active = false;
  });

  // Pause animation when tab not visible to save battery.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  resize();
  start();
})();
