<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseIcon from '../components/common/BaseIcon.vue'
import StockMeter from '../components/common/StockMeter.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import { useInventory } from '../composables/useInventory'
import { useAuth } from '../composables/useAuth'
import { useConfirm } from '../composables/useConfirm'
import { useToast } from '../composables/useToast'
import { itemImage } from '../utils/images'
import { formatCurrency, formatDate } from '../utils/format'
import { getStockStatus, STOCK_LABELS } from '../utils/stock'

// `id` arrives as a prop because the route is declared with `props: true`.
const props = defineProps({ id: { type: String, required: true } })

const router = useRouter()
const { can } = useAuth()
const toast = useToast()
const confirm = useConfirm()
const { getItem, categoryMap, adjustStock, deleteItem } = useInventory()

const item = computed(() => getItem(props.id))
const category = computed(() => categoryMap.value[item.value?.categoryId])
const status = computed(() => (item.value ? getStockStatus(item.value) : 'ok'))

function adjust(delta) {
  const result = adjustStock(props.id, delta)
  if (!result.ok) toast.error(result.error)
}

async function remove() {
  const confirmed = await confirm.ask({
    title: `Delete ${item.value.name}?`,
    message: 'This removes the item and its stock count. It cannot be undone.',
    confirmLabel: 'Delete item',
    danger: true,
  })
  if (!confirmed) return
  const name = item.value.name
  const result = deleteItem(props.id)
  if (result.ok) {
    toast.success(`Deleted ${name}`)
    router.replace({ name: 'inventory' })
  } else {
    toast.error(result.error)
  }
}
</script>

<template>
  <RouterLink :to="{ name: 'inventory' }" class="back-link"><BaseIcon name="arrow-left" :size="16" /> Back to inventory</RouterLink>

  <div v-if="!item" class="panel empty">
    <h2>This item no longer exists</h2>
    <p>It may have been deleted. Go back to the inventory to pick another one.</p>
    <RouterLink :to="{ name: 'inventory' }" class="btn">Back to inventory</RouterLink>
  </div>

  <template v-else>
    <header class="page-header">
      <div>
        <h1>{{ item.name }}</h1>
        <p><span class="sku-tag">{{ item.sku }}</span></p>
      </div>
      <div class="page-header__actions">
        <RouterLink v-if="can('items:update')" :to="{ name: 'item-edit', params: { id } }" class="btn"><BaseIcon name="edit" :size="18" /> Edit</RouterLink>
        <button v-if="can('items:delete')" type="button" class="btn btn--danger" @click="remove"><BaseIcon name="trash" :size="18" /> Delete</button>
      </div>
    </header>

    <div class="detail">
      <img :src="itemImage(item, category)" :alt="item.name" class="detail__img" />

      <div class="stack">
        <section class="panel panel__body stock" aria-labelledby="stock-title">
          <div class="stock__top">
            <h2 id="stock-title">Stock</h2>
            <span class="badge" :class="`badge--${status}`">{{ STOCK_LABELS[status] }}</span>
          </div>
          <p class="stock__count"><strong>{{ item.quantity }}</strong> units on hand</p>
          <StockMeter :quantity="item.quantity" :min-stock="item.minStock" />
          <p class="muted">Flagged as low at {{ item.minStock }} or fewer.</p>
          <div v-if="can('stock:adjust')" class="stock__buttons">
            <button type="button" class="btn" :disabled="item.quantity === 0" @click="adjust(-10)">-10</button>
            <button type="button" class="btn" :disabled="item.quantity === 0" @click="adjust(-1)">-1</button>
            <button type="button" class="btn" @click="adjust(1)">+1</button>
            <button type="button" class="btn" @click="adjust(10)">+10</button>
          </div>
        </section>

        <section class="panel panel__body" aria-labelledby="info-title">
          <h2 id="info-title" class="visually-hidden">Details</h2>
          <dl class="facts">
            <div><dt>Category</dt><dd><span class="chip" :style="{ '--chip': category?.color }"><span class="chip__dot" />{{ category?.name ?? 'Uncategorised' }}</span></dd></div>
            <div><dt>Unit price</dt><dd>{{ formatCurrency(item.price) }}</dd></div>
            <div><dt>Stock value</dt><dd>{{ formatCurrency(item.price * item.quantity) }}</dd></div>
            <div><dt>Bin location</dt><dd>{{ item.location || '-' }}</dd></div>
            <div><dt>Supplier</dt><dd>{{ item.supplier || '-' }}</dd></div>
            <div><dt>Last updated</dt><dd>{{ formatDate(item.updatedAt) }}</dd></div>
          </dl>
          <p v-if="item.description" class="desc">{{ item.description }}</p>
        </section>
      </div>
    </div>
  </template>

  <ConfirmDialog v-bind="confirm.state" @confirm="confirm.accept" @cancel="confirm.cancel" />
</template>

<style scoped>
.detail { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: clamp(0.75rem, 2vw, 1.5rem); align-items: start; }
.detail__img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: var(--r-lg); border: 1px solid var(--line); background: var(--surface-2); }
.stock { display: grid; gap: 0.8rem; }
.stock__top { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.stock__count { font-size: 1rem; color: var(--ink-soft); }
.stock__count strong { font-family: var(--font-display); font-size: 2.4rem; color: var(--ink); margin-right: 0.2rem; }
.stock__buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
.facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: 1rem 1.5rem; margin: 0; }
.facts dt { color: var(--ink-mute); font-size: 0.85rem; }
.facts dd { margin: 0.1rem 0 0; font-weight: 550; }
.desc { margin-top: 1.1rem; padding-top: 1rem; border-top: 1px solid var(--line); color: var(--ink-soft); max-width: 65ch; }
@media (max-width: 52em) { .detail { grid-template-columns: minmax(0, 1fr); } }
</style>
