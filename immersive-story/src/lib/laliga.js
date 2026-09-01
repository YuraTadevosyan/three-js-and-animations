// La Liga live data client.
//
// Source is ESPN's public site API. Two properties make it the only option
// that gives a *static* page genuinely live football:
//   • it needs no API key, so nothing secret ends up in the bundle, and
//   • it answers with `Access-Control-Allow-Origin: *`, so the browser can
//     call it directly — no proxy, no serverless function, no backend.
// (football-data.org was the obvious alternative and is out: it allows CORS
// only from http://localhost, so from GitHub Pages it is unreachable without
// a server to relay through.)
//
// The trade-off, stated plainly because the UI states it too: this is an
// undocumented endpoint. It can change shape without notice. Every consumer
// here fails soft — the build-time snapshot stays on screen and the status
// chip says the refresh failed.
//
// Imported by BOTH scripts/fetch-standings.mjs (Node, bakes the snapshot)
// and the browser (live refresh), so the two can never drift in shape.

const SITE = 'https://site.api.espn.com/apis';
const LEAGUE = 'esp.1';

export const SEASON = '2026-27';
export const SOURCE_URL = 'https://www.espn.com/soccer/standings/_/league/esp.1';

export const standingsUrl = () => `${SITE}/v2/sports/soccer/${LEAGUE}/standings`;
export const scoreboardUrl = (from, to) =>
  `${SITE}/site/v2/sports/soccer/${LEAGUE}/scoreboard?dates=${from}-${to}`;

const pad = (n) => String(n).padStart(2, '0');
const yyyymmdd = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

/**
 * The fixture window worth asking about: yesterday through four days out.
 * That covers a full La Liga round (they sprawl Friday to Monday) plus the
 * results that have just landed, without pulling the whole season.
 */
export function fixtureWindow(now = new Date()) {
  const from = new Date(now);
  from.setDate(from.getDate() - 1);
  const to = new Date(now);
  to.setDate(to.getDate() + 4);
  return [yyyymmdd(from), yyyymmdd(to)];
}

// ESPN spells the qualification tier out in prose; the table renders it as a
// short coloured pill.
function qualTag(description) {
  const d = (description || '').toLowerCase();
  if (d.includes('champions league')) return 'UCL';
  if (d.includes('europa league')) return 'UEL';
  if (d.includes('conference league')) return 'UECL';
  if (d.includes('relegation')) return 'REL';
  return '';
}

const statOf = (entry, name) => {
  const s = entry.stats?.find((x) => x.name === name);
  const v = s?.value;
  return Number.isFinite(v) ? v : 0;
};

/** ESPN standings payload → the flat row shape the whole app speaks. */
export function normaliseTable(payload) {
  const entries = payload?.children?.[0]?.standings?.entries;
  if (!Array.isArray(entries) || entries.length < 5) {
    throw new Error(`standings: ${entries?.length ?? 0} entries — unexpected shape`);
  }

  const rows = entries.map((e) => ({
    pos: statOf(e, 'rank'),
    teamId: String(e.team?.id ?? ''),
    team: e.team?.shortDisplayName || e.team?.displayName || '—',
    played: statOf(e, 'gamesPlayed'),
    won: statOf(e, 'wins'),
    drawn: statOf(e, 'ties'),
    lost: statOf(e, 'losses'),
    gf: statOf(e, 'pointsFor'),
    ga: statOf(e, 'pointsAgainst'),
    gd: statOf(e, 'pointDifferential'),
    pts: statOf(e, 'points'),
    champion: false,
    qualification: qualTag(e.note?.description),
  }));

  rows.sort((a, b) => a.pos - b.pos);
  // A season is only "won" once it is over; the champion flag drives the gold
  // treatment on the callout and must not fire in September.
  if (rows.every((r) => r.played >= 38) && rows[0]) rows[0].champion = true;
  return rows;
}

const side = (competitors, homeAway) => {
  const c = competitors?.find((x) => x.homeAway === homeAway) ?? {};
  const t = c.team ?? {};
  const score = parseInt(c.score, 10);
  return {
    teamId: String(t.id ?? ''),
    name: t.shortDisplayName || t.displayName || '—',
    abbr: t.abbreviation || '',
    logo: t.logo || '',
    score: Number.isFinite(score) ? score : 0,
  };
};

/** ESPN scoreboard payload → fixtures, with match state first-class. */
export function normaliseFixtures(payload) {
  const events = payload?.events;
  if (!Array.isArray(events)) throw new Error('scoreboard: no events array');

  return events.map((e) => {
    const c = e.competitions?.[0] ?? {};
    const st = e.status ?? {};
    return {
      id: String(e.id),
      date: e.date,
      // 'pre' | 'in' | 'post'
      state: st.type?.state ?? 'pre',
      // "67'", "45'+2'", "HT", "FT"
      clock: st.displayClock ?? '',
      detail: st.type?.shortDetail ?? '',
      home: side(c.competitors, 'home'),
      away: side(c.competitors, 'away'),
      scorers: (c.details ?? [])
        .filter((d) => d.scoringPlay)
        .map((d) => ({
          minute: d.clock?.displayValue ?? '',
          name: d.athletesInvolved?.[0]?.displayName ?? '',
          teamId: String(d.team?.id ?? ''),
          ownGoal: /own goal/i.test(d.type?.text ?? ''),
        })),
    };
  });
}

/**
 * Fold in-flight results into the confirmed table and re-sort.
 *
 * ESPN's standings only move at full time, so during a match the table on
 * screen is stale by exactly the thing the reader is watching. This applies
 * each supplied fixture as a provisional result and re-ranks, the way a
 * broadcast "live table" does.
 *
 * `fixtures` is what the CALLER decided to apply — that keeps the
 * double-counting question (a match finished but not yet absorbed by the
 * standings endpoint) in one place, the hook, instead of here.
 *
 * Ordering note: La Liga's real first tiebreaker is head-to-head, which needs
 * the full results grid. Points → goal difference → goals for is the standard
 * approximation and only differs between teams level on points.
 */
export function applyLiveResults(rows, fixtures) {
  if (!fixtures.length) {
    return rows.map((r) => ({ ...r, livePos: r.pos, delta: 0, live: false }));
  }

  const byTeam = new Map(rows.map((r) => [r.teamId, { ...r, live: false }]));

  for (const f of fixtures) {
    const h = byTeam.get(f.home.teamId);
    const a = byTeam.get(f.away.teamId);
    if (!h || !a) continue; // a cup tie or a team we don't have — skip it

    const hs = f.home.score;
    const as = f.away.score;
    for (const [team, own, opp] of [
      [h, hs, as],
      [a, as, hs],
    ]) {
      team.played += 1;
      team.gf += own;
      team.ga += opp;
      team.gd += own - opp;
      if (own > opp) {
        team.won += 1;
        team.pts += 3;
      } else if (own === opp) {
        team.drawn += 1;
        team.pts += 1;
      } else {
        team.lost += 1;
      }
      team.live = true;
    }
  }

  const provisional = [...byTeam.values()].sort(
    (x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.team.localeCompare(y.team),
  );

  return provisional.map((r, i) => ({
    ...r,
    livePos: i + 1,
    // Positive = climbed since the confirmed table.
    delta: r.pos - (i + 1),
  }));
}

export const isComplete = (rows) => rows.length > 0 && rows.every((r) => r.played >= 38);

async function getJson(fetchImpl, url) {
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

export async function fetchTable(fetchImpl = fetch) {
  return normaliseTable(await getJson(fetchImpl, standingsUrl()));
}

export async function fetchFixtures(fetchImpl = fetch, now = new Date()) {
  const [from, to] = fixtureWindow(now);
  return normaliseFixtures(await getJson(fetchImpl, scoreboardUrl(from, to)));
}
