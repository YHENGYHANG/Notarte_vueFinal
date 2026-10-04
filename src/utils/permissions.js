// Role-based access control (RBAC).
// One table decides who can do what. The router guard, the composables and
// the templates (v-if="can(...)") all read from this same source of truth.

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
}

export const ROLE_LABELS = {
  admin: 'Admin',
  user: 'User',
}

const ALL = [ROLES.ADMIN, ROLES.USER]
const ADMIN_ONLY = [ROLES.ADMIN]

export const PERMISSIONS = {
  'dashboard:view': { label: 'See the dashboard', roles: ALL },
  'items:view': { label: 'Browse and search inventory', roles: ALL },
  'items:create': { label: 'Add new items', roles: ALL },
  'stock:adjust': { label: 'Adjust stock counts (+ / -)', roles: ALL },
  'guide:view': { label: 'Read the project guide', roles: ALL },
  'items:update': { label: 'Edit item details and prices', roles: ADMIN_ONLY },
  'items:delete': { label: 'Delete items', roles: ADMIN_ONLY },
  'categories:manage': { label: 'Create, edit and delete categories', roles: ADMIN_ONLY },
  'users:manage': { label: 'Manage user accounts', roles: ADMIN_ONLY },
}

export function roleCan(role, permission) {
  const rule = PERMISSIONS[permission]
  return !!rule && !!role && rule.roles.includes(role)
}
