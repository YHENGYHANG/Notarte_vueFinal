import { ref, computed } from 'vue'
import { useLocalStorage } from './useLocalStorage'
import { getStockStatus } from '../utils/stock'

/**
 * Search, filter and sort a list of items.
 * The sort order and the grid/list choice are remembered in localStorage.
 */
export function useInventoryFilters(items) {
  const prefs = useLocalStorage('inventory-prefs', { viewMode: 'grid', sort: 'name-asc' })

  const search = ref('')
  const category = ref('')
  const status = ref('')

  const sort = computed({
    get: () => prefs.value.sort,
    set: (value) => (prefs.value.sort = value),
  })
  const viewMode = computed({
    get: () => prefs.value.viewMode,
    set: (value) => (prefs.value.viewMode = value),
  })

  const sorters = {
    name: (a, b) => a.name.localeCompare(b.name),
    qty: (a, b) => a.quantity - b.quantity,
    price: (a, b) => a.price - b.price,
    updated: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
  }

  const filtered = computed(() => {
    const query = search.value.trim().toLowerCase()
    const list = items.value.filter((item) => {
      if (category.value && item.categoryId !== category.value) return false
      if (status.value && getStockStatus(item) !== status.value) return false
      if (!query) return true
      return [item.name, item.sku, item.location, item.supplier].some((field) =>
        (field || '').toLowerCase().includes(query),
      )
    })
    const [key, direction] = sort.value.split('-')
    list.sort(sorters[key] ?? sorters.name)
    if (direction === 'desc') list.reverse()
    return list
  })

  const hasFilters = computed(() => !!(search.value || category.value || status.value))

  function clearFilters() {
    search.value = ''
    category.value = ''
    status.value = ''
  }

  return { search, category, status, sort, viewMode, filtered, hasFilters, clearFilters }
}
