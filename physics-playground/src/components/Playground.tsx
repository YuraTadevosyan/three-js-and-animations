import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Matter from 'matter-js';
import gsap from 'gsap';
import { ACCENTS, buildLayout } from '@/lib/cards';
import {
  applyMagnet,
  buildWalls,
  createCardBody,
  createOrbBody,
  detachMouse,
  explode,
  impactSpeed,
  resetBody,
  scatterPosition,
  type PhysicsItem,
} from '@/lib/physics';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ParticleField } from './ParticleField';
import { Header, type HeaderApi } from './Header';
import { ControlDock } from './ControlDock';
import { PhysicsCard } from './PhysicsCard';
import { PhysicsOrb } from './PhysicsOrb';
import { CollisionLayer, type CollisionApi } from './CollisionLayer';
import { MagneticCursor } from './MagneticCursor';
import { AboutPanel } from './AboutPanel';

/** Per-tick attractive force the magnet applies to each orb (× mass). */
const MAGNET_STRENGTH = 0.005;
/** One-shot radial impulse from the Explode button (× mass). */
const EXPLODE_STRENGTH = 0.046;
/** Minimum closing speed for a collision to score and flash. */
const IMPACT_THRESHOLD = 3.6;
/** Spacing between impact rings so a pile-up can't spawn hundreds. */
const FLASH_THROTTLE_MS = 38;
/** Engine timeScale while the Slow-mo button is on. */
const SLOWMO_SCALE = 0.35;

/** A one-off tip that fades itself away — kept isolated so it never re-renders
 *  the playground when it disappears. */
function Hint() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setShow(false), 6500);
    return () => window.clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 flex justify-center px-4">
      <p className="animate-fade-in rounded-full border border-white/[0.06] bg-ink-900/70 px-4 py-1.5 text-xs text-ink-300 backdrop-blur-md">
        Drag the cards &middot; fling them &middot; watch them collide
      </p>
    </div>
  );
}

export function Playground() {
  const reduced = useReducedMotion();
  const coarse = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches,
    [],
  );

  // The layout is sized to the viewport at mount; resizing only re-frames the
  // walls, not the cards, so this stays stable for the session.
  const layout = useMemo(
    () => buildLayout(window.innerWidth, window.innerHeight, reduced),
    [reduced],
  );

  const accentRgbById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of layout.cards) map.set(c.id, ACCENTS[c.accent].rgb);
    for (const o of layout.orbs) map.set(o.id, ACCENTS[o.accent].rgb);
    return map;
  }, [layout]);

  const [gravity, setGravity] = useState(true);
  const [magnet, setMagnet] = useState(false);
  const [slowMo, setSlowMo] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HeaderApi>(null);
  const collisionRef = useRef<CollisionApi>(null);

  const elsRef = useRef<Map<string, HTMLElement>>(new Map());
  const itemsRef = useRef<PhysicsItem[]>([]);
  const startPosRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const engineRef = useRef<Matter.Engine | null>(null);
  const settingsRef = useRef({ gravity: true, magnet: false, slowMo: false });
  const pointerRef = useRef({ x: 0, y: 0, inside: false });
  const collisionsRef = useRef(0);

  // Each card / orb hands its outer element here for the per-frame sync loop.
  const registerEl = useCallback((id: string, el: HTMLElement | null) => {
    if (el) elsRef.current.set(id, el);
    else elsRef.current.delete(id);
  }, []);

  // Mirror settings into a ref so the physics loop reads them without
  // re-running, and push gravity straight to the live engine.
  useEffect(() => {
    settingsRef.current = { gravity, magnet, slowMo };
    if (engineRef.current) engineRef.current.gravity.y = gravity ? 1 : 0;
  }, [gravity, magnet, slowMo]);

  // Slow-motion — scale the engine's tick rate without rebuilding the world.
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.timing.timeScale = slowMo ? SLOWMO_SCALE : 1;
    }
  }, [slowMo]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    let W = rect.width;
    let H = rect.height;

    const engine = Matter.Engine.create();
    engine.gravity.y = settingsRef.current.gravity ? 1 : 0;
    engine.timing.timeScale = settingsRef.current.slowMo ? SLOWMO_SCALE : 1;
    engineRef.current = engine;

    // --- Bodies ----------------------------------------------------------
    const items: PhysicsItem[] = [];
    const startPos = startPosRef.current;
    startPos.clear();

    for (const card of layout.cards) {
      const p = scatterPosition(W, H, card.w / 2, card.h / 2);
      startPos.set(card.id, p);
      items.push({
        id: card.id,
        kind: 'card',
        body: createCardBody(card, p.x, p.y),
        w: card.w,
        h: card.h,
      });
    }
    for (const orb of layout.orbs) {
      const p = scatterPosition(W, H, orb.r, orb.r);
      startPos.set(orb.id, p);
      items.push({
        id: orb.id,
        kind: 'orb',
        body: createOrbBody(orb, p.x, p.y),
        w: orb.r * 2,
        h: orb.r * 2,
      });
    }
    itemsRef.current = items;

    let walls = buildWalls(W, H);
    Matter.Composite.add(engine.world, [
      ...walls,
      ...items.map((it) => it.body),
    ]);

    // --- Pointer-driven dragging (mouse + touch) -------------------------
    const mouse = Matter.Mouse.create(stage);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.16,
        damping: 0.12,
        render: { visible: false },
      },
    });
    Matter.Composite.add(engine.world, mouseConstraint);

    // --- Per-frame DOM sync ----------------------------------------------
    const syncTransforms = () => {
      const dragged = mouseConstraint.body;
      for (const it of items) {
        const el = elsRef.current.get(it.id);
        if (!el) continue;
        const { x, y } = it.body.position;
        el.style.transform = `translate3d(${x - it.w / 2}px, ${y - it.h / 2}px, 0) rotate(${it.body.angle}rad)`;
        const dragging = it.body === dragged;
        if (dragging !== el.classList.contains('is-dragging')) {
          el.classList.toggle('is-dragging', dragging);
        }
      }
    };

    let frames = 0;
    let fpsClock = performance.now();
    const onAfterUpdate = () => {
      syncTransforms();
      frames++;
      const now = performance.now();
      if (now - fpsClock >= 500) {
        headerRef.current?.setFps(
          Math.min(120, Math.round((frames * 1000) / (now - fpsClock))),
        );
        frames = 0;
        fpsClock = now;
      }
    };

    // --- Magnetic cursor (physics half) ----------------------------------
    const magnetRadius = 240 + 180 * layout.scale;
    const onBeforeUpdate = () => {
      const s = settingsRef.current;
      const p = pointerRef.current;
      if (s.magnet && p.inside) {
        applyMagnet(items, p.x, p.y, magnetRadius, MAGNET_STRENGTH);
      }
    };

    // --- Collisions ------------------------------------------------------
    const flashFace = (body: Matter.Body) => {
      const inner = elsRef.current.get(body.label)
        ?.firstElementChild as HTMLElement | null;
      if (!inner) return;
      gsap.fromTo(
        inner,
        { filter: 'brightness(1.6)' },
        {
          filter: 'brightness(1)',
          duration: 0.45,
          ease: 'power2.out',
          overwrite: 'auto',
        },
      );
    };

    let lastFlash = 0;
    const onCollide = (e: Matter.IEventCollision<Matter.Engine>) => {
      let scored = false;
      for (const pair of e.pairs) {
        const a = pair.bodyA;
        const b = pair.bodyB;
        if (a.label === 'wall' && b.label === 'wall') continue;
        if (impactSpeed(pair) < IMPACT_THRESHOLD) continue;

        flashFace(a);
        flashFace(b);

        // Wall hits flash but don't score — only body-on-body counts.
        if (a.label === 'wall' || b.label === 'wall') continue;
        collisionsRef.current++;
        scored = true;

        const now = performance.now();
        if (now - lastFlash > FLASH_THROTTLE_MS) {
          lastFlash = now;
          const support = pair.collision?.supports?.[0];
          const cx = support ? support.x : (a.position.x + b.position.x) / 2;
          const cy = support ? support.y : (a.position.y + b.position.y) / 2;
          const rgb =
            accentRgbById.get(a.label) ??
            accentRgbById.get(b.label) ??
            '34, 211, 238';
          collisionRef.current?.flash(cx, cy, rgb);
        }
      }
      if (scored) headerRef.current?.setCollisions(collisionsRef.current);
    };

    Matter.Events.on(engine, 'beforeUpdate', onBeforeUpdate);
    Matter.Events.on(engine, 'afterUpdate', onAfterUpdate);
    Matter.Events.on(engine, 'collisionStart', onCollide);

    // --- Run -------------------------------------------------------------
    const runner = Matter.Runner.create();
    syncTransforms(); // position bodies before the first paint
    Matter.Runner.run(runner, engine);

    // --- Staggered entrance ---------------------------------------------
    const inners = items
      .map((it) => elsRef.current.get(it.id)?.firstElementChild ?? null)
      .filter((n): n is Element => n !== null);
    if (reduced) {
      gsap.set(inners, { opacity: 1, scale: 1 });
    } else {
      // fromTo (not from) pins explicit end values, so a tween killed mid-flight
      // on teardown can't leave a card stuck invisible.
      gsap.fromTo(
        inners,
        { opacity: 0, scale: 0.4 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: 'back.out(1.7)',
          stagger: { each: 0.03, from: 'random' },
        },
      );
    }

    // --- Pointer tracking for the magnet --------------------------------
    const onPointerMove = (ev: PointerEvent) => {
      pointerRef.current.x = ev.clientX;
      pointerRef.current.y = ev.clientY;
      pointerRef.current.inside = true;
    };
    const onPointerOut = () => {
      pointerRef.current.inside = false;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('blur', onPointerOut);
    document.addEventListener('pointerleave', onPointerOut);

    // --- Resize re-frames the walls only --------------------------------
    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const r = stage.getBoundingClientRect();
        W = r.width;
        H = r.height;
        Matter.Composite.remove(engine.world, walls);
        walls = buildWalls(W, H);
        Matter.Composite.add(engine.world, walls);
      }, 180);
    });
    ro.observe(stage);

    return () => {
      window.clearTimeout(resizeTimer);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('blur', onPointerOut);
      document.removeEventListener('pointerleave', onPointerOut);
      Matter.Events.off(engine, 'beforeUpdate', onBeforeUpdate);
      Matter.Events.off(engine, 'afterUpdate', onAfterUpdate);
      Matter.Events.off(engine, 'collisionStart', onCollide);
      Matter.Runner.stop(runner);
      detachMouse(mouse);
      for (const it of items) {
        const inner = elsRef.current.get(it.id)?.firstElementChild;
        if (inner) gsap.killTweensOf(inner);
      }
      Matter.Composite.clear(engine.world, false, true);
      Matter.Engine.clear(engine);
      engineRef.current = null;
      itemsRef.current = [];
    };
  }, [layout, reduced, accentRgbById]);

  const handleExplode = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    explode(itemsRef.current, r.width / 2, r.height / 2, EXPLODE_STRENGTH);
  }, []);

  const handleReset = useCallback(() => {
    for (const it of itemsRef.current) {
      const p = startPosRef.current.get(it.id);
      if (p) resetBody(it.body, p.x, p.y);
    }
    collisionsRef.current = 0;
    headerRef.current?.setCollisions(0);
  }, []);

  // Keyboard shortcuts. Esc always closes About; the rest are gated when the
  // panel is open so the user can read it without the world reacting.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
        return;
      }
      if (e.key === 'Escape') {
        if (aboutOpen) setAboutOpen(false);
        return;
      }
      if (aboutOpen) return;
      switch (e.key.toLowerCase()) {
        case 'g':
          setGravity((g) => !g);
          break;
        case 'm':
          setMagnet((m) => !m);
          break;
        case 's':
          setSlowMo((s) => !s);
          break;
        case 'r':
          handleReset();
          break;
        case 'e':
        case ' ':
          e.preventDefault();
          handleExplode();
          break;
        case '?':
        case '/':
        case 'i':
          setAboutOpen((o) => !o);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aboutOpen, handleExplode, handleReset]);

  return (
    <main className="physics-stage cursor-hidden relative h-full w-full overflow-hidden bg-ink-950">
      <ParticleField reduced={reduced} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(125% 85% at 50% 32%, transparent 52%, rgba(0,0,0,0.62) 100%)',
        }}
      />

      <Header
        ref={headerRef}
        bodies={layout.cards.length + layout.orbs.length}
        onAboutClick={() => setAboutOpen(true)}
      />

      <div ref={stageRef} className="absolute inset-0">
        {layout.cards.map((card) => (
          <PhysicsCard
            key={card.id}
            def={card}
            scale={layout.scale}
            registerEl={registerEl}
            toggleOn={card.id === 'toggle-grav' ? gravity : undefined}
          />
        ))}
        {layout.orbs.map((orb) => (
          <PhysicsOrb key={orb.id} def={orb} registerEl={registerEl} />
        ))}
        <CollisionLayer ref={collisionRef} />
      </div>

      <Hint />

      <ControlDock
        gravity={gravity}
        magnet={magnet}
        slowMo={slowMo}
        onToggleGravity={() => setGravity((g) => !g)}
        onToggleMagnet={() => setMagnet((m) => !m)}
        onToggleSlowMo={() => setSlowMo((s) => !s)}
        onExplode={handleExplode}
        onReset={handleReset}
      />

      <AboutPanel open={aboutOpen} onClose={() => setAboutOpen(false)} />

      {!coarse && <MagneticCursor />}
    </main>
  );
}
