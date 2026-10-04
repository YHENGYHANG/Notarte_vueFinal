<script setup>
import { watch } from 'vue'
import { useForm, required, minLength, pattern, matches } from '../../composables/useForm'
import { ROLES, ROLE_LABELS } from '../../utils/permissions'

const props = defineProps({
  user: { type: Object, default: null },
  takenUsernames: { type: Array, default: () => [] },
})
const emit = defineEmits(['save', 'cancel'])

const initial = (u) => ({ name: u?.name ?? '', username: u?.username ?? '', password: u?.password ?? '', role: u?.role ?? ROLES.USER })

const form = useForm(initial(props.user), {
  name: [required('Enter the person’s name'), minLength(2)],
  username: [
    required('Enter a username'),
    pattern(/^[a-z0-9._-]{3,20}$/i, 'Use 3 to 20 letters, numbers, dots, dashes or underscores'),
    matches((v) => !props.takenUsernames.includes(String(v).toLowerCase()), 'This username is taken'),
  ],
  password: [required('Enter a password'), minLength(6, 'Use at least 6 characters')],
  role: [required('Choose a role')],
})
const { values } = form

watch(() => props.user, (u) => form.reset(initial(u)))

function submit() {
  if (!form.validate()) return
  emit('save', { name: values.name.trim(), username: values.username.trim(), password: values.password, role: values.role })
}
</script>

<template>
  <form class="stack" novalidate @submit.prevent="submit">
    <div class="field">
      <label for="u-name">Full name</label>
      <input id="u-name" v-model="values.name" class="input" autocomplete="off" :aria-invalid="!!form.errorFor('name')" @blur="form.touch('name')" />
      <p v-if="form.errorFor('name')" class="error" role="alert">{{ form.errorFor('name') }}</p>
    </div>
    <div class="field">
      <label for="u-username">Username</label>
      <input id="u-username" v-model="values.username" class="input" autocomplete="off" :aria-invalid="!!form.errorFor('username')" @blur="form.touch('username')" />
      <p v-if="form.errorFor('username')" class="error" role="alert">{{ form.errorFor('username') }}</p>
    </div>
    <div class="field">
      <label for="u-password">Password</label>
      <input id="u-password" v-model="values.password" type="text" class="input" autocomplete="off" :aria-invalid="!!form.errorFor('password')" @blur="form.touch('password')" />
      <p v-if="form.errorFor('password')" class="error" role="alert">{{ form.errorFor('password') }}</p>
      <p v-else class="hint">Demo only: passwords are saved as plain text in this browser.</p>
    </div>
    <fieldset class="roles">
      <legend class="label">Role</legend>
      <label class="role" :class="{ 'is-selected': values.role === ROLES.USER }">
        <input v-model="values.role" type="radio" name="role" :value="ROLES.USER" />
        <span><strong>{{ ROLE_LABELS.user }}</strong><small>View inventory, add items, adjust stock.</small></span>
      </label>
      <label class="role" :class="{ 'is-selected': values.role === ROLES.ADMIN }">
        <input v-model="values.role" type="radio" name="role" :value="ROLES.ADMIN" />
        <span><strong>{{ ROLE_LABELS.admin }}</strong><small>Full access, including edit, delete, categories and users.</small></span>
      </label>
    </fieldset>
    <div class="form-actions">
      <button type="button" class="btn" @click="emit('cancel')">Cancel</button>
      <button type="submit" class="btn btn--primary">{{ user ? 'Save changes' : 'Create user' }}</button>
    </div>
  </form>
</template>

<style scoped>
.roles { border: 0; padding: 0; margin: 0; display: grid; gap: 0.5rem; }
.roles .label { font-weight: 550; font-size: 0.925rem; margin-bottom: 0.2rem; padding: 0; }
.role { display: flex; gap: 0.75rem; align-items: flex-start; border: 2px solid var(--line); border-radius: var(--r-md); padding: 0.7rem 0.9rem; cursor: pointer; }
.role.is-selected { border-color: var(--dock); background: var(--dock-tint); }
.role span { display: grid; }
.role small { color: var(--ink-soft); }
.role input { margin-top: 0.3rem; accent-color: var(--dock); }
.hint { color: var(--ink-mute); font-size: 0.85rem; }
.error { color: var(--alert); font-size: 0.875rem; }
</style>
