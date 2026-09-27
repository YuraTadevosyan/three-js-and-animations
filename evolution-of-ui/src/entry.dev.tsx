/**
 * Client-only development entry (`vite --mode ssr` does not use it; it exists
 * for Qwik's tooling). No SSR, no resumability — don't judge perf from it.
 */
import { render, type RenderOptions } from '@builder.io/qwik'
import Root from './root'

export default function (opts: RenderOptions) {
  return render(document, <Root />, opts)
}
