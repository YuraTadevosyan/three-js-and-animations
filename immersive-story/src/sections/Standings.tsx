import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { SplitText } from '@/components/SplitText';
import { useLiveStandings } from '@/hooks/useLiveStandings';
import { MatchStrip } from '@/components/MatchStrip';
import baked from '@/data/standings.json';
import { SOURCE_URL, type Fixture, type LiveRow } from '@/lib/laliga';

// Live La Liga board.
//
// Two data paths, one shape. `standings.json` is fetched at build time and
// ships in the bundle, so the section paints a real table on the first frame.
// Once it scrolls into view the same client runs again in the browser against
// ESPN's keyless, CORS-open API — table and fixtures together — and takes over,
// polling every 25 s while a match is being played. In-flight scores are folded
// into the table and it re-ranks, so positions move as the goals go in. If the
// network is gone the baked table stays put and the chip says so; there is no
// state in which this section is empty.

const TOP_N = 10;

export function Standings() {
  const ref = useRef<HTMLElement | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const {
    rows,
    liveFixtures,
    nextFixture,
    status,
    isLive,
    matchday,
    complete,
    updatedAt,
    fetchedAt,
    refresh,
  } = useLiveStandings(inView);

  const visible = expanded ? rows : rows.slice(0, TOP_N);
  const barca = useMemo(() => rows.find((r) => /barcelona/i.test(r.team)), [rows]);
  const barcaFixture = useMemo(
    () =>
      barca
        ? liveFixtures.find(
            (f) => f.home.teamId === barca.teamId || f.away.teamId === barca.teamId,
          ) ?? null
        : null,
    [liveFixtures, barca],
  );
  // Points to the side directly above — the number that actually matters in a
  // title race, and the one a static "final table" could never show.
  const chasing = useMemo(
    () => (barca && barca.livePos > 1 ? rows[barca.livePos - 2] ?? null : null),
    [rows, barca],
  );
  const nearest = useMemo(
    () => (barca ? rows[barca.livePos] ?? null : null),
    [rows, barca],
  );

  // Arm the live fetch only once the section is genuinely approaching the
  // viewport, and disarm it again when it leaves so the poll stops.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '400px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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

  // Rows 11-20 arrive after the entrance tween has already run, so they get
  // their own stagger when the reader expands the table.
  useEffect(() => {
    if (!expanded || !tableRef.current) return;
    const extra = tableRef.current.querySelectorAll('[data-table-row]:nth-child(n+12)');
    if (!extra.length) return;
    gsap.fromTo(
      extra,
      { x: -16, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.04 },
    );
  }, [expanded]);

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
          text={`LA LIGA\n${baked.season}.`}
        />
        <p className="mt-8 max-w-xl text-bone/70 leading-relaxed text-[1.05rem]">
          {complete
            ? `Final ${baked.season} standings.`
            : `The table as it stands after matchday ${matchday}.`}{' '}
          It refreshes itself while you&rsquo;re reading, and when a match is in
          play the running score is folded straight into the table — so the
          positions move as the goals go in.
        </p>
      </div>

      {/* Matches first: the live score is the reason to look at this section
          at all on a Sunday afternoon. */}
      <div className="relative z-10 mb-10">
        <MatchStrip live={liveFixtures} next={nextFixture} />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Table column. Custom-rendered instead of <table> so we can apply
            per-row styling cleanly and animate via GSAP. */}
        <div className="lg:col-span-8">
          <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="caption text-bone/55">
              {expanded ? 'Full table' : `Top ${TOP_N}`} ·{' '}
              {complete ? 'Final' : `Matchday ${matchday}`}
              {isLive && ' · provisional'}
            </div>
            <StatusChip
              status={status}
              isLive={isLive}
              liveCount={liveFixtures.length}
              updatedAt={updatedAt}
              fetchedAt={fetchedAt}
              onRefresh={refresh}
            />
          </div>

          <div ref={tableRef} className="grid gap-px bg-bone/5 border border-bone/10">
            <Header />
            {visible.map((row) => (
              <Row key={row.teamId} row={row} />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="caption border border-bone/20 px-3 py-1.5 text-bone/70 hover:text-bone hover:border-bone/45 transition-colors"
            >
              {expanded ? '– Top 10 only' : `+ All ${rows.length} clubs`}
            </button>
            <a
              className="caption text-[0.65rem] text-bone/40 hover:text-bone/70 transition-colors"
              href={SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Live data: ESPN ↗
            </a>
          </div>

          {isLive && (
            <p className="caption mt-3 text-[0.62rem] text-bone/35 max-w-lg leading-relaxed">
              Positions include matches in progress. Ties are broken on goal
              difference, then goals scored — La Liga settles them on
              head-to-head, which only differs between sides level on points.
            </p>
          )}
        </div>

        {/* Barça-specific callout — the table is dense, this is the
            single-glance summary. */}
        <div className="lg:col-span-4">
          {barca && (
            <div
              className="border p-6 md:p-7 relative overflow-hidden"
              style={{ borderColor: 'var(--gold)', background: 'rgba(237,187,0,0.04)' }}
            >
              <div className="caption mb-2 text-[var(--gold)] flex items-center gap-2">
                {barcaFixture ? (
                  <>
                    <LiveDot />
                    Playing now · {barcaFixture.clock}
                  </>
                ) : complete && barca.livePos === 1 ? (
                  'Champions'
                ) : barca.livePos === 1 ? (
                  'Top of the table'
                ) : (
                  `Position ${String(barca.livePos).padStart(2, '0')}`
                )}
              </div>
              <div
                className="display text-bone leading-none mb-1"
                style={{ fontSize: 'clamp(2.4rem, 4vw, 3.4rem)' }}
              >
                {barca.team}
              </div>
              <div className="caption text-bone/55 mb-6">
                {barca.pts} pts · {barca.played} played
                {barca.delta !== 0 && (
                  <>
                    {' · '}
                    <DeltaChip delta={barca.delta} inline />
                  </>
                )}
              </div>

              <div className="grid grid-cols-3 gap-y-5 gap-x-3">
                <StatCell label="Won"   value={barca.won} />
                <StatCell label="Drawn" value={barca.drawn} />
                <StatCell label="Lost"  value={barca.lost} />
                <StatCell label="GF"    value={barca.gf} />
                <StatCell label="GA"    value={barca.ga} />
                <StatCell label="GD"    value={(barca.gd >= 0 ? '+' : '') + barca.gd} />
              </div>

              <p className="mt-6 text-bone/65 text-[0.85rem] leading-snug">
                <Callout
                  barca={barca}
                  chasing={chasing}
                  nearest={nearest}
                  complete={complete}
                  fixture={barcaFixture}
                />
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// One sentence that stays true whatever the table says — mid-match, a title
// race, a chase, or a finished season.
function Callout({
  barca,
  chasing,
  nearest,
  complete,
  fixture,
}: {
  barca: LiveRow;
  chasing: LiveRow | null;
  nearest: LiveRow | null;
  complete: boolean;
  fixture: Fixture | null;
}) {
  if (fixture) {
    const home = fixture.home.teamId === barca.teamId;
    const own = home ? fixture.home.score : fixture.away.score;
    const opp = home ? fixture.away.score : fixture.home.score;
    const other = home ? fixture.away.name : fixture.home.name;
    const verb = own > opp ? 'Leading' : own === opp ? 'Level with' : 'Behind';
    return (
      <>
        {verb} {other} {own}–{opp} {home ? 'at Camp Nou' : 'away'}, {fixture.clock}.
        The table above already counts it.
      </>
    );
  }

  const played = `${barca.played} ${barca.played === 1 ? 'match' : 'matches'}`;

  if (complete) {
    if (barca.livePos === 1) {
      return (
        <>
          {barca.won} wins from {barca.played}. A {barca.gd >= 0 ? '+' : ''}
          {barca.gd}-goal swing on the table. Spain&rsquo;s title stays at Camp Nou.
        </>
      );
    }
    const margin = chasing ? chasing.pts - barca.pts : null;
    return (
      <>
        Finished {barca.livePos}
        {ordinal(barca.livePos)} on {barca.pts} points
        {margin !== null && margin > 0 && `, ${margin} behind`}.
      </>
    );
  }

  if (barca.livePos === 1) {
    const lead = nearest ? barca.pts - nearest.pts : 0;
    return (
      <>
        Top of the table after {played}
        {barca.lost === 0 && barca.drawn === 0 ? ', still perfect' : ''}.{' '}
        {nearest
          ? lead > 0
            ? `${lead} clear of ${nearest.team}.`
            : `Level on points with ${nearest.team}, ahead on goal difference.`
          : ''}
      </>
    );
  }

  const gap = chasing ? chasing.pts - barca.pts : 0;
  return (
    <>
      {barca.livePos}
      {ordinal(barca.livePos)} after {played}
      {chasing && gap > 0 ? `, ${gap} behind ${chasing.team}.` : '.'}
    </>
  );
}

const ordinal = (n: number) => {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return 'th';
  return ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
};

function LiveDot() {
  return (
    <span
      className="inline-block w-[7px] h-[7px] rounded-full shrink-0"
      style={{
        background: 'var(--red)',
        animation: 'standings-pulse 1.6s ease-in-out infinite',
      }}
    />
  );
}

const STATUS_COPY: Record<string, { dot: string; label: string }> = {
  snapshot: { dot: 'rgba(243,240,230,0.35)', label: 'Build snapshot' },
  loading: { dot: 'var(--blue)', label: 'Syncing…' },
  live: { dot: 'var(--gold)', label: 'Updated' },
  error: { dot: 'var(--red)', label: 'Offline · showing snapshot' },
};

function StatusChip({
  status,
  isLive,
  liveCount,
  updatedAt,
  fetchedAt,
  onRefresh,
}: {
  status: string;
  isLive: boolean;
  liveCount: number;
  updatedAt: Date | null;
  fetchedAt: string;
  onRefresh: () => void;
}) {
  const { dot, label } = STATUS_COPY[status] ?? STATUS_COPY.snapshot;
  const stamp =
    status === 'live' && updatedAt
      ? updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : fetchedAt;

  return (
    <div className="flex items-center gap-3">
      {/* Matches in play get their own badge — "live" should mean a ball is
          rolling, not merely that a fetch succeeded. */}
      {isLive && status !== 'error' && (
        <span
          className="caption flex items-center gap-2 text-[0.62rem] px-2 py-1 border"
          style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
        >
          <LiveDot />
          LIVE · {liveCount} {liveCount === 1 ? 'match' : 'matches'}
        </span>
      )}
      <span className="caption flex items-center gap-2 text-[0.62rem] text-bone/60">
        <span className="inline-block w-[7px] h-[7px] rounded-full" style={{ background: dot }} />
        {label} · {stamp}
      </span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={status === 'loading'}
        aria-label="Refresh the league table"
        className="caption text-[0.62rem] border border-bone/20 px-2 py-1 text-bone/60 hover:text-bone hover:border-bone/45 disabled:opacity-40 transition-colors"
      >
        Refresh
      </button>
    </div>
  );
}

function Header() {
  return (
    <div className="grid grid-cols-[3.6rem_1fr_2.4rem_2.4rem_2.4rem_2.4rem_3rem_3rem] sm:grid-cols-[4rem_1fr_3rem_3rem_3rem_3rem_3.6rem_3.6rem] gap-3 px-4 md:px-5 py-3 caption text-bone/45 bg-ink">
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

function DeltaChip({ delta, inline = false }: { delta: number; inline?: boolean }) {
  if (!delta) return null;
  const up = delta > 0;
  return (
    <span
      className={`caption text-[0.55rem] tabular-nums ${inline ? '' : 'ml-0.5'}`}
      style={{ color: up ? '#7BD88F' : 'var(--red)' }}
      title={`${up ? 'Up' : 'Down'} ${Math.abs(delta)} since the confirmed table`}
    >
      {up ? '▲' : '▼'}
      {Math.abs(delta)}
    </span>
  );
}

function Row({ row }: { row: LiveRow }) {
  const isBarca = /barcelona/i.test(row.team);
  return (
    <div
      data-table-row
      className="grid grid-cols-[3.6rem_1fr_2.4rem_2.4rem_2.4rem_2.4rem_3rem_3rem] sm:grid-cols-[4rem_1fr_3rem_3rem_3rem_3rem_3.6rem_3.6rem] gap-3 items-center px-4 md:px-5 py-3 bg-ink/70 transition-colors"
      style={
        isBarca
          ? { background: 'rgba(237,187,0,0.08)', boxShadow: 'inset 3px 0 0 var(--gold)' }
          : row.live
            ? { background: 'rgba(165,0,68,0.09)', boxShadow: 'inset 3px 0 0 var(--red)' }
            : undefined
      }
    >
      <span className="flex items-baseline gap-1">
        <span
          className="font-mono tabular-nums"
          style={{ color: isBarca ? 'var(--gold)' : 'rgba(243,240,230,0.55)' }}
        >
          {String(row.livePos).padStart(2, '0')}
        </span>
        <DeltaChip delta={row.delta} />
      </span>
      <span className="flex items-center gap-2 min-w-0">
        {row.live && <LiveDot />}
        <span
          className={
            isBarca ? 'text-bone display text-[1.05rem] truncate' : 'text-bone/85 truncate'
          }
        >
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
      className="caption px-1.5 py-0.5 border text-[0.55rem] tracking-[0.18em] shrink-0"
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
