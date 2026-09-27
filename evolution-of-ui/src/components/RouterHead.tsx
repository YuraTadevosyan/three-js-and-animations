import { component$ } from '@builder.io/qwik'
import { useDocumentHead, useLocation } from '@builder.io/qwik-city'

const FONTS =
  'https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=JetBrains+Mono:wght@400;500&family=VT323&family=Roboto:wght@400;500;700&family=Nunito:wght@800&family=Chakra+Petch:wght@300;400;500;600&display=swap'

export const RouterHead = component$(() => {
  const head = useDocumentHead()
  const loc = useLocation()
  const base = import.meta.env.BASE_URL

  return (
    <>
      <title>{head.title}</title>
      <link rel="canonical" href={loc.url.href} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      <meta name="theme-color" content="#07070b" />
      <link rel="icon" type="image/svg+xml" href={`${base}favicon.svg`} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONTS} />
      {/* Without the boot script nothing would set data-live, and every era
          would stay hidden. Show them all and let --t sort out opacity. */}
      <noscript>
        <style dangerouslySetInnerHTML=".layer{visibility:visible!important}" />
      </noscript>

      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}
      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}
    </>
  )
})
