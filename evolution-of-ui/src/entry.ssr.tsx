/**
 * SSR entry. For this site it only ever runs at build time: the static
 * adapter renders the single route to dist/index.html.
 */
import { renderToStream, type RenderToStreamOptions } from '@builder.io/qwik/server'
import Root from './root'

export default function (opts: RenderToStreamOptions) {
  return renderToStream(<Root />, {
    ...opts,
    containerAttributes: {
      lang: 'en',
      ...opts.containerAttributes,
    },
    serverData: {
      ...opts.serverData,
    },
  })
}
