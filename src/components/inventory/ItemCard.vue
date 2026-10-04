<script setup>
import { computed } from 'vue'
import BaseIcon from '../common/BaseIcon.vue'
import StockMeter from '../common/StockMeter.vue'
import { itemImage } from '../../utils/images'
import { getStockStatus, STOCK_LABELS } from '../../utils/stock'
import { formatCurrency } from '../../utils/format'

/**
 * PARENT -> CHILD: data comes in as props.
 * CHILD -> PARENT: the card never changes data itself, it only emits events
 * and lets the parent decide what to do (navigate, confirm, save).
 */
const props = defineProps({
  item: { type: Object, required: true },
  category: { type: Object, default: null },
  canAdjust: Boolean,
  canEdit: Boolean,
  canDelete: Boolean,
})

const emit = defineEmits({
  view: (id) => typeof id === 'string',
  edit: (id) => typeof id === 'string',
  delete: (item) => !!item?.id,
  adjust: (payload) => !!payload?.id && Number.isFinite(payload.delta),
})

const status = computed(() => getStockStatus(props.item))
const image = computed(() => itemImage(props.item, props.category))
</script>

<template>
  <article class="card" :class="`card--${status}`">
    <button type="button" class="card__media" :aria-label="`Open ${item.name}`" @click="emit('view', item.id)">
      <img :src="image" :alt="item.name" loading="lazy" />
    </button>

    <div class="card__body">
      <div class="card__top">
        <span class="sku-tag">{{ item.sku }}</span>
        <span class="badge" :class="`badge--${status}`">{{ STOCK_LABELS[status] }}</span>
      </div>

      <h3 class="card__name">
        <button type="button" class="card__link" @click="emit('view', item.id)">{{ item.name }}</button>
      </h3>

      <p class="chip" :style="{ '--chip': category?.color }">
        <span class="chip__dot" />{{ category?.name ?? 'Uncategorised' }}
        <span v-if="item.location" class="muted">· Bin {{ item.location }}</span>
      </p>

      <StockMeter :quantity="item.quantity" :min-stock="item.minStock" />

      <div class="card__stock">
        <div class="qty">
          <button v-if="canAdjust" type="button" class="icon-btn qty__btn" :disabled="item.quantity === 0" :aria-label="`Remove one ${item.name}`" @click="emit('adjust', { id: item.id, delta: -1 })">
            <BaseIcon name="minus" :size="16" />
          </button>
          <p class="qty__value"><strong>{{ item.quantity }}</strong> <span class="muted">units · min {{ item.minStock }}</span></p>
          <button v-if="canAdjust" type="button" class="icon-btn qty__btn" :aria-label="`Add one ${item.name}`" @click="emit('adjust', { id: item.id, delta: 1 })">
            <BaseIcon name="plus" :size="16" />
          </button>
        </div>
      </div>
    </div>

    <footer class="card__foot">
      <span class="card__price">{{ formatCurrency(item.price) }}</span>
      <div class="card__actions">
        <button type="button" class="icon-btn" :aria-label="`View ${item.name}`" @click="emit('view', item.id)"><BaseIcon name="eye" :size="18" /></button>
        <button v-if="canEdit" type="button" class="icon-btn" :aria-label="`Edit ${item.name}`" @click="emit('edit', item.id)"><BaseIcon name="edit" :size="18" /></button>
        <button v-if="canDelete" type="button" class="icon-btn icon-btn--danger" :aria-label="`Delete ${item.name}`" @click="emit('delete', item)"><BaseIcon name="trash" :size="18" /></button>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-lg); overflow: hidden; display: flex; flex-direction: column; min-width: 0; transition: border-color 0.15s; }
.card:hover { border-color: var(--line-strong); }
.card--low { border-top: 0.25rem solid var(--amber); }
.card--out { border-top: 0.25rem solid var(--alert); }
.card__media { display: block; padding: 0; border: 0; background: var(--surface-2); cursor: pointer; aspect-ratio: 4 / 3; width: 100%; }
.card__media img { width: 100%; height: 100%; object-fit: cover; }
.card__body { display: flex; flex-direction: column; gap: 0.7rem; padding: 1rem 1rem 0.75rem; flex: 1; }
.card__top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; }
.card__name { font-size: 1.1rem; }
.card__link { background: none; border: 0; padding: 0; text-align: left; font: inherit; color: inherit; cursor: pointer; }
.card__link:hover { color: var(--dock-dark); text-decoration: underline; text-underline-offset: 0.2em; }
.qty { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.qty__value { flex: 1; text-align: center; font-size: 0.9rem; }
.qty__value strong { font-family: var(--font-display); font-size: 1.5rem; margin-right: 0.15rem; }
.qty__btn { border: 1px solid var(--line-strong); }
.card__foot { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.6rem 0.75rem 0.6rem 1rem; border-top: 1px solid var(--line); background: var(--surface-2); }
.card__price { font-weight: 650; font-variant-numeric: tabular-nums; }
.card__actions { display: flex; gap: 0.1rem; }
</style>
