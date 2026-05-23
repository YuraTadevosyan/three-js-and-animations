import { memo } from 'react';
import { ACCENTS, type OrbDef } from '@/lib/cards';

interface PhysicsOrbProps {
  def: OrbDef;
  registerEl: (id: string, el: HTMLElement | null) => void;
}

/**
 * A glowing circular body — the "floating particle" half of the playground.
 * Like `PhysicsCard`, its transform is rewritten every frame by the sync loop,
 * so the component is memoised and never re-renders after mount.
 */
function PhysicsOrbImpl({ def, registerEl }: PhysicsOrbProps) {
  const a = ACCENTS[def.accent];
  return (
    <div
      className="physics-body"
      ref={(el) => registerEl(def.id, el)}
      style={{ width: def.r * 2, height: def.r * 2 }}
    >
      <div
        className="h-full w-full rounded-full"
        style={{
          background: `radial-gradient(circle at 34% 30%, rgba(${a.rgb},0.95), rgba(${a.rgb},0.4) 58%, rgba(${a.rgb},0.08) 100%)`,
          border: `1px solid rgba(${a.rgb},0.55)`,
          boxShadow: `0 0 ${Math.round(def.r)}px rgba(${a.rgb},0.5), inset 0 0 ${Math.round(def.r * 0.7)}px rgba(255,255,255,0.18)`,
        }}
      />
    </div>
  );
}

export const PhysicsOrb = memo(PhysicsOrbImpl);
