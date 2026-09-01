#!/usr/bin/env node
// Build-time snapshot of the La Liga table and the fixtures around it.
//
// The client lives in src/lib/laliga.js, which the browser imports too — this
// script only handles the Node-side concerns: writing the file and never
// breaking the build.
//
// The snapshot is not the live data. It exists so the section paints a real
// table on the first frame instead of a spinner, and so the page still shows
// something true if ESPN is unreachable from the reader's browser. The live
// refresh takes over a moment after the section scrolls into view.
//
// Failure mode is by design: if the fetch fails (offline build / upstream
// outage) and a previous src/data/standings.json exists, we leave that file
// alone and exit 0 with a warning. Only a first-ever build with no fallback
// exits non-zero.

import { mkdir, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SEASON,
  SOURCE_URL,
  fetchTable,
  fetchFixtures,
  isComplete,
} from '../src/lib/laliga.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '../src/data/standings.json');

const UA =
  'three-js-and-animations/1.0 (https://github.com/YuraTadevosyan/three-js-and-animations)';

// Same signature as global fetch, just with a courtesy User-Agent.
const politeFetch = (url, init) =>
  fetch(url, { ...init, headers: { ...init?.headers, 'User-Agent': UA } });

async function keepExistingOrDie(reason) {
  console.warn('[standings] fetch failed:', reason);
  try {
    await access(OUT, constants.R_OK);
    console.warn('[standings] keeping existing', OUT);
    process.exit(0);
  } catch {
    console.error('[standings] no fallback at', OUT, '— aborting');
    process.exit(1);
  }
}

async function main() {
  let rows;
  let fixtures;
  try {
    [rows, fixtures] = await Promise.all([
      fetchTable(politeFetch),
      fetchFixtures(politeFetch),
    ]);
  } catch (err) {
    await keepExistingOrDie(err.message);
    return;
  }

  const out = {
    season: SEASON,
    source: SOURCE_URL,
    fetchedAt: new Date().toISOString().slice(0, 10),
    matchday: rows.reduce((n, r) => Math.max(n, r.played), 0),
    complete: isComplete(rows),
    rows,
    // Seeded so the fixture strip has something to draw before the first
    // live response lands. Anything in progress at build time is irrelevant
    // by the time a reader sees it, so only the schedule is worth keeping.
    fixtures: fixtures.filter((f) => f.state !== 'in'),
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(
    `[standings] wrote ${rows.length} rows (matchday ${out.matchday}) + ${out.fixtures.length} fixtures → ${OUT}`,
  );
}

main().catch((err) => {
  console.error('[standings] unhandled:', err);
  process.exit(1);
});
