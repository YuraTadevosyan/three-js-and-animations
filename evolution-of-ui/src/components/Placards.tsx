import { component$ } from '@builder.io/qwik'
import { ERAS } from '@/timeline/eras'

/** A museum label for each era, faded in for exactly its dwell window. */
export const Placards = component$(() => {
  return (
    <>
      {ERAS.map((e) => (
        <aside
          key={e.id}
          class="placard tw"
          style={{ '--a': String(e.dwell[0]), '--b': String(e.dwell[1]) }}
          aria-label={`${e.year}: ${e.name}`}
        >
          <h2>
            <span>{e.year}</span>
            {e.name}
          </h2>
          <p>{e.blurb}</p>
          <p class="try">{e.tryIt}</p>
        </aside>
      ))}
    </>
  )
})
