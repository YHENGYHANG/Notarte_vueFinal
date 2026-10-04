import { ref, watch } from 'vue'
import { STORAGE_PREFIX } from '../config'

/**
 * A ref that is saved to localStorage whenever it changes.
 *
 *   const items = useLocalStorage('items', [])
 *   items.value.push({ ... })   // saved automatically
 *
 * - falls back to `defaultValue` the first time (or if the stored JSON is broken)
 * - stays in sync between browser tabs through the "storage" event
 */
export function useLocalStorage(key, defaultValue) {
  const storageKey = STORAGE_PREFIX + key
  const clone = (value) => JSON.parse(JSON.stringify(value))

  function read() {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw === null ? clone(defaultValue) : JSON.parse(raw)
    } catch {
      return clone(defaultValue)
    }
  }

  const data = ref(read())

  watch(
    data,
    (value) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value))
      } catch (error) {
        // Usually the 5 MB quota. The app keeps working in memory.
        console.warn(`Could not save "${storageKey}" to localStorage`, error)
      }
    },
    { deep: true, immediate: true },
  )

  window.addEventListener('storage', (event) => {
    if (event.key === storageKey && event.newValue) {
      data.value = JSON.parse(event.newValue)
    }
  })

  return data
}
