<script setup>
import BaseModal from './BaseModal.vue'

defineProps({
  open: Boolean,
  title: { type: String, default: 'Are you sure?' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirm' },
  danger: Boolean,
})
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <BaseModal :model-value="open" :title="title" size="sm" @update:model-value="(value) => !value && emit('cancel')">
    <p class="message">{{ message }}</p>
    <template #footer>
      <button type="button" class="btn" @click="emit('cancel')">Cancel</button>
      <button type="button" class="btn" :class="danger ? 'btn--danger' : 'btn--primary'" @click="emit('confirm')">
        {{ confirmLabel }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.message { color: var(--ink-soft); }
</style>
