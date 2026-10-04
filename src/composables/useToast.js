import { ref } from 'vue'

// Module-level state: every component that calls useToast() shares the same list.
const toasts = ref([])
let nextId = 1

function dismiss(id) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

function notify(message, type = 'success', timeout = 3600) {
  const id = nextId++
  toasts.value.push({ id, message, type })
  if (timeout) setTimeout(() => dismiss(id), timeout)
  return id
}

export function useToast() {
  return {
    toasts,
    dismiss,
    notify,
    success: (message) => notify(message, 'success'),
    error: (message) => notify(message, 'error', 5200),
    info: (message) => notify(message, 'info'),
  }
}
