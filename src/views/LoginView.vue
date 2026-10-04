<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseIcon from '../components/common/BaseIcon.vue'
import { useAuth } from '../composables/useAuth'
import { useForm, required } from '../composables/useForm'
import { useToast } from '../composables/useToast'
import heroUrl from '../assets/hero-warehouse.svg'

const route = useRoute()
const router = useRouter()
const { login } = useAuth()
const toast = useToast()

const form = useForm({ username: '', password: '' }, {
  username: [required('Enter your username')],
  password: [required('Enter your password')],
})
const { values } = form
const serverError = ref('')

function submit() {
  serverError.value = ''
  if (!form.validate()) return
  const result = login(values.username, values.password)
  if (!result.ok) {
    serverError.value = result.error
    return
  }
  toast.success(`Welcome back, ${result.user.name.split(' ')[0]}`)
  router.replace(typeof route.query.redirect === 'string' ? route.query.redirect : { name: 'dashboard' })
}

// Convenience for the demo: fill in a sample account.
function fill(username, password) {
  values.username = username
  values.password = password
  serverError.value = ''
}
</script>

<template>
  <div class="login">
    <section class="login__art" aria-hidden="true">
      <img :src="heroUrl" alt="" />
      <div class="login__art-text">
        <p>Know what is on the shelf before anyone asks.</p>
      </div>
    </section>

    <main id="main" class="login__panel">
      <form class="login__form" novalidate @submit.prevent="submit">
        <div>
          <h1>Sign in</h1>
          <p class="muted">Inventory Management System</p>
        </div>

        <p v-if="serverError" class="alert alert--error" role="alert"><BaseIcon name="alert" :size="18" /> {{ serverError }}</p>

        <div class="field">
          <label for="l-user">Username</label>
          <input id="l-user" v-model="values.username" class="input" autocomplete="username" autofocus :aria-invalid="!!form.errorFor('username')" @blur="form.touch('username')" />
          <p v-if="form.errorFor('username')" class="error" role="alert">{{ form.errorFor('username') }}</p>
        </div>

        <div class="field">
          <label for="l-pass">Password</label>
          <input id="l-pass" v-model="values.password" type="password" class="input" autocomplete="current-password" :aria-invalid="!!form.errorFor('password')" @blur="form.touch('password')" />
          <p v-if="form.errorFor('password')" class="error" role="alert">{{ form.errorFor('password') }}</p>
        </div>

        <button type="submit" class="btn btn--primary btn--block">Sign in</button>

        <div class="demo">
          <p class="demo__title">Demo accounts</p>
          <div class="demo__row">
            <button type="button" class="demo__btn" @click="fill('admin', 'admin123')">
              <strong>Admin</strong><span>admin / admin123</span><small>Full access</small>
            </button>
            <button type="button" class="demo__btn" @click="fill('staff', 'staff123')">
              <strong>Regular user</strong><span>staff / staff123</span><small>Limited access</small>
            </button>
          </div>
        </div>
      </form>
    </main>
  </div>
</template>

<style scoped>
.login { min-height: 100dvh; display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); }
.login__art { position: relative; background: #141d26; display: grid; place-items: center; padding: clamp(1rem, 4vw, 3rem); }
.login__art img { width: min(100%, 36rem); border-radius: var(--r-lg); }
.login__art-text { position: absolute; left: clamp(1rem, 4vw, 3rem); right: clamp(1rem, 4vw, 3rem); bottom: clamp(1rem, 4vw, 2.5rem); }
.login__art-text p { font-family: var(--font-display); color: #fff; font-size: clamp(1.2rem, 1rem + 1vw, 1.8rem); font-weight: 600; max-width: 22ch; }
.login__panel { display: grid; place-items: center; padding: clamp(1.25rem, 4vw, 3rem); }
.login__form { width: min(100%, 25rem); display: grid; gap: 1.1rem; }
.error { color: var(--alert); font-size: 0.875rem; }
.demo { border: 1.5px dashed var(--line-strong); border-radius: var(--r-md); padding: 0.9rem; display: grid; gap: 0.6rem; background: var(--surface); }
.demo__title { font-weight: 600; font-size: 0.9rem; }
.demo__row { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: 0.5rem; }
.demo__btn { display: grid; gap: 0.1rem; text-align: left; padding: 0.6rem 0.75rem; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface-2); cursor: pointer; }
.demo__btn:hover { border-color: var(--dock); background: var(--dock-tint); }
.demo__btn span { font-size: 0.85rem; color: var(--ink-soft); font-variant-numeric: tabular-nums; }
.demo__btn small { color: var(--ink-mute); }
@media (max-width: 56em) {
  .login { grid-template-columns: 1fr; }
  .login__art { padding-block: 1.25rem; }
  .login__art img { width: min(100%, 20rem); max-height: 11rem; object-fit: cover; }
  .login__art-text { display: none; }
}
</style>
