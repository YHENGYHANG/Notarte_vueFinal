<script setup>
import { computed } from 'vue'
import { getStockStatus } from '../../utils/stock'

// Shows stock as pallet slots: each filled slot is a slice of the target level.
// The target is three times the minimum stock, or the current count if that is higher.
const props = defineProps({
  quantity: { type: Number, required: true },
  minStock: { type: Number, default: 0 },
  segments: { type: Number, default: 10 },
  compact: Boolean,
})

const status = computed(() => getStockStatus({ quantity: props.quantity, minStock: props.minStock }))
const filled = computed(() => {
  if (props.quantity <= 0) return 0
  const target = Math.max(props.minStock * 3, props.quantity, 1)
  return Math.max(1, Math.round((props.quantity / target) * props.segments))
})
const label = computed(() => `${props.quantity} units on hand, minimum ${props.minStock}`)
</script>

<template>
  <div class="meter" :class="[`meter--${status}`, { 'meter--compact': compact }]" role="img" :aria-label="label">
    <span v-for="n in segments" :key="n" class="meter__slot" :class="{ 'is-filled': n <= filled }" />
  </div>
</template>

<style scoped>
.meter { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 0.2rem; height: 0.7rem; width: 100%; }
.meter--compact { height: 0.5rem; }
.meter__slot { border-radius: 0.15rem; background: var(--line); }
.meter--ok .is-filled { background: var(--dock); }
.meter--low .is-filled { background: var(--amber); }
.meter--out .meter__slot { background: var(--alert-tint); box-shadow: inset 0 0 0 1px #efc2bd; }
</style>
