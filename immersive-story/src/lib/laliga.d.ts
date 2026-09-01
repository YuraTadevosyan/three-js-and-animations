// Types for the ESPN client in laliga.js. The implementation is plain ESM so
// the zero-dep Node build script can import the very same file.

export type StandingsRow = {
  pos: number;
  teamId: string;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  champion: boolean;
  qualification: string;
};

/** A row after in-flight results have been folded in. */
export type LiveRow = StandingsRow & {
  /** Provisional position with live scores applied. */
  livePos: number;
  /** Places gained since the confirmed table (negative = dropped). */
  delta: number;
  /** This team is in one of the applied matches. */
  live: boolean;
};

export type FixtureSide = {
  teamId: string;
  name: string;
  abbr: string;
  logo: string;
  score: number;
};

export type Scorer = {
  minute: string;
  name: string;
  teamId: string;
  ownGoal: boolean;
};

export type Fixture = {
  id: string;
  date: string;
  state: 'pre' | 'in' | 'post';
  clock: string;
  detail: string;
  home: FixtureSide;
  away: FixtureSide;
  scorers: Scorer[];
};

export const SEASON: string;
export const SOURCE_URL: string;

export function standingsUrl(): string;
export function scoreboardUrl(from: string, to: string): string;
export function fixtureWindow(now?: Date): [string, string];
export function normaliseTable(payload: unknown): StandingsRow[];
export function normaliseFixtures(payload: unknown): Fixture[];
export function applyLiveResults(rows: StandingsRow[], fixtures: Fixture[]): LiveRow[];
export function isComplete(rows: StandingsRow[]): boolean;
export function fetchTable(fetchImpl?: typeof fetch): Promise<StandingsRow[]>;
export function fetchFixtures(fetchImpl?: typeof fetch, now?: Date): Promise<Fixture[]>;
