<script setup>
import StockMeter from '../common/StockMeter.vue'
import { itemImage } from '../../utils/images'
import { getStockStatus, STOCK_LABELS, restockAmount } from '../../utils/stock'

// Events up: `open` (go to an item) and `restock` (add stock). The dashboard decides what they do.
defineProps({
  items: { type: Array, required: true },
  categoryMap: { type: Object, required: true },
  canRestock: Boolean,
})
const emit = defineEmits(['open', 'restock'])
</script>

<template>
  <section class="panel" aria-labelledby="attention-title">
    <div class="panel__head">
      <h2 id="attention-title">Needs restocking</h2>
      <span class="muted">{{ items.length }} item{{ items.length === 1 ? '' : 's' }}</span>
    </div>

    <p v-if="!items.length" class="panel__body muted">Every item is above its restock level.</p>

    <ul v-else class="list">
      <li v-for="item in items" :key="item.id" class="row">
        <img :src="itemImage(item, categoryMap[item.categoryId])" :alt="item.name" class="row__img" loading="lazy" />
        <div class="row__main">
          <button type="button" class="row__name" @click="emit('open', item.id)">{{ item.name }}</button>
          <p class="row__meta">
            <span class="badge" :class="`badge--${getStockStatus(item)}`">{{ STOCK_LABELS[getStockStatus(item)] }}</span>
            <span class="muted">{{ item.quantity }} of {{ item.minStock }} minimum</span>
          </p>
          <StockMeter :quantity="item.quantity" :min-stock="item.minStock" compact />
        </div>
        <button v-if="canRestock" type="button" class="btn btn--sm" @click="emit('restock', item)">Add {{ restockAmount(item) }}</button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.list { list-style: none; margin: 0; padding: 0; }
.row { display: flex; align-items: center; gap: 1rem; padding: 0.85rem 1.25rem; border-bottom: 1px solid var(--line); }
.row:last-child { border-bottom: 0; }
.row__img { width: 3.5rem; height: 2.75rem; object-fit: cover; border-radius: var(--r-sm); flex: none; }
.row__main { flex: 1; min-width: 0; display: grid; gap: 0.35rem; }
.row__name { background: none; border: 0; padding: 0; text-align: left; font-weight: 600; cursor: pointer; justify-self: start; }
.row__name:hover { color: var(--dock-dark); text-decoration: underline; text-underline-offset: 0.2em; }
.row__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
@media (max-width: 30em) { .row { flex-wrap: wrap; } .row__img { display: none; } .row .btn { margin-left: auto; } }
</style>
