<script setup>
import { timeAgo } from '../../utils/format'
defineProps({ entries: { type: Array, required: true } })
</script>

<template>
  <section class="panel" aria-labelledby="act-title">
    <div class="panel__head"><h2 id="act-title">Recent activity</h2></div>
    <p v-if="!entries.length" class="panel__body muted">Changes you make to the inventory will appear here.</p>
    <ol v-else class="feed">
      <li v-for="entry in entries" :key="entry.id">
        <p>{{ entry.message }}</p>
        <p class="muted feed__meta">{{ entry.actor }}, {{ timeAgo(entry.at) }}</p>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.feed { list-style: none; margin: 0; padding: 0; }
.feed li { padding: 0.75rem 1.25rem; border-bottom: 1px solid var(--line); }
.feed li:last-child { border-bottom: 0; }
.feed__meta { font-size: 0.85rem; }
</style>
