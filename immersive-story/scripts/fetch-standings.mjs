#!/usr/bin/env node
// Build-time fetch of the current La Liga table from Wikipedia.
//
// The article we parse is "2025-26 La Liga". Wikipedia's `parse` API gives
// us the rendered HTML of a single section, and the standings live in the
// first `<table class="wikitable">` inside that section. A few regex passes
// turn the table rows into a flat JSON the React app imports at build time.
//
// Failure mode is by design: if the fetch fails (offline build / Wikipedia
// outage) and a previous `src/data/standings.json` exists, we leave that
// file alone and exit 0 with a warning — so the build never breaks
// downstream. If no fallback exists we exit 1.

import { mkdir, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '../src/data/standings.json');

const SOURCE_URL =
  'https://en.wikipedia.org/wiki/2025%E2%80%9326_La_Liga';
const API_URL =
  'https://en.wikipedia.org/w/api.php' +
  '?action=parse&format=json' +
  '&page=2025%E2%80%9326_La_Liga' +
  '&prop=text&section=6';

const UA = 'three-js-and-animations/1.0 (https://github.com/YuraTadevosyan/three-js-and-animations)';

// Decode the handful of HTML entities Wikipedia leaves in cell text — the
// minus sign is the one that bites us on negative goal difference.
const decode = (s) =>
  s
    .replace(/&#91;[^&]*&#93;/g, '') // strip footnote refs like [a]
    .replace(/&#8722;/g, '-')
    .replace(/&minus;/g, '-')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#160;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .trim();

const intOrZero = (s) => {
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : 0;
};

async function main() {
  let html;
  try {
    const res = await fetch(API_URL, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    html = json?.parse?.text?.['*'];
    if (!html) throw new Error('parse.text.* missing in response');
  } catch (err) {
    console.warn('[standings] fetch failed:', err.message);
    try {
      await access(OUT, constants.R_OK);
      console.warn('[standings] keeping existing', OUT);
      process.exit(0);
    } catch {
      console.error('[standings] no fallback at', OUT, '— aborting');
      process.exit(1);
    }
  }

  // Strip <style> blocks Wikipedia inlines into the table — they bloat the
  // payload and confuse the row regex.
  const cleaned = html.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');

  // First wikitable in the section is the league table.
  const tableMatch = cleaned.match(/<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/);
  if (!tableMatch) {
    console.error('[standings] no wikitable found');
    process.exit(1);
  }
  const tableHtml = tableMatch[1];

  const rowMatches = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)];
  const rows = [];
  for (const m of rowMatches) {
    const cellHtml = m[1];
    const cells = [...cellHtml.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map(
      (c) => decode(c[1]),
    );
    // Skip the header row and any malformed entries.
    if (!cells.length || !/^\d+$/.test(cells[0])) continue;
    const [pos, teamRaw, played, won, drawn, lost, gf, ga, gdRaw, pts, qualRaw] = cells;

    // Wikipedia tags the champion with "(C)" after the team name. Capture
    // it as a structured flag and strip it from the display name.
    const champion = / \([CL]\)$/.test(teamRaw) && / \(C\)$/.test(teamRaw);
    const team = teamRaw.replace(/ \([A-Z]\)$/, '').trim();
    // Goal-difference comes as `+59` or `-6` — keep it numeric.
    const gd = intOrZero(gdRaw.replace(/^\+/, ''));

    // Bucket the verbose qualification copy into a short tag the section
    // can render as a coloured pill.
    let qualTag = '';
    const q = (qualRaw || '').toLowerCase();
    if (q.includes('champions league')) qualTag = 'UCL';
    else if (q.includes('europa league')) qualTag = 'UEL';
    else if (q.includes('conference league')) qualTag = 'UECL';
    else if (q.includes('relegation')) qualTag = 'REL';

    rows.push({
      pos: intOrZero(pos),
      team,
      played: intOrZero(played),
      won: intOrZero(won),
      drawn: intOrZero(drawn),
      lost: intOrZero(lost),
      gf: intOrZero(gf),
      ga: intOrZero(ga),
      gd,
      pts: intOrZero(pts),
      champion,
      qualification: qualTag,
    });
  }

  if (rows.length < 5) {
    console.error('[standings] parsed', rows.length, 'rows — likely a structure change. Aborting.');
    process.exit(1);
  }

  const out = {
    season: '2025-26',
    source: SOURCE_URL,
    fetchedAt: new Date().toISOString().slice(0, 10),
    rows,
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log('[standings] wrote', rows.length, 'rows →', OUT);
}

main().catch((err) => {
  console.error('[standings] unhandled:', err);
  process.exit(1);
});
