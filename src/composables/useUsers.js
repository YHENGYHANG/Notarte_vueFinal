import { useLocalStorage } from './useLocalStorage'
import { seedUsers } from '../data/seed'

// Shared (module-level) state: the list of accounts, kept in localStorage.
// NOTE: passwords are stored as plain text because this is a front-end-only demo.
// A real app must hash passwords on a server and never ship them to the browser.
const users = useLocalStorage('users', seedUsers)

export function useUsers(guard = { can: () => true }) {
  const denied = () => ({ ok: false, error: 'Your role does not allow this action.' })
  const adminCount = () => users.value.filter((u) => u.role === 'admin').length
  const usernameTaken = (username, exceptId) =>
    users.value.some((u) => u.username.toLowerCase() === username.toLowerCase() && u.id !== exceptId)

  function createUser(data) {
    if (!guard.can('users:manage')) return denied()
    if (usernameTaken(data.username)) return { ok: false, error: `The username "${data.username}" is taken.` }
    const user = { ...data, id: `u-${Date.now().toString(36)}`, createdAt: new Date().toISOString() }
    users.value.push(user)
    return { ok: true, user }
  }

  function updateUser(id, patch) {
    if (!guard.can('users:manage')) return denied()
    const user = users.value.find((u) => u.id === id)
    if (!user) return { ok: false, error: 'That user no longer exists.' }
    if (usernameTaken(patch.username ?? user.username, id)) return { ok: false, error: 'That username is taken.' }
    if (user.role === 'admin' && patch.role === 'user' && adminCount() === 1) {
      return { ok: false, error: 'Keep at least one admin account.' }
    }
    Object.assign(user, patch)
    return { ok: true, user }
  }

  function removeUser(id, currentUserId) {
    if (!guard.can('users:manage')) return denied()
    const user = users.value.find((u) => u.id === id)
    if (!user) return { ok: false, error: 'That user no longer exists.' }
    if (id === currentUserId) return { ok: false, error: 'You cannot delete the account you are signed in with.' }
    if (user.role === 'admin' && adminCount() === 1) return { ok: false, error: 'Keep at least one admin account.' }
    users.value = users.value.filter((u) => u.id !== id)
    return { ok: true }
  }

  return { users, createUser, updateUser, removeUser }
}

// Used by useAuth for sign-in lookups.
export const allUsers = users
