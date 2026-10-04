<script setup>
import { useAuth } from '../composables/useAuth'
import { iconUrl } from '../utils/images'
const { isAuthenticated } = useAuth()
</script>

<template>
  <main class="nf">
    <div class="panel empty">
      <img :src="iconUrl('default')" alt="" />
      <h1>That page isn’t on any shelf</h1>
      <p>The link may be wrong or the page may have moved.</p>
      <RouterLink :to="isAuthenticated ? { name: 'dashboard' } : { name: 'login' }" class="btn btn--primary">
        {{ isAuthenticated ? 'Go to the dashboard' : 'Go to sign in' }}
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
.nf { min-height: 60dvh; display: grid; place-items: center; padding: 1rem; }
.nf .panel { width: min(100%, 32rem); }
</style>
