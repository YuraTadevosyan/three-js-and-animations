import Matter from 'matter-js';
import type { CardDef, OrbDef } from './cards';
import { rand } from './math';

const { Bodies, Body } = Matter;

/** Static walls extend this far past the viewport so fast bodies can't tunnel. */
export const WALL_THICKNESS = 400;

/** A physics body paired with the metadata needed to sync it to the DOM. */
export interface PhysicsItem {
  id: string;
  kind: 'card' | 'orb';
  body: Matter.Body;
  /** Render size in CSS pixels — the DOM node is offset by half of this. */
  w: number;
  h: number;
}

/** Rounded rectangle body for a UI card. Chamfered corners match the CSS
 *  border-radius so contacts resolve where the card visually touches. */
export function createCardBody(def: CardDef, x: number, y: number): Matter.Body {
  return Bodies.rectangle(x, y, def.w, def.h, {
    label: def.id,
    chamfer: { radius: Math.min(16, def.h / 2 - 2) },
    restitution: 0.32,
    friction: 0.06,
    frictionAir: 0.012,
    density: 0.0016,
    angle: rand(-0.16, 0.16),
  });
}

/** A light, bouncy circle — the "floating particle" bodies. */
export function createOrbBody(def: OrbDef, x: number, y: number): Matter.Body {
  return Bodies.circle(x, y, def.r, {
    label: def.id,
    restitution: 0.9,
    friction: 0.003,
    frictionAir: 0.006,
    density: 0.0011,
  });
}

/** Four fresh static slabs framing a `w × h` viewport. Recreated on resize. */
export function buildWalls(w: number, h: number): Matter.Body[] {
  const t = WALL_THICKNESS;
  const opts: Matter.IChamferableBodyDefinition = {
    isStatic: true,
    restitution: 0,
    friction: 0.25,
    label: 'wall',
  };
  return [
    Bodies.rectangle(w / 2, -t / 2, w + t * 2, t, opts), // top
    Bodies.rectangle(w / 2, h + t / 2, w + t * 2, t, opts), // bottom
    Bodies.rectangle(-t / 2, h / 2, t, h + t * 2, opts), // left
    Bodies.rectangle(w + t / 2, h / 2, t, h + t * 2, opts), // right
  ];
}

/** A random spawn point in the upper band of the stage, kept clear of walls. */
export function scatterPosition(
  w: number,
  h: number,
  halfW: number,
  halfH: number,
): { x: number; y: number } {
  const mx = halfW + 12;
  const my = halfH + 12;
  return {
    x: rand(mx, Math.max(mx + 1, w - mx)),
    y: rand(my, Math.max(my + 1, h * 0.44)),
  };
}

/** Drop a body back to a spawn point with its motion cleared. */
export function resetBody(body: Matter.Body, x: number, y: number): void {
  Body.setPosition(body, { x, y });
  Body.setAngle(body, rand(-0.16, 0.16));
  Body.setVelocity(body, { x: 0, y: 0 });
  Body.setAngularVelocity(body, 0);
}

/** Blast every item radially outward from `(cx, cy)`. Force scales with mass
 *  so light orbs and heavy cards pick up a comparable velocity. */
export function explode(
  items: PhysicsItem[],
  cx: number,
  cy: number,
  strength: number,
): void {
  for (const { body } of items) {
    const dx = body.position.x - cx;
    const dy = body.position.y - cy;
    const d = Math.hypot(dx, dy) || 1;
    const f = strength * body.mass;
    Body.applyForce(body, body.position, { x: (dx / d) * f, y: (dy / d) * f });
    Body.setAngularVelocity(body, rand(-0.45, 0.45));
  }
}

/** Pull orbs toward `(x, y)` with a smooth distance falloff — the physics half
 *  of the "magnetic cursor". Cards are left alone so dragging stays crisp. */
export function applyMagnet(
  items: PhysicsItem[],
  x: number,
  y: number,
  radius: number,
  strength: number,
): void {
  for (const { kind, body } of items) {
    if (kind !== 'orb') continue;
    const dx = x - body.position.x;
    const dy = y - body.position.y;
    const d = Math.hypot(dx, dy);
    if (d < 1 || d > radius) continue;
    const falloff = 1 - d / radius;
    const f = strength * body.mass * falloff;
    Body.applyForce(body, body.position, { x: (dx / d) * f, y: (dy / d) * f });
  }
}

/** Closing speed of a collision pair — used to gate impact effects. */
export function impactSpeed(pair: Matter.Pair): number {
  const a = pair.bodyA.velocity;
  const b = pair.bodyB.velocity;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Matter has no public teardown for `Mouse` — it leaves its listeners on the
 * element. This removes every listener `Mouse.create` attached so re-mounting
 * (e.g. React StrictMode) never stacks duplicate handlers.
 */
export function detachMouse(mouse: Matter.Mouse): void {
  const handlers = mouse as unknown as Record<string, EventListener>;
  const el = mouse.element;
  if (!el) return;
  el.removeEventListener('mousemove', handlers.mousemove);
  el.removeEventListener('mousedown', handlers.mousedown);
  el.removeEventListener('mouseup', handlers.mouseup);
  el.removeEventListener('mousewheel', handlers.mousewheel);
  el.removeEventListener('DOMMouseScroll', handlers.mousewheel);
  el.removeEventListener('touchmove', handlers.mousemove);
  el.removeEventListener('touchstart', handlers.mousedown);
  el.removeEventListener('touchend', handlers.mouseup);
}
