<script setup>
import { ref, computed, provide, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppTopbar from './components/layout/AppTopbar.vue'
import ToastHost from './components/common/ToastHost.vue'
import { useAuth } from './composables/useAuth'
import { layoutKey } from './injectionKeys'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()

// provide(): any descendant (sidebar, topbar) can inject() this without prop drilling.
const sidebarOpen = ref(false)
provide(layoutKey, {
  sidebarOpen,
  toggleSidebar: () => (sidebarOpen.value = !sidebarOpen.value),
  closeSidebar: () => (sidebarOpen.value = false),
})

const showShell = computed(() => isAuthenticated.value && route.meta.layout !== 'blank')

// If the session disappears (sign out in another tab, account deleted), go back to sign in.
watch(isAuthenticated, (signedIn) => {
  if (!signedIn && route.meta.requiresAuth) router.replace({ name: 'login', query: { redirect: route.fullPath } })
})
watch(() => route.fullPath, () => (sidebarOpen.value = false))
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>

  <div v-if="showShell" class="app-shell">
    <AppSidebar />
    <div class="app-main">
      <AppTopbar />
      <main id="main" class="page" tabindex="-1">
        <RouterView />
      </main>
    </div>
  </div>
  <RouterView v-else />

  <ToastHost />
</template>
