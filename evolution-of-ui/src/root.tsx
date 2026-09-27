import { component$ } from '@builder.io/qwik'
import { QwikCityProvider, RouterOutlet } from '@builder.io/qwik-city'
import { RouterHead } from './components/RouterHead'
import { BOOT_SCRIPT } from './timeline/boot'

import './global.css'

export default component$(() => {
  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
        {/* After the stage in document order, so it can find #track and
            #stage and set data-live before the first paint. */}
        <script dangerouslySetInnerHTML={BOOT_SCRIPT} />
      </body>
    </QwikCityProvider>
  )
})
