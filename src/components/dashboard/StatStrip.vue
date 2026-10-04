<script setup>
import { computed } from 'vue'
import { formatNumber, formatCompactCurrency } from '../../utils/format'

const props = defineProps({
  stats: { type: Object, required: true },
})

const needsRestock = computed(() => props.stats.lowCount + props.stats.outCount)
</script>

<template>
  <dl class="strip panel">
    <div class="strip__cell">
      <dt>Products</dt>
      <dd>{{ formatNumber(stats.skuCount) }}</dd>
    </div>
    <div class="strip__cell">
      <dt>Units on hand</dt>
      <dd>{{ formatNumber(stats.unitCount) }}</dd>
    </div>
    <div class="strip__cell">
      <dt>Stock value</dt>
      <dd>{{ formatCompactCurrency(stats.stockValue) }}</dd>
    </div>
    <div class="strip__cell" :class="{ 'is-warn': needsRestock > 0 }">
      <dt>Need restocking</dt>
      <dd>
        {{ needsRestock }}
        <small v-if="stats.outCount">{{ stats.outCount }} sold out</small>
      </dd>
    </div>
  </dl>
</template>

<style scoped>
.strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); margin: 0; overflow: hidden; }
.strip__cell { padding: 1.1rem 1.25rem; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); margin-bottom: -1px; margin-right: -1px; }
.strip__cell dt { color: var(--ink-soft); font-size: 0.9rem; }
.strip__cell dd { margin: 0.2rem 0 0; font-family: var(--font-display); font-size: clamp(1.5rem, 1.2rem + 1vw, 2rem); font-weight: 700; font-variant-numeric: tabular-nums; }
.strip__cell dd small { font-family: var(--font-body); font-size: 0.85rem; font-weight: 500; color: var(--alert); margin-left: 0.4rem; }
.is-warn { background: var(--amber-tint); }
.is-warn dd { color: var(--amber-ink); }
</style>
