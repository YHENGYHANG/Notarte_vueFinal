import { computed } from 'vue'
import { useLocalStorage } from './useLocalStorage'
import { allUsers } from './useUsers'
import { roleCan } from '../utils/permissions'

// The session only stores the user id. The user record is looked up on every read,
// so a role change or deletion takes effect immediately.
const session = useLocalStorage('session', null)

const currentUser = computed(() => allUsers.value.find((u) => u.id === session.value?.userId) ?? null)
const isAuthenticated = computed(() => !!currentUser.value)
const isAdmin = computed(() => currentUser.value?.role === 'admin')

function can(permission) {
  return roleCan(currentUser.value?.role, permission)
}

function login(username, password) {
  const user = allUsers.value.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password,
  )
  if (!user) return { ok: false, error: 'Username or password is incorrect.' }
  session.value = { userId: user.id, at: Date.now() }
  return { ok: true, user }
}

function logout() {
  session.value = null
}

export function useAuth() {
  return { currentUser, isAuthenticated, isAdmin, can, login, logout }
}
