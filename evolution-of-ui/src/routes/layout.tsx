import { Slot, component$, useVisibleTask$ } from '@builder.io/qwik'
import { useWorldProvider } from '@/state/world'
import { startClocks } from '@/lib/clock'
import { installKeys } from '@/timeline/keys'

export default component$(() => {
  const world = useWorldProvider()

  // Every clock in every era, from the Windows tray to the 2040 HUD, and
  // keyboard travel between the decades.
  useVisibleTask$(
    ({ cleanup }) => {
      const stopClocks = startClocks()
      const removeKeys = installKeys(world)
      cleanup(() => {
        stopClocks()
        removeKeys()
      })
    },
    { strategy: 'document-ready' },
  )

  return <Slot />
})
