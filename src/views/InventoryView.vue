<script setup>
import { useRouter, useRoute } from 'vue-router'
import ItemCard from '../components/inventory/ItemCard.vue'
import ItemTable from '../components/inventory/ItemTable.vue'
import ItemFilters from '../components/inventory/ItemFilters.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import BaseIcon from '../components/common/BaseIcon.vue'
import { useInventory } from '../composables/useInventory'
import { useInventoryFilters } from '../composables/useInventoryFilters'
import { useAuth } from '../composables/useAuth'
import { useConfirm } from '../composables/useConfirm'
import { useToast } from '../composables/useToast'
import { iconUrl } from '../utils/images'

/**
 * PARENT component. It owns the state (filters, data) and passes it down as props.
 * Children (ItemFilters, ItemCard, ItemTable) report back with events.
 */
const router = useRouter()
const route = useRoute()
const { can } = useAuth()
const toast = useToast()
const confirm = useConfirm()
const { items, categories, categoryMap, adjustStock, deleteItem } = useInventory()
const { search, category, status, sort, viewMode, filtered, hasFilters, clearFilters } = useInventoryFilters(items)

if (['low', 'out', 'ok'].includes(route.query.status)) status.value = route.query.status

const openItem = (id) => router.push({ name: 'item-detail', params: { id } })
const editItem = (id) => router.push({ name: 'item-edit', params: { id } })

async function onAdjust({ id, delta }) {
  if (Math.abs(delta) >= 10) {
    const item = items.value.find((entry) => entry.id === id)
    if (!item) return
    const confirmed = await confirm.ask({
      title: `${delta > 0 ? 'Add' : 'Remove'} ${Math.abs(delta)} units?`,
      message: `${item.name} will change from ${item.quantity} to ${Math.max(0, item.quantity + delta)} units.`,
      confirmLabel: delta > 0 ? 'Add stock' : 'Remove stock',
      danger: delta < 0,
    })
    if (!confirmed) return
  }
  const result = adjustStock(id, delta)
  if (!result.ok) toast.error(result.error)
}

async function onDelete(item) {
  const confirmed = await confirm.ask({
    title: `Delete ${item.name}?`,
    message: 'This removes the item and its stock count. It cannot be undone.',
    confirmLabel: 'Delete item',
    danger: true,
  })
  if (!confirmed) return
  const result = deleteItem(item.id)
  result.ok ? toast.success(`Deleted ${item.name}`) : toast.error(result.error)
}
</script>

<template>
  <header class="page-header">
    <div>
      <h1>Inventory</h1>
      <p>Search, filter and update everything on the shelves.</p>
    </div>
    <div class="page-header__actions">
      <RouterLink v-if="can('items:create')" :to="{ name: 'item-new' }" class="btn btn--primary"><BaseIcon name="plus" :size="18" /> Add item</RouterLink>
    </div>
  </header>

  <ItemFilters
    v-model:search="search"
    v-model:category="category"
    v-model:status="status"
    v-model:sort="sort"
    v-model:view-mode="viewMode"
    :categories="categories"
    :total="items.length"
    :shown="filtered.length"
    @clear="clearFilters"
  />

  <div v-if="!filtered.length" class="panel empty">
    <img :src="iconUrl('default')" alt="" />
    <h2>{{ hasFilters ? 'Nothing matches those filters' : 'No items yet' }}</h2>
    <p>{{ hasFilters ? 'Try a different search, or clear the filters to see everything.' : 'Add your first item to start tracking stock.' }}</p>
    <button v-if="hasFilters" type="button" class="btn" @click="clearFilters">Clear filters</button>
    <RouterLink v-else-if="can('items:create')" :to="{ name: 'item-new' }" class="btn btn--primary">Add item</RouterLink>
  </div>

  <div v-else-if="viewMode === 'grid'" class="card-grid">
    <ItemCard
      v-for="item in filtered"
      :key="item.id"
      :item="item"
      :category="categoryMap[item.categoryId]"
      :can-adjust="can('stock:adjust')"
      :can-edit="can('items:update')"
      :can-delete="can('items:delete')"
      @view="openItem"
      @edit="editItem"
      @delete="onDelete"
      @adjust="onAdjust"
    />
  </div>

  <ItemTable
    v-else
    :items="filtered"
    :category-map="categoryMap"
    :can-adjust="can('stock:adjust')"
    :can-edit="can('items:update')"
    :can-delete="can('items:delete')"
    @view="openItem"
    @edit="editItem"
    @delete="onDelete"
    @adjust="onAdjust"
  />

  <ConfirmDialog v-bind="confirm.state" @confirm="confirm.accept" @cancel="confirm.cancel" />
</template>
