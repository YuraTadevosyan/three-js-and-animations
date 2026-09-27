import { Slot, component$, useVisibleTask$ } from '@builder.io/qwik'
import { useWorldProvider } from '@/state/world'
import { startClocks } from '@/lib/clock'

export default component$(() => {
  useWorldProvider()

  // Every clock in every era, from the Windows tray to the 2040 HUD.
  useVisibleTask$(
    ({ cleanup }) => {
      cleanup(startClocks())
    },
    { strategy: 'document-ready' },
  )

  return <Slot />
})
