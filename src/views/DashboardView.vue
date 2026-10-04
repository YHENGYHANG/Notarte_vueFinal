<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import StatStrip from '../components/dashboard/StatStrip.vue'
import AttentionList from '../components/dashboard/AttentionList.vue'
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown.vue'
import ActivityFeed from '../components/dashboard/ActivityFeed.vue'
import { useInventory } from '../composables/useInventory'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { restockAmount } from '../utils/stock'

const router = useRouter()
const { currentUser, can } = useAuth()
const toast = useToast()
const { stats, attentionItems, categoryMap, byCategory, activity, adjustStock } = useInventory()

const greeting = computed(() => {
  const hour = new Date().getHours()
  const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  return `${part}, ${currentUser.value.name.split(' ')[0]}`
})

// Handlers for events emitted by the child components.
const openItem = (id) => router.push({ name: 'item-detail', params: { id } })

function restock(item) {
  const amount = restockAmount(item)
  const result = adjustStock(item.id, amount)
  result.ok ? toast.success(`Added ${amount} to ${item.name}`) : toast.error(result.error)
}
</script>

<template>
  <header class="page-header">
    <div>
      <h1>{{ greeting }}</h1>
      <p>{{ can('items:update') ? 'You have full admin access.' : 'You can browse inventory, add items and adjust stock counts.' }}</p>
    </div>
    <div class="page-header__actions">
      <RouterLink v-if="can('items:create')" :to="{ name: 'item-new' }" class="btn btn--primary">Add item</RouterLink>
      <RouterLink :to="{ name: 'inventory' }" class="btn">Open inventory</RouterLink>
    </div>
  </header>

  <StatStrip :stats="stats" />

  <div class="grid">
    <AttentionList :items="attentionItems" :category-map="categoryMap" :can-restock="can('stock:adjust')" @open="openItem" @restock="restock" />
    <div class="stack">
      <CategoryBreakdown :rows="byCategory" />
      <ActivityFeed :entries="activity.slice(0, 6)" />
    </div>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: clamp(0.75rem, 2vw, 1.25rem); margin-top: clamp(0.75rem, 2vw, 1.25rem); align-items: start; }
@media (max-width: 64em) { .grid { grid-template-columns: minmax(0, 1fr); } }
</style>
