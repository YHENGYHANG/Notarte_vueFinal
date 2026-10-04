<script setup>
import { computed } from 'vue'
import { formatNumber } from '../../utils/format'

const props = defineProps({
  rows: { type: Array, required: true }, // [{ id, name, color, units, skuCount }]
})
const max = computed(() => Math.max(...props.rows.map((r) => r.units), 1))
</script>

<template>
  <section class="panel" aria-labelledby="cat-title">
    <div class="panel__head"><h2 id="cat-title">Units by category</h2></div>
    <ul class="bars">
      <li v-for="row in rows" :key="row.id">
        <div class="bars__label">
          <span class="chip" :style="{ '--chip': row.color }"><span class="chip__dot" />{{ row.name }}</span>
          <span class="muted">{{ formatNumber(row.units) }} · {{ row.skuCount }} product{{ row.skuCount === 1 ? '' : 's' }}</span>
        </div>
        <div class="bars__track"><div class="bars__fill" :style="{ width: (row.units / max) * 100 + '%', background: row.color }" /></div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.bars { list-style: none; margin: 0; padding: 1rem 1.25rem; display: grid; gap: 0.9rem; }
.bars__label { display: flex; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; font-size: 0.9rem; margin-bottom: 0.3rem; }
.bars__track { height: 0.5rem; background: var(--surface-2); border-radius: 999px; overflow: hidden; }
.bars__fill { height: 100%; border-radius: 999px; min-width: 0.3rem; }
</style>
