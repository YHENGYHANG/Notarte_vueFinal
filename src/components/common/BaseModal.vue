<script setup>
import { ref, watch, onMounted } from 'vue'
import BaseIcon from './BaseIcon.vue'

// v-model support: parent passes `modelValue`, child emits `update:modelValue`.
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md | lg
})
const emit = defineEmits(['update:modelValue'])

// A native <dialog> gives us focus trapping, Esc to close and a backdrop for free.
const dialog = ref(null)

function sync(open) {
  const el = dialog.value
  if (!el) return
  if (open && !el.open) el.showModal()
  if (!open && el.open) el.close()
}

watch(() => props.modelValue, sync)
onMounted(() => sync(props.modelValue))

// Fired when the user presses Esc. Only tell the parent if it still thinks we are open.
function onClose() {
  if (props.modelValue) emit('update:modelValue', false)
}

// A click on the backdrop lands on the <dialog> element itself.
function onClick(event) {
  if (event.target === dialog.value) emit('update:modelValue', false)
}
</script>

<template>
  <dialog ref="dialog" class="modal" :class="`modal--${size}`" @close="onClose" @click="onClick">
    <div class="modal__panel">
      <header class="modal__head">
        <h2>{{ title }}</h2>
        <button type="button" class="icon-btn" aria-label="Close dialog" @click="emit('update:modelValue', false)">
          <BaseIcon name="x" />
        </button>
      </header>
      <div class="modal__body"><slot /></div>
      <footer v-if="$slots.footer" class="modal__foot"><slot name="footer" /></footer>
    </div>
  </dialog>
</template>

<style scoped>
.modal__panel {
  background: var(--surface); border-radius: var(--r-lg); max-height: calc(100dvh - 1.5rem);
  display: flex; flex-direction: column; box-shadow: 0 1.5rem 3rem rgb(20 29 38 / 0.35);
}
.modal__head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.25rem; border-bottom: 1px solid var(--line); }
.modal__body { padding: 1.25rem; overflow-y: auto; }
.modal__foot { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem; padding: 0.9rem 1.25rem; border-top: 1px solid var(--line); background: var(--surface-2); border-radius: 0 0 var(--r-lg) var(--r-lg); }
</style>
