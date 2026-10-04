<script setup>
import { ROLE_LABELS } from '../../utils/permissions'
defineProps({ role: { type: String, required: true } })
</script>

<template>
  <span class="badge" :class="`badge--${role}`">{{ ROLE_LABELS[role] ?? role }}</span>
</template>
