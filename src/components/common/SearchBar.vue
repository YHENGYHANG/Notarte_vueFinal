<script setup>
import BaseIcon from './BaseIcon.vue'

// The classic v-model contract for a custom component:
//   prop `modelValue` comes in, event `update:modelValue` goes out.
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search…' },
  label: { type: String, default: 'Search' },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="search">
    <BaseIcon name="search" :size="18" class="search__icon" />
    <input
      class="input search__input"
      type="search"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-label="label"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <button v-if="modelValue" type="button" class="icon-btn search__clear" aria-label="Clear search" @click="emit('update:modelValue', '')">
      <BaseIcon name="x" :size="16" />
    </button>
  </div>
</template>

<style scoped>
.search { position: relative; }
.search__icon { position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%); color: var(--ink-mute); pointer-events: none; }
.search__input { padding-left: 2.5rem; padding-right: 2.5rem; }
.search__input::-webkit-search-cancel-button { display: none; }
.search__clear { position: absolute; right: 0.25rem; top: 50%; transform: translateY(-50%); width: 2rem; height: 2rem; }
</style>
