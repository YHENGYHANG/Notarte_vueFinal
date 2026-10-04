<script setup>
import SearchBar from '../common/SearchBar.vue'
import BaseIcon from '../common/BaseIcon.vue'

/**
 * Several v-models on one child:
 *   <ItemFilters v-model:search="search" v-model:category="category" ... />
 * Each one is a prop + an `update:<name>` event.
 */
defineProps({
  search: { type: String, default: '' },
  category: { type: String, default: '' },
  status: { type: String, default: '' },
  sort: { type: String, default: 'name-asc' },
  viewMode: { type: String, default: 'grid' },
  categories: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  shown: { type: Number, default: 0 },
})
const emit = defineEmits(['update:search', 'update:category', 'update:status', 'update:sort', 'update:viewMode', 'clear'])
</script>

<template>
  <section class="filters" aria-label="Search and filter inventory">
    <div class="filters__search">
      <SearchBar :model-value="search" placeholder="Search by name, SKU, bin or supplier" label="Search inventory" @update:model-value="emit('update:search', $event)" />
    </div>

    <label class="filters__field">
      <span class="visually-hidden">Category</span>
      <select class="select" :value="category" @change="emit('update:category', $event.target.value)">
        <option value="">All categories</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </label>

    <label class="filters__field">
      <span class="visually-hidden">Stock level</span>
      <select class="select" :value="status" @change="emit('update:status', $event.target.value)">
        <option value="">Any stock level</option>
        <option value="ok">In stock</option>
        <option value="low">Low stock</option>
        <option value="out">Out of stock</option>
      </select>
    </label>

    <label class="filters__field">
      <span class="visually-hidden">Sort by</span>
      <select class="select" :value="sort" @change="emit('update:sort', $event.target.value)">
        <option value="name-asc">Name A to Z</option>
        <option value="name-desc">Name Z to A</option>
        <option value="qty-asc">Lowest stock first</option>
        <option value="qty-desc">Highest stock first</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="updated-desc">Recently updated</option>
      </select>
    </label>

    <div class="view-toggle" role="group" aria-label="Layout">
      <button type="button" class="icon-btn" :class="{ 'is-on': viewMode === 'grid' }" :aria-pressed="viewMode === 'grid'" aria-label="Card view" @click="emit('update:viewMode', 'grid')"><BaseIcon name="grid" /></button>
      <button type="button" class="icon-btn" :class="{ 'is-on': viewMode === 'list' }" :aria-pressed="viewMode === 'list'" aria-label="Table view" @click="emit('update:viewMode', 'list')"><BaseIcon name="list" /></button>
    </div>

    <p class="filters__count" aria-live="polite">
      Showing {{ shown }} of {{ total }}
      <button v-if="shown !== total" type="button" class="linkish" @click="emit('clear')">Clear filters</button>
    </p>
  </section>
</template>

<style scoped>
.filters { display: grid; grid-template-columns: minmax(14rem, 2fr) repeat(3, minmax(9rem, 1fr)) auto; gap: 0.6rem; align-items: center; margin-bottom: 1rem; }
.filters__count { grid-column: 1 / -1; color: var(--ink-mute); font-size: 0.9rem; }
.view-toggle { display: inline-flex; border: 1px solid var(--line-strong); border-radius: var(--r-md); background: var(--surface); padding: 0.15rem; }
.view-toggle .is-on { background: var(--dock-tint); color: var(--dock-dark); }
.linkish { background: none; border: 0; padding: 0 0 0 0.5rem; color: var(--dock-dark); font-weight: 600; cursor: pointer; text-decoration: underline; text-underline-offset: 0.2em; }
@media (max-width: 70em) { .filters { grid-template-columns: repeat(3, minmax(0, 1fr)) auto; } .filters__search { grid-column: 1 / -1; } }
@media (max-width: 36em) { .filters { grid-template-columns: 1fr 1fr; } .view-toggle { justify-self: end; grid-column: 1 / -1; } }
</style>
