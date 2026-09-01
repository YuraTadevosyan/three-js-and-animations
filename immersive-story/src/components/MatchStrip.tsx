import type { Fixture } from '@/lib/laliga';

// The matches themselves. On a Sunday afternoon this is the reason to look at
// the section at all, so it sits above the table rather than under it.
//
// Three states, in priority order: something is being played (score + minute,
// scorers listed), nothing is being played but a kick-off is known (countdown),
// or the season is between rounds and there is nothing to say.
export function MatchStrip({
  live,
  next,
}: {
  live: Fixture[];
  next: Fixture | null;
}) {
  if (live.length) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {live.map((f) => (
          <LiveCard key={f.id} fixture={f} />
        ))}
      </div>
    );
  }
  if (next) return <NextCard fixture={next} />;
  return null;
}

function LiveCard({ fixture }: { fixture: Fixture }) {
  const barca =
    /barcelona/i.test(fixture.home.name) || /barcelona/i.test(fixture.away.name);
  return (
    <article
      className="border p-4 relative overflow-hidden"
      style={{
        borderColor: barca ? 'var(--gold)' : 'rgba(165,0,68,0.55)',
        background: barca ? 'rgba(237,187,0,0.05)' : 'rgba(165,0,68,0.06)',
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span
          className="caption flex items-center gap-2 text-[0.6rem]"
          style={{ color: 'var(--red)' }}
        >
          <span
            className="inline-block w-[6px] h-[6px] rounded-full"
            style={{ background: 'var(--red)', animation: 'standings-pulse 1.6s ease-in-out infinite' }}
          />
          LIVE
        </span>
        <span className="caption text-[0.6rem] text-bone/60 tabular-nums">
          {fixture.clock || fixture.detail}
        </span>
      </div>

      <TeamLine side={fixture.home} opponentScore={fixture.away.score} />
      <TeamLine side={fixture.away} opponentScore={fixture.home.score} />

      {fixture.scorers.length > 0 && (
        <ul className="mt-3 pt-3 border-t border-bone/10 space-y-1">
          {fixture.scorers.map((s, i) => (
            <li
              key={`${s.minute}-${s.name}-${i}`}
              className="caption text-[0.58rem] text-bone/50 flex gap-2"
            >
              <span className="tabular-nums text-bone/70 shrink-0">{s.minute}</span>
              <span className="truncate">
                {s.name}
                {s.ownGoal && ' (o.g.)'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function TeamLine({
  side,
  opponentScore,
}: {
  side: Fixture['home'];
  opponentScore: number;
}) {
  const leading = side.score > opponentScore;
  return (
    <div className="flex items-center gap-2.5 py-1">
      {side.logo && (
        // ESPN's crest CDN. Decorative — the club name is right beside it.
        <img src={side.logo} alt="" width={20} height={20} className="shrink-0 opacity-90" loading="lazy" />
      )}
      <span
        className={`flex-1 truncate text-[0.95rem] ${leading ? 'text-bone' : 'text-bone/70'}`}
      >
        {side.name}
      </span>
      <span
        className="display tabular-nums text-[1.3rem] leading-none"
        style={{ color: leading ? 'var(--gold)' : 'rgba(243,240,230,0.8)' }}
      >
        {side.score}
      </span>
    </div>
  );
}

function NextCard({ fixture }: { fixture: Fixture }) {
  const kickoff = new Date(fixture.date);
  const valid = !Number.isNaN(+kickoff);
  return (
    <div className="border border-bone/12 bg-ink/50 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <span className="caption text-[0.6rem] text-bone/45 shrink-0">Next up</span>
        <span className="text-bone/85 truncate">
          {fixture.home.name} <span className="text-bone/40">v</span> {fixture.away.name}
        </span>
      </div>
      {valid && (
        <span className="caption text-[0.62rem] text-bone/55 tabular-nums">
          {kickoff.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
          {' · '}
          {kickoff.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
}
