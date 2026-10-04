<script setup>
import { inject } from 'vue'
import { useRoute } from 'vue-router'
import BaseIcon from '../common/BaseIcon.vue'
import RoleBadge from '../common/RoleBadge.vue'
import { useAuth } from '../../composables/useAuth'
import { layoutKey } from '../../injectionKeys'

const layout = inject(layoutKey)
const route = useRoute()
const { currentUser } = useAuth()
</script>

<template>
  <header class="topbar">
    <button type="button" class="icon-btn topbar__menu" aria-label="Open navigation" aria-controls="sidebar" :aria-expanded="layout.sidebarOpen.value" @click="layout.toggleSidebar()">
      <BaseIcon name="menu" :size="22" />
    </button>
    <p class="topbar__title">{{ route.meta.title }}</p>
    <div v-if="currentUser" class="topbar__user">
      <span class="topbar__name">{{ currentUser.name }}</span>
      <RoleBadge :role="currentUser.role" />
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex; align-items: center; gap: 0.75rem; min-height: 3.5rem; padding: 0.5rem clamp(1rem, 2.4vw, 2rem);
  background: var(--surface); border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 20;
}
.topbar__menu { display: none; }
.topbar__title { font-family: var(--font-display); font-weight: 600; font-size: 1.05rem; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.topbar__user { display: flex; align-items: center; gap: 0.6rem; min-width: 0; }
.topbar__name { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 60em) { .topbar__menu { display: inline-grid; } }
@media (max-width: 30em) { .topbar__name { display: none; } }
</style>
