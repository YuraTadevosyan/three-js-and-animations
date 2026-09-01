import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import baked from '@/data/standings.json';
import {
  fetchTable,
  fetchFixtures,
  applyLiveResults,
  isComplete,
  type Fixture,
  type LiveRow,
  type StandingsRow,
} from '@/lib/laliga';

// Live La Liga table, straight from the browser.
//
// The build-time snapshot in standings.json is the seed, so the section paints
// a real table on the first frame and never shows a spinner-shaped hole. The
// network result only ever replaces it — a failed refresh leaves the baked
// table on screen and says so in the status chip.
//
// Two things make this "live" rather than merely "fresh":
//
//  1. Fixtures are read alongside the table, so a match in progress shows its
//     running score and minute.
//  2. ESPN's standings only move at full time. Left alone, the table would be
//     stale by exactly the match the reader is watching — so in-flight results
//     are folded in and the table re-ranked, the way a broadcast live table
//     does. Rows carry the places gained or lost against the confirmed table.
//
// The awkward case is the minute or two between the final whistle and the
// standings endpoint absorbing the result: apply the fixture and you might
// double-count it, ignore it and the table briefly goes backwards. So the
// first time a match is seen in progress we record each side's games-played
// from the standings of that moment, and keep applying the result until that
// number actually ticks up. A page loaded after full time has no such record
// and simply trusts the standings.

const LIVE_MS = 25_000; // something is being played right now
const SOON_MS = 60_000; // kick-off within the next 20 minutes
const IDLE_MS = 300_000; // nothing happening
const MIN_AUTO_GAP_MS = 10_000; // floor between automatic refreshes

const SOON_WINDOW_MS = 20 * 60 * 1000;

export type LiveStatus = 'snapshot' | 'loading' | 'live' | 'error';

const BAKED_ROWS = baked.rows as StandingsRow[];
const BAKED_FIXTURES = (baked.fixtures ?? []) as Fixture[];

type Baseline = { homeId: string; homeGP: number };

export type LiveStandings = {
  /** Confirmed table with in-flight results folded in, re-ranked. */
  rows: LiveRow[];
  fixtures: Fixture[];
  liveFixtures: Fixture[];
  nextFixture: Fixture | null;
  status: LiveStatus;
  /** True while at least one match is in progress. */
  isLive: boolean;
  matchday: number;
  complete: boolean;
  updatedAt: Date | null;
  fetchedAt: string;
  refresh: () => void;
};

export function useLiveStandings(enabled: boolean): LiveStandings {
  const [table, setTable] = useState<StandingsRow[]>(BAKED_ROWS);
  const [fixtures, setFixtures] = useState<Fixture[]>(BAKED_FIXTURES);
  const [status, setStatus] = useState<LiveStatus>('snapshot');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  // Games-played per side at the moment a match was first seen in progress.
  // Keyed by fixture id; cleared once the standings catch up.
  const baselines = useRef(new Map<string, Baseline>());
  const inFlight = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setStatus((s) => (s === 'live' ? 'live' : 'loading'));
    try {
      const signalFetch: typeof fetch = (url, init) =>
        fetch(url, { ...init, signal: ctrl.signal });
      // One round-trip each, in parallel — the table alone can't tell us
      // whether anything is being played.
      const [nextTable, nextFixtures] = await Promise.all([
        fetchTable(signalFetch),
        fetchFixtures(signalFetch),
      ]);
      if (ctrl.signal.aborted) return;

      const gp = new Map(nextTable.map((r) => [r.teamId, r.played]));
      for (const f of nextFixtures) {
        if (f.state === 'in' && !baselines.current.has(f.id)) {
          // The standings write both sides of a fixture together, so the home
          // side's count is enough to tell whether the result has landed.
          baselines.current.set(f.id, {
            homeId: f.home.teamId,
            homeGP: gp.get(f.home.teamId) ?? 0,
          });
        }
      }
      // Drop baselines the standings have now absorbed.
      for (const [id, b] of baselines.current) {
        if ((gp.get(b.homeId) ?? 0) > b.homeGP) baselines.current.delete(id);
      }

      setTable(nextTable);
      setFixtures(nextFixtures);
      setUpdatedAt(new Date());
      setStatus('live');
    } catch (err) {
      if (ctrl.signal.aborted) return;
      // Keep whatever is on screen — the baked table is still a real table.
      console.warn('[standings] live refresh failed:', err);
      setStatus('error');
    } finally {
      inFlight.current = false;
    }
  }, []);

  // Scrolling the section in and out, or flicking between tabs, shouldn't turn
  // into a burst of requests. The manual Refresh button deliberately bypasses
  // this — a reader pressing it means it.
  const lastAuto = useRef(0);
  const autoLoad = useCallback(async () => {
    if (Date.now() - lastAuto.current < MIN_AUTO_GAP_MS) return;
    lastAuto.current = Date.now();
    await load();
  }, [load]);

  const liveFixtures = useMemo(
    () => fixtures.filter((f) => f.state === 'in'),
    [fixtures],
  );

  // Everything the provisional table should account for: matches in progress,
  // plus ones that have just finished but the standings haven't counted yet.
  const applied = useMemo(() => {
    const pending = fixtures.filter(
      (f) => f.state === 'post' && baselines.current.has(f.id),
    );
    return [...liveFixtures, ...pending];
  }, [fixtures, liveFixtures]);

  const rows = useMemo(() => applyLiveResults(table, applied), [table, applied]);

  const nextFixture = useMemo(() => {
    const upcoming = fixtures
      .filter((f) => f.state === 'pre')
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));
    return upcoming[0] ?? null;
  }, [fixtures]);

  // What the next delay should be, kept in a ref rather than in the polling
  // effect's dependencies. Every successful poll produces freshly-constructed
  // fixture objects, so depending on them directly would tear the effect down
  // and restart it — and since the loop fetches on entry, that is an
  // unthrottled request loop rather than a 25-second poll.
  const cadence = useRef({ liveCount: 0, nextKickoff: 0 });
  useEffect(() => {
    cadence.current = {
      liveCount: liveFixtures.length,
      nextKickoff: nextFixture ? +new Date(nextFixture.date) : 0,
    };
  }, [liveFixtures.length, nextFixture]);

  // Poll only while the section is worth updating, and at a cadence that
  // matches what's actually happening — 25 s during a match, five minutes when
  // the league is asleep. A chained timeout rather than setInterval so the
  // delay can change between ticks.
  useEffect(() => {
    if (!enabled) return;
    let timer = 0;
    let cancelled = false;

    const delay = () => {
      const { liveCount, nextKickoff } = cadence.current;
      if (liveCount) return LIVE_MS;
      const untilKickoff = nextKickoff - Date.now();
      if (untilKickoff > 0 && untilKickoff < SOON_WINDOW_MS) return SOON_MS;
      return IDLE_MS;
    };

    const tick = async () => {
      if (cancelled) return;
      if (document.visibilityState === 'visible') await autoLoad();
      if (cancelled) return;
      timer = window.setTimeout(tick, delay());
    };

    void tick();
    // A tab left open should catch up the moment it comes back, not a poll later.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void autoLoad();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled, autoLoad]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return {
    rows,
    fixtures,
    liveFixtures,
    nextFixture,
    status,
    isLive: liveFixtures.length > 0,
    matchday: rows.reduce((n, r) => Math.max(n, r.played), 0),
    complete: isComplete(table),
    updatedAt,
    fetchedAt: baked.fetchedAt,
    refresh: load,
  };
}
