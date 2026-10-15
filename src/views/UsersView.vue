<script setup>
import { ref, computed } from 'vue'
import BaseModal from '../components/common/BaseModal.vue'
import BaseIcon from '../components/common/BaseIcon.vue'
import RoleBadge from '../components/common/RoleBadge.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import UserForm from '../components/users/UserForm.vue'
import { useAuth } from '../composables/useAuth'
import { useUsers } from '../composables/useUsers'
import { useConfirm } from '../composables/useConfirm'
import { useToast } from '../composables/useToast'
import { formatDate } from '../utils/format'

// Admin only. The route guard blocks everyone else, and useUsers() re-checks the permission.
const auth = useAuth()
const toast = useToast()
const confirm = useConfirm()
const { users, createUser, updateUser, removeUser } = useUsers(auth)

const modalOpen = ref(false)
const editing = ref(null)

const takenUsernames = computed(() =>
  users.value.filter((u) => u.id !== editing.value?.id).map((u) => u.username.toLowerCase()),
)

function openCreate() {
  editing.value = null
  modalOpen.value = true
}
function openEdit(user) {
  editing.value = user
  modalOpen.value = true
}

function onSave(data) {
  const result = editing.value ? updateUser(editing.value.id, data) : createUser(data)
  if (!result.ok) {
    toast.error(result.error)
    return
  }
  toast.success(editing.value ? `Saved ${data.name}` : `Created ${data.name}`)
  modalOpen.value = false
}

async function onDelete(user) {
  const confirmed = await confirm.ask({
    title: `Delete ${user.name}?`,
    message: 'They will no longer be able to sign in.',
    confirmLabel: 'Delete user',
    danger: true,
  })
  if (!confirmed) return
  const result = removeUser(user.id, auth.currentUser.value?.id)
  result.ok ? toast.success(`Deleted ${user.name}`) : toast.error(result.error)
}
</script>

<template>
  <header class="page-header">
    <div>
      <h1>Users</h1>
      <p>Admins can do everything. Regular users can view inventory, add items and adjust stock.</p>
    </div>
    <div class="page-header__actions">
      <button type="button" class="btn btn--primary" @click="openCreate"><BaseIcon name="plus" :size="18" /> New user</button>
    </div>
  </header>

  <div class="panel table-wrap">
    <table class="table table--stack">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Username</th>
          <th scope="col">Role</th>
          <th scope="col">Created</th>
          <th scope="col"><span class="visually-hidden">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td class="cell-main"><strong>{{ user.name }}</strong> <span v-if="user.id === auth.currentUser.value?.id" class="badge">You</span></td>
          <td data-label="Username">{{ user.username }}</td>
          <td data-label="Role"><RoleBadge :role="user.role" /></td>
          <td data-label="Created">{{ formatDate(user.createdAt) }}</td>
          <td class="actions">
            <button type="button" class="icon-btn" :aria-label="`Edit ${user.name}`" @click="openEdit(user)"><BaseIcon name="edit" :size="18" /></button>
            <button type="button" class="icon-btn icon-btn--danger" :disabled="user.id === auth.currentUser.value?.id" :aria-label="`Delete ${user.name}`" @click="onDelete(user)"><BaseIcon name="trash" :size="18" /></button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <BaseModal v-model="modalOpen" :title="editing ? 'Edit user' : 'New user'">
    <UserForm v-if="modalOpen" :user="editing" :taken-usernames="takenUsernames" @save="onSave" @cancel="modalOpen = false" />
  </BaseModal>

  <ConfirmDialog v-bind="confirm.state" @confirm="confirm.accept" @cancel="confirm.cancel" />
</template>
