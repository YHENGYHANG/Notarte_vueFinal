<script setup>
import BaseIcon from '../common/BaseIcon.vue'
import StockMeter from '../common/StockMeter.vue'
import { itemImage } from '../../utils/images'
import { getStockStatus, STOCK_LABELS } from '../../utils/stock'
import { formatCurrency } from '../../utils/format'

// Same props and events as ItemCard, so the parent can swap one for the other.
defineProps({
  items: { type: Array, required: true },
  categoryMap: { type: Object, required: true },
  canAdjust: Boolean,
  canEdit: Boolean,
  canDelete: Boolean,
})
const emit = defineEmits(['view', 'edit', 'delete', 'adjust'])
</script>

<template>
  <div class="panel table-wrap">
    <table class="table table--stack">
      <thead>
        <tr>
          <th scope="col">Item</th>
          <th scope="col">Category</th>
          <th scope="col">Stock</th>
          <th scope="col" class="num">Price</th>
          <th scope="col">Bin</th>
          <th scope="col"><span class="visually-hidden">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td class="cell-main">
            <div class="who">
              <img :src="itemImage(item, categoryMap[item.categoryId])" :alt="item.name" class="thumb" loading="lazy" />
              <div>
                <button type="button" class="link" @click="emit('view', item.id)">{{ item.name }}</button>
                <div><span class="sku-tag">{{ item.sku }}</span></div>
              </div>
            </div>
          </td>
          <td data-label="Category">
            <span class="chip" :style="{ '--chip': categoryMap[item.categoryId]?.color }">
              <span class="chip__dot" />{{ categoryMap[item.categoryId]?.name ?? 'Uncategorised' }}
            </span>
          </td>
          <td data-label="Stock">
            <div class="stock">
              <div class="stock__row">
                <button v-if="canAdjust" type="button" class="icon-btn" :disabled="item.quantity === 0" :aria-label="`Remove one ${item.name}`" @click="emit('adjust', { id: item.id, delta: -1 })"><BaseIcon name="minus" :size="15" /></button>
                <strong class="stock__qty">{{ item.quantity }}</strong>
                <button v-if="canAdjust" type="button" class="icon-btn" :aria-label="`Add one ${item.name}`" @click="emit('adjust', { id: item.id, delta: 1 })"><BaseIcon name="plus" :size="15" /></button>
                <span class="badge" :class="`badge--${getStockStatus(item)}`">{{ STOCK_LABELS[getStockStatus(item)] }}</span>
              </div>
              <StockMeter :quantity="item.quantity" :min-stock="item.minStock" compact />
            </div>
          </td>
          <td data-label="Price" class="num">{{ formatCurrency(item.price) }}</td>
          <td data-label="Bin">{{ item.location || '-' }}</td>
          <td class="actions">
            <button type="button" class="icon-btn" :aria-label="`View ${item.name}`" @click="emit('view', item.id)"><BaseIcon name="eye" :size="18" /></button>
            <button v-if="canEdit" type="button" class="icon-btn" :aria-label="`Edit ${item.name}`" @click="emit('edit', item.id)"><BaseIcon name="edit" :size="18" /></button>
            <button v-if="canDelete" type="button" class="icon-btn icon-btn--danger" :aria-label="`Delete ${item.name}`" @click="emit('delete', item)"><BaseIcon name="trash" :size="18" /></button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.who { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
.thumb { width: 3rem; height: 2.4rem; object-fit: cover; border-radius: var(--r-sm); background: var(--surface-2); flex: none; }
.link { background: none; border: 0; padding: 0; font: inherit; font-weight: 600; color: var(--ink); cursor: pointer; text-align: left; }
.link:hover { color: var(--dock-dark); text-decoration: underline; text-underline-offset: 0.2em; }
.stock { min-width: 13rem; display: grid; gap: 0.4rem; }
.stock__row { display: flex; align-items: center; gap: 0.25rem; flex-wrap: wrap; }
.stock__qty { min-width: 2rem; text-align: center; font-variant-numeric: tabular-nums; }
@media (max-width: 42em) { .stock { min-width: 0; width: 60%; } .stock__row { justify-content: flex-end; } }
</style>
