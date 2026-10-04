import { createRouter, createWebHistory, RouterView } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { APP_NAME } from '../config'

/**
 * ROUTE CONFIGURATION
 * - lazy loading:  component: () => import(...) splits each page into its own chunk
 * - nested routes: /inventory has children rendered inside its <RouterView/>
 * - params:        /inventory/:id, passed to the page as a prop (props: true)
 * - meta:          title, requiresAuth, guestOnly, permission (read by the guard below)
 * - redirects and a catch-all 404 route
 */
const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: 'Sign in', guestOnly: true, layout: 'blank' },
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { title: 'Dashboard', requiresAuth: true, permission: 'dashboard:view' },
  },
  {
    path: '/inventory',
    component: RouterView,
    meta: { requiresAuth: true, permission: 'items:view' },
    children: [
      {
        path: '',
        name: 'inventory',
        component: () => import('../views/InventoryView.vue'),
        meta: { title: 'Inventory' },
      },
      {
        path: 'new',
        name: 'item-new',
        component: () => import('../views/ItemEditorView.vue'),
        props: { mode: 'create' }, // static props
        meta: { title: 'Add item', permission: 'items:create' },
      },
      {
        path: ':id',
        name: 'item-detail',
        component: () => import('../views/ItemDetailView.vue'),
        props: true, // :id becomes the `id` prop
        meta: { title: 'Item details' },
      },
      {
        path: ':id/edit',
        name: 'item-edit',
        component: () => import('../views/ItemEditorView.vue'),
        props: (route) => ({ mode: 'edit', id: route.params.id }), // computed props
        meta: { title: 'Edit item', permission: 'items:update' },
      },
    ],
  },
  {
    path: '/categories',
    name: 'categories',
    component: () => import('../views/CategoriesView.vue'),
    meta: { title: 'Categories', requiresAuth: true, permission: 'categories:manage' },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../views/UsersView.vue'),
    meta: { title: 'Users', requiresAuth: true, permission: 'users:manage' },
  },
  {
    path: '/insights',
    name: 'insights',
    component: () => import('../views/OperationsView.vue'),
    meta: { title: 'Insights', requiresAuth: true, permission: 'guide:view' },
  },
  {
    path: '/guide',
    redirect: { name: 'insights' },
    meta: { requiresAuth: true, permission: 'guide:view' },
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('../views/ForbiddenView.vue'),
    meta: { title: 'Access denied', requiresAuth: true },
  },
  { path: '/items', redirect: '/inventory' },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: 'Page not found' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Navigation guard: runs before every route change.
router.beforeEach((to) => {
  const { isAuthenticated, can } = useAuth()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && isAuthenticated.value) {
    return { name: 'dashboard' }
  }
  // Check every matched record, so a parent's permission also protects its children.
  const needed = to.matched.map((record) => record.meta.permission).filter(Boolean)
  if (needed.some((permission) => !can(permission))) {
    return { name: 'forbidden', query: { from: to.fullPath } }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} – ${APP_NAME}` : APP_NAME
})

export default router
