<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useChessWorld } from '~/composables/useChessWorld'

const props = withDefaults(defineProps<{ seekable?: boolean }>(), { seekable: false })
const state = useChessWorld()
const scroller = ref<HTMLElement | null>(null)

/** Grouped into numbered pairs, the way a scoresheet reads. */
const rows = computed(() => {
  const out: { number: number; white?: string; black?: string; whitePly?: number; blackPly?: number }[] = []
  for (const entry of state.history.value) {
    const last = out[out.length - 1]
    if (entry.color === 0 || !last || last.black !== undefined) {
      out.push(
        entry.color === 0
          ? { number: entry.moveNumber, white: entry.san, whitePly: entry.ply + 1 }
          : { number: entry.moveNumber, black: entry.san, blackPly: entry.ply + 1 },
      )
    } else {
      last.black = entry.san
      last.blackPly = entry.ply + 1
    }
  }
  return out
})

const activePly = computed(() => (state.mode.value === 'cinema' ? state.cinemaPly.value : state.history.value.length))

watch(
  () => state.history.value.length,
  async () => {
    await nextTick()
    const element = scroller.value
    if (element) element.scrollTop = element.scrollHeight
  },
)

function seek(ply: number | undefined): void {
  if (!props.seekable || ply === undefined) return
  state.cinemaSeek(ply)
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-2">
    <div class="flex items-center justify-between">
      <span class="label">Moves</span>
      <span class="font-mono text-[11px] text-muted-foreground">{{ state.history.value.length }} ply</span>
    </div>
    <div ref="scroller" class="scroll-fade min-h-0 flex-1 overflow-y-auto pr-1">
      <table class="w-full border-collapse font-mono text-xs">
        <tbody>
          <tr v-for="row in rows" :key="row.number" class="align-top">
            <td class="w-8 select-none py-0.5 pr-1 text-right text-muted-foreground">{{ row.number }}.</td>
            <td class="py-0.5">
              <button
                v-if="row.white"
                class="w-full rounded px-1.5 py-0.5 text-left transition-colors"
                :class="[
                  activePly === row.whitePly ? 'bg-light/15 text-light' : 'text-foreground/85',
                  seekable ? 'hover:bg-muted/60' : 'cursor-default',
                ]"
                @click="seek(row.whitePly)"
              >{{ row.white }}</button>
            </td>
            <td class="py-0.5">
              <button
                v-if="row.black"
                class="w-full rounded px-1.5 py-0.5 text-left transition-colors"
                :class="[
                  activePly === row.blackPly ? 'bg-dark/15 text-dark' : 'text-foreground/85',
                  seekable ? 'hover:bg-muted/60' : 'cursor-default',
                ]"
                @click="seek(row.blackPly)"
              >{{ row.black }}</button>
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="3" class="py-6 text-center text-[11px] text-muted-foreground">
              No moves yet
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
