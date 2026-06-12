import { Check, Pipette } from 'lucide-react';

import type { SimpleColor } from '@/lib/config';
import { cn } from '@/lib/cn';

interface ColorFieldProps {
  colors: SimpleColor[];
  active: SimpleColor;
  onPick: (color: SimpleColor) => void;
  onCustom: (hex: string) => void;
  customDefault: string;
  pickerLabel: string;
}

/** A swatch grid + custom colour picker, shared by the headlight & taillight controls. */
export function ColorField({
  colors,
  active,
  onPick,
  onCustom,
  customDefault,
  pickerLabel,
}: ColorFieldProps) {
  const customActive = active.id === 'custom';

  return (
    <>
      <div className="grid grid-cols-8 gap-2 lg:grid-cols-6">
        {colors.map((c) => {
          const isActive = c.id === active.id;
          return (
            <button
              key={c.id}
              type="button"
              title={c.name}
              onClick={() => onPick(c)}
              className={cn(
                'relative aspect-square rounded-full border transition-transform duration-200 hover:scale-110',
                isActive ? 'border-neon ring-2 ring-neon/40' : 'border-white/15',
              )}
              style={{ background: c.hex }}
            >
              {isActive && (
                <Check
                  size={12}
                  className="absolute inset-0 m-auto text-white mix-blend-difference"
                  strokeWidth={3}
                />
              )}
            </button>
          );
        })}
      </div>

      <label
        className={cn(
          'mt-3 flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
          customActive
            ? 'border-neon/50 bg-neon/[0.07]'
            : 'border-white/10 bg-white/[0.02] hover:border-white/20',
        )}
      >
        <span
          className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-white/20"
          style={{
            background: customActive
              ? active.hex
              : 'conic-gradient(from 0deg, #ff4d3d, #f2c20b, #15d6a0, #3dd7ff, #5b2a8c, #ff4d3d)',
          }}
        >
          <input
            type="color"
            value={customActive ? active.hex : customDefault}
            onChange={(e) => onCustom(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={pickerLabel}
          />
          {!customActive && <Pipette size={13} className="relative text-white drop-shadow" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-white">{pickerLabel}</span>
          <span className="block text-[11px] text-white/45">
            {customActive ? active.hex.toUpperCase() : 'Pick any shade'}
          </span>
        </span>
      </label>
    </>
  );
}
