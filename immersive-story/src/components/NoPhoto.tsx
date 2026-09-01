// Stand-in for a player with no freely-licensed photo on Wikimedia Commons.
//
// Two of the 2026-27 squad — Xavi Espart and Jesse Bisiwu — have no Commons
// file at all, and pulling an unlicensed press shot for them would undercut
// the credit list in the Outro. So the card falls back to a typographic
// treatment in the blaugrana gradient instead: initials in the same stroked
// display face the shirt numbers use, plus a small honest caption.
export function NoPhoto({ name, compact = false }: { name: string; compact?: boolean }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      data-player-photo
      className="absolute inset-0 grid place-items-center will-change-transform overflow-hidden"
      style={{
        background:
          'linear-gradient(150deg, var(--blue) 0%, rgba(5,8,15,1) 55%, var(--red) 140%)',
      }}
    >
      {/* Faint diagonal stripes so the panel reads as designed rather than
          as an image that failed to load. */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(243,240,230,0.65) 0 1px, transparent 1px 22px)',
        }}
      />
      <span
        className="display leading-none select-none relative"
        style={{
          fontSize: compact ? 'clamp(3rem, 9vw, 5rem)' : 'clamp(5rem, 14vw, 13rem)',
          WebkitTextStroke: '1.5px rgba(243,240,230,0.5)',
          color: 'transparent',
        }}
      >
        {initials}
      </span>
      {!compact && (
        <span className="caption absolute bottom-[12%] text-[0.6rem] text-bone/35 px-6 text-center">
          No freely-licensed photograph available
        </span>
      )}
    </div>
  );
}
