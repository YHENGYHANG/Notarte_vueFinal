import { computed } from 'vue'
import { useLocalStorage } from './useLocalStorage'
import { useAuth } from './useAuth'
import { seedItems, seedCategories } from '../data/seed'
import { getStockStatus } from '../utils/stock'

// Shared state, persisted to localStorage. Every component that calls
// useInventory() reads and writes these same three lists.
const items = useLocalStorage('items', seedItems)
const categories = useLocalStorage('categories', seedCategories)
const activity = useLocalStorage('activity', [])

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const denied = () => ({ ok: false, error: 'Your role does not allow this action.' })

export function useInventory() {
  const { can, currentUser } = useAuth()

  /* ---------- activity log ---------- */
  function log(message) {
    activity.value.unshift({
      id: uid('act'),
      message,
      actor: currentUser.value?.name ?? 'System',
      at: new Date().toISOString(),
    })
    if (activity.value.length > 30) activity.value.length = 30
  }

  /* ---------- derived data ---------- */
  const categoryMap = computed(() => Object.fromEntries(categories.value.map((c) => [c.id, c])))

  const stats = computed(() => {
    const list = items.value
    return {
      skuCount: list.length,
      unitCount: list.reduce((sum, i) => sum + i.quantity, 0),
      stockValue: list.reduce((sum, i) => sum + i.quantity * i.price, 0),
      lowCount: list.filter((i) => getStockStatus(i) === 'low').length,
      outCount: list.filter((i) => getStockStatus(i) === 'out').length,
    }
  })

  const attentionItems = computed(() =>
    items.value
      .filter((i) => getStockStatus(i) !== 'ok')
      .sort((a, b) => a.quantity / Math.max(a.minStock, 1) - b.quantity / Math.max(b.minStock, 1)),
  )

  const byCategory = computed(() =>
    categories.value.map((c) => {
      const list = items.value.filter((i) => i.categoryId === c.id)
      return { ...c, skuCount: list.length, units: list.reduce((sum, i) => sum + i.quantity, 0) }
    }),
  )

  /* ---------- items: Create / Read / Update / Delete ---------- */
  const getItem = (id) => items.value.find((i) => i.id === id) ?? null
  const skuTaken = (sku, exceptId) =>
    items.value.some((i) => i.sku.toUpperCase() === sku.toUpperCase() && i.id !== exceptId)

  function createItem(data) {
    if (!can('items:create')) return denied()
    if (skuTaken(data.sku)) return { ok: false, error: `SKU ${data.sku} is already in use.` }
    const now = new Date().toISOString()
    const item = { ...data, id: uid('item'), createdAt: now, updatedAt: now }
    items.value.unshift(item)
    log(`Added ${item.name}`)
    return { ok: true, item }
  }

  function updateItem(id, patch) {
    if (!can('items:update')) return denied()
    const item = getItem(id)
    if (!item) return { ok: false, error: 'That item no longer exists.' }
    if (patch.sku && skuTaken(patch.sku, id)) return { ok: false, error: `SKU ${patch.sku} is already in use.` }
    Object.assign(item, patch, { updatedAt: new Date().toISOString() })
    log(`Updated ${item.name}`)
    return { ok: true, item }
  }

  function adjustStock(id, delta) {
    if (!can('stock:adjust')) return denied()
    const item = getItem(id)
    if (!item) return { ok: false, error: 'That item no longer exists.' }
    const before = item.quantity
    item.quantity = Math.max(0, item.quantity + delta)
    item.updatedAt = new Date().toISOString()
    const change = item.quantity - before
    if (change !== 0) log(`${change > 0 ? 'Added' : 'Removed'} ${Math.abs(change)} ${item.name} (now ${item.quantity})`)
    return { ok: true, item }
  }

  function deleteItem(id) {
    if (!can('items:delete')) return denied()
    const item = getItem(id)
    if (!item) return { ok: false, error: 'That item no longer exists.' }
    items.value = items.value.filter((i) => i.id !== id)
    log(`Deleted ${item.name}`)
    return { ok: true }
  }

  /* ---------- categories: Create / Update / Delete ---------- */
  function createCategory(data) {
    if (!can('categories:manage')) return denied()
    if (categories.value.some((c) => c.name.toLowerCase() === data.name.toLowerCase())) {
      return { ok: false, error: `A category named "${data.name}" already exists.` }
    }
    const category = { ...data, id: uid('cat') }
    categories.value.push(category)
    log(`Created category ${category.name}`)
    return { ok: true, category }
  }

  function updateCategory(id, patch) {
    if (!can('categories:manage')) return denied()
    const category = categories.value.find((c) => c.id === id)
    if (!category) return { ok: false, error: 'That category no longer exists.' }
    Object.assign(category, patch)
    log(`Updated category ${category.name}`)
    return { ok: true, category }
  }

  function deleteCategory(id) {
    if (!can('categories:manage')) return denied()
    const used = items.value.filter((i) => i.categoryId === id).length
    if (used > 0) return { ok: false, error: `${used} item${used === 1 ? ' still uses' : 's still use'} this category. Move or delete them first.` }
    const category = categories.value.find((c) => c.id === id)
    categories.value = categories.value.filter((c) => c.id !== id)
    if (category) log(`Deleted category ${category.name}`)
    return { ok: true }
  }

  function resetInventory() {
    if (!can('users:manage')) return denied()
    items.value = JSON.parse(JSON.stringify(seedItems))
    categories.value = JSON.parse(JSON.stringify(seedCategories))
    activity.value = []
    log('Reset demo data')
    return { ok: true }
  }

  return {
    items, categories, activity,
    categoryMap, stats, attentionItems, byCategory,
    getItem, skuTaken,
    createItem, updateItem, adjustStock, deleteItem,
    createCategory, updateCategory, deleteCategory,
    resetInventory,
  }
}
