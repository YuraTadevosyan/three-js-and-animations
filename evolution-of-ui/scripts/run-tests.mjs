// Bundles scripts/tests.ts for Node (resolving the @/ alias) and runs it.
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = fileURLToPath(new URL('..', import.meta.url))
const out = `${root}tmp/tests.mjs`
await build({
  entryPoints: [`${root}scripts/tests.ts`],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: out,
  logLevel: 'error',
  alias: { '@': `${root}src` },
  // Only createContextId is imported from Qwik, by modules the tests don't call.
  external: ['@builder.io/qwik'],
})
const r = spawnSync(process.execPath, [out], { stdio: 'inherit' })
process.exit(r.status ?? 1)
