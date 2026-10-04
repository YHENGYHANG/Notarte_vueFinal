<script setup>
import { useToast } from '../../composables/useToast'
import BaseIcon from './BaseIcon.vue'

const { toasts, dismiss } = useToast()
const icons = { success: 'check', error: 'alert', info: 'info' }
</script>

<template>
  <div class="toast-host" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast--${toast.type}`" role="status">
        <BaseIcon :name="icons[toast.type]" :size="18" />
        <span>{{ toast.message }}</span>
        <button type="button" class="toast__close" aria-label="Dismiss" @click="dismiss(toast.id)">
          <BaseIcon name="x" :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-host { position: fixed; z-index: 200; right: 1rem; bottom: 1rem; display: grid; gap: 0.5rem; width: min(24rem, calc(100vw - 2rem)); pointer-events: none; }
.toast {
  pointer-events: auto; display: flex; align-items: center; gap: 0.6rem; padding: 0.7rem 0.75rem 0.7rem 1rem;
  border-radius: var(--r-md); background: var(--ink); color: #fff; box-shadow: 0 0.5rem 1.5rem rgb(20 29 38 / 0.3);
  border-left: 0.3rem solid var(--dock);
}
.toast span { flex: 1; font-size: 0.925rem; }
.toast--error { border-left-color: var(--alert); }
.toast--info { border-left-color: var(--amber); }
.toast__close { background: none; border: 0; color: inherit; opacity: 0.7; cursor: pointer; display: grid; padding: 0.25rem; }
.toast__close:hover { opacity: 1; }
.toast-enter-active, .toast-leave-active { transition: opacity 0.2s, transform 0.2s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(0.5rem); }
@media (max-width: 30em) { .toast-host { right: 0.75rem; left: 0.75rem; width: auto; } }
</style>
