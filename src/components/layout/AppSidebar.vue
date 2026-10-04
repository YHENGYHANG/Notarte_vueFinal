<script setup>
import { computed, inject } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BaseIcon from '../common/BaseIcon.vue'
import { useAuth } from '../../composables/useAuth'
import { layoutKey } from '../../injectionKeys'

// provide/inject: App.vue owns the "drawer is open" state, the sidebar reads and closes it.
const layout = inject(layoutKey)
const route = useRoute()
const router = useRouter()
const { can, logout } = useAuth()

const nav = [
  { path: '/', label: 'Dashboard', icon: 'dashboard', perm: 'dashboard:view', exact: true },
  { path: '/inventory', label: 'Inventory', icon: 'package', perm: 'items:view' },
  { path: '/categories', label: 'Categories', icon: 'tag', perm: 'categories:manage', admin: true },
  { path: '/users', label: 'Users', icon: 'users', perm: 'users:manage', admin: true },
  { path: '/insights', label: 'Insights', icon: 'dashboard', perm: 'guide:view' },
]

// Links the current role cannot open are never rendered.
const mainLinks = computed(() => nav.filter((n) => !n.admin && can(n.perm)))
const adminLinks = computed(() => nav.filter((n) => n.admin && can(n.perm)))

const isActive = (item) =>
  item.exact ? route.path === item.path : route.path === item.path || route.path.startsWith(item.path + '/')

function signOut() {
  logout()
  layout.closeSidebar()
  router.replace({ name: 'login' })
}
</script>

<template>
  <div class="scrim" :class="{ 'is-open': layout.sidebarOpen.value }" @click="layout.closeSidebar()" />
  <aside id="sidebar" class="sidebar" :class="{ 'is-open': layout.sidebarOpen.value }" aria-label="Main navigation">
    <div class="brand">
      <svg class="brand__mark" viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="9" fill="#26333f" />
        <rect x="8" y="9" width="24" height="5" rx="1.5" fill="#f2b01e" />
        <rect x="8" y="18" width="24" height="5" rx="1.5" fill="#2fb3ad" />
        <rect x="8" y="27" width="14" height="5" rx="1.5" fill="#c7d2dc" />
      </svg>
      <div class="brand__text">
        <strong>Inventory</strong>
        <span>Management System</span>
      </div>
    </div>

    <nav class="nav">
      <RouterLink v-for="item in mainLinks" :key="item.path" :to="item.path" class="nav__link" :class="{ 'is-active': isActive(item) }" :aria-current="isActive(item) ? 'page' : undefined" @click="layout.closeSidebar()">
        <BaseIcon :name="item.icon" /> {{ item.label }}
      </RouterLink>

      <template v-if="adminLinks.length">
        <p class="nav__group">Admin tools</p>
        <RouterLink v-for="item in adminLinks" :key="item.path" :to="item.path" class="nav__link" :class="{ 'is-active': isActive(item) }" :aria-current="isActive(item) ? 'page' : undefined" @click="layout.closeSidebar()">
          <BaseIcon :name="item.icon" /> {{ item.label }}
        </RouterLink>
      </template>
    </nav>

    <button type="button" class="nav__link nav__logout" @click="signOut">
      <BaseIcon name="logout" /> Sign out
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  position: sticky; top: 0; height: 100dvh; display: flex; flex-direction: column; gap: 1.25rem;
  padding: 1.25rem 0.9rem; background: var(--sidebar); color: var(--sidebar-ink); overflow-y: auto;
}
.brand { display: flex; align-items: center; gap: 0.7rem; padding: 0 0.4rem; }
.brand__mark { width: 2.5rem; height: 2.5rem; flex: none; }
.brand__text { display: flex; flex-direction: column; line-height: 1.15; }
.brand__text strong { font-family: var(--font-display); font-size: 1.2rem; color: #fff; }
.brand__text span { font-size: 0.8rem; color: #8fa0b0; }

.nav { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; }
.nav__group { margin: 1rem 0.7rem 0.3rem; font-size: 0.8rem; color: #7f91a2; font-weight: 600; }
.nav__link {
  display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.75rem; border-radius: var(--r-md);
  color: var(--sidebar-ink); text-decoration: none; font-weight: 500; background: none; border: 0; cursor: pointer; width: 100%; text-align: left;
  border-left: 0.2rem solid transparent;
}
.nav__link:hover { background: #1d2a36; color: #fff; }
.nav__link.is-active { background: #1f2f3d; color: #fff; border-left-color: var(--amber); }
.nav__logout { border-top: 1px solid var(--sidebar-line); border-radius: 0 0 var(--r-md) var(--r-md); padding-top: 0.9rem; }

.scrim { display: none; }

@media (max-width: 60em) {
  .sidebar {
    position: fixed; z-index: 60; inset: 0 auto 0 0; width: min(18rem, 86vw);
    transform: translateX(-102%); transition: transform 0.22s ease-out; box-shadow: 0 0 2rem rgb(0 0 0 / 0.4);
  }
  .sidebar.is-open { transform: none; }
  .scrim { display: block; position: fixed; inset: 0; z-index: 55; background: rgb(20 29 38 / 0.5); opacity: 0; pointer-events: none; transition: opacity 0.2s; }
  .scrim.is-open { opacity: 1; pointer-events: auto; }
}
</style>
