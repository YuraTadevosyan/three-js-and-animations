export function Brand() {
  return (
    <div
      data-ui-enter="brand"
      className="pointer-events-none select-none"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-xs font-bold tracking-widest text-neon">
          M
        </span>
        <div className="leading-tight">
          <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-white/45">
            Configurator
          </p>
          <h1 className="text-shadow-glow text-lg font-semibold tracking-tight text-white">
            BMW E46 <span className="text-white/40">/ Coupé</span>
          </h1>
        </div>
      </div>
    </div>
  );
}
