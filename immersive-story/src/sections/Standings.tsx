import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from '@/components/SplitText';
import data from '@/data/standings.json';

// Final La Liga table. The JSON next to this file is generated at build
// time by `scripts/fetch-standings.mjs`, which scrapes the standings off
// the 2025-26 La Liga article on Wikipedia. The component is intentionally
// passive — no fetching, no transforms beyond the top-10 slice — so the
// only way the data goes stale is by skipping the fetch step on build.
const ROWS = data.rows.slice(0, 10);
const BARCA = data.rows.find((r) => /barcelona/i.test(r.team));

export function Standings() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-table-row]',
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.05,
          scrollTrigger: { trigger: ref.current, start: 'top 75%' },
        },
      );
      gsap.fromTo(
        '[data-barca-stat]',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.07,
          scrollTrigger: { trigger: ref.current, start: 'top 70%' },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="chapter relative px-[6vw] py-[16vh]"
      data-chapter="4"
      aria-label="La Liga standings"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, rgba(0,77,152,0.18) 0%, transparent 55%), radial-gradient(ellipse at 90% 100%, rgba(237,187,0,0.12) 0%, transparent 50%)',
        }}
      />
      <div className="relative z-10 max-w-6xl mb-12">
        <div className="stripe max-w-[120px] mb-10" />
        <span className="eyebrow block mb-6">03 — Where we stand</span>
        <SplitText
          as="h2"
          splitBy="lines"
          stagger={0.1}
          duration={1.0}
          start="top 80%"
          className="display text-bone text-[clamp(2.8rem,7vw,7rem)] leading-[0.92]"
          text={`LA LIGA\n${data.season}.`}
        />
        <p className="mt-8 max-w-xl text-bone/70 leading-relaxed text-[1.05rem]">
          Final standings from the {data.season} La Liga season. Pulled from
          Wikipedia at build time — refresh by running{' '}
          <code className="text-bone/85 bg-bone/5 px-1.5 py-0.5 rounded">npm run fetch:standings</code>.
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Table column. Custom-rendered instead of <table> so we can apply
            per-row styling cleanly and animate via GSAP. */}
        <div className="lg:col-span-8">
          <div className="caption mb-4 text-bone/55">Top 10 · Final table</div>
          <div className="grid gap-px bg-bone/5 border border-bone/10">
            <Header />
            {ROWS.map((row) => (
              <Row key={row.pos} row={row} />
            ))}
          </div>
          <div className="caption mt-4 text-bone/40 text-[0.65rem]">
            Source: {data.source} · fetched {data.fetchedAt}
          </div>
        </div>

        {/* Barça-specific season callout — the table is dense, this is the
            single-glance summary. */}
        <div className="lg:col-span-4">
          {BARCA && (
            <div
              className="border p-6 md:p-7 relative overflow-hidden"
              style={{ borderColor: 'var(--gold)', background: 'rgba(237,187,0,0.04)' }}
            >
              <div className="caption mb-2 text-[var(--gold)]">Champions</div>
              <div
                className="display text-bone leading-none mb-1"
                style={{ fontSize: 'clamp(2.4rem, 4vw, 3.4rem)' }}
              >
                {BARCA.team}
              </div>
              <div className="caption text-bone/55 mb-6">
                Position 01 · {BARCA.pts} pts
              </div>

              <div className="grid grid-cols-3 gap-y-5 gap-x-3">
                <StatCell label="Won"    value={BARCA.won}   />
                <StatCell label="Drawn"  value={BARCA.drawn} />
                <StatCell label="Lost"   value={BARCA.lost}  />
                <StatCell label="GF"     value={BARCA.gf}    />
                <StatCell label="GA"     value={BARCA.ga}    />
                <StatCell label="GD"     value={(BARCA.gd >= 0 ? '+' : '') + BARCA.gd} />
              </div>

              <p className="mt-6 text-bone/65 text-[0.85rem] leading-snug">
                One draw in thirty-eight matches. A 59-goal swing on the table.
                Spain's title returns to Camp Nou.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Header() {
  return (
    <div className="grid grid-cols-[3rem_1fr_2.4rem_2.4rem_2.4rem_2.4rem_3rem_3rem] sm:grid-cols-[3rem_1fr_3rem_3rem_3rem_3rem_3.6rem_3.6rem] gap-3 px-4 md:px-5 py-3 caption text-bone/45 bg-ink">
      <span>Pos</span>
      <span>Team</span>
      <span className="text-right hidden sm:inline">P</span>
      <span className="text-right hidden sm:inline">W</span>
      <span className="text-right hidden sm:inline">D</span>
      <span className="text-right hidden sm:inline">L</span>
      <span className="text-right">GD</span>
      <span className="text-right">Pts</span>
    </div>
  );
}

type Row = (typeof data.rows)[number];

function Row({ row }: { row: Row }) {
  const isBarca = /barcelona/i.test(row.team);
  return (
    <div
      data-table-row
      className="grid grid-cols-[3rem_1fr_2.4rem_2.4rem_2.4rem_2.4rem_3rem_3rem] sm:grid-cols-[3rem_1fr_3rem_3rem_3rem_3rem_3.6rem_3.6rem] gap-3 items-center px-4 md:px-5 py-3 bg-ink/70"
      style={
        isBarca
          ? {
              background: 'rgba(237,187,0,0.08)',
              boxShadow: 'inset 3px 0 0 var(--gold)',
            }
          : undefined
      }
    >
      <span
        className="font-mono tabular-nums"
        style={{ color: isBarca ? 'var(--gold)' : 'rgba(243,240,230,0.55)' }}
      >
        {String(row.pos).padStart(2, '0')}
      </span>
      <span className="flex items-center gap-2">
        <span className={isBarca ? 'text-bone display text-[1.05rem]' : 'text-bone/85'}>
          {row.team}
        </span>
        {row.qualification && <QualPill tag={row.qualification} />}
      </span>
      <span className="text-right tabular-nums text-bone/70 hidden sm:inline">{row.played}</span>
      <span className="text-right tabular-nums text-bone/70 hidden sm:inline">{row.won}</span>
      <span className="text-right tabular-nums text-bone/70 hidden sm:inline">{row.drawn}</span>
      <span className="text-right tabular-nums text-bone/70 hidden sm:inline">{row.lost}</span>
      <span
        className="text-right tabular-nums"
        style={{ color: row.gd > 0 ? 'rgba(243,240,230,0.85)' : 'rgba(243,240,230,0.55)' }}
      >
        {row.gd >= 0 ? '+' : ''}
        {row.gd}
      </span>
      <span
        className="text-right tabular-nums display text-[1.1rem]"
        style={{ color: isBarca ? 'var(--gold)' : 'rgba(243,240,230,0.95)' }}
      >
        {row.pts}
      </span>
    </div>
  );
}

const QUAL_COLOR: Record<string, string> = {
  UCL: 'var(--blue)',
  UEL: 'var(--gold)',
  UECL: 'rgba(243,240,230,0.4)',
  REL: 'var(--red)',
};

function QualPill({ tag }: { tag: string }) {
  return (
    <span
      className="caption px-1.5 py-0.5 border text-[0.55rem] tracking-[0.18em]"
      style={{ borderColor: QUAL_COLOR[tag] ?? 'rgba(243,240,230,0.3)', color: QUAL_COLOR[tag] }}
    >
      {tag}
    </span>
  );
}

function StatCell({ label, value }: { label: string; value: number | string }) {
  return (
    <div data-barca-stat>
      <div className="display text-bone leading-none tabular-nums" style={{ fontSize: '1.7rem' }}>
        {value}
      </div>
      <div className="caption text-bone/45 mt-1.5 text-[0.6rem]">{label}</div>
    </div>
  );
}
