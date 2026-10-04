<script setup>
import { useRoute } from 'vue-router'
import BaseIcon from '../components/common/BaseIcon.vue'
import RoleBadge from '../components/common/RoleBadge.vue'
import { useAuth } from '../composables/useAuth'

const route = useRoute()
const { currentUser } = useAuth()
</script>

<template>
  <div class="panel empty">
    <BaseIcon name="lock" :size="40" />
    <h1>You don’t have access to this page</h1>
    <p>
      Your account is signed in as <RoleBadge v-if="currentUser" :role="currentUser.role" />. This page is only for admins.
      <template v-if="route.query.from"><br /><code>{{ route.query.from }}</code></template>
    </p>
    <RouterLink :to="{ name: 'dashboard' }" class="btn">Back to the dashboard</RouterLink>
  </div>
</template>
