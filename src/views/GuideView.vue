<script setup>
import { computed, ref } from 'vue'
import BaseIcon from '../components/common/BaseIcon.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import { PERMISSIONS, ROLES, ROLE_LABELS } from '../utils/permissions'
import { useAuth } from '../composables/useAuth'
import { useInventory } from '../composables/useInventory'
import { useConfirm } from '../composables/useConfirm'
import { useToast } from '../composables/useToast'

const { currentUser, can } = useAuth()
const { resetInventory } = useInventory()
const confirm = useConfirm()
const toast = useToast()

/* The permission table is generated from utils/permissions.js, so it can never go out of date. */
const matrix = computed(() =>
  Object.entries(PERMISSIONS).map(([key, rule]) => ({
    key,
    label: rule.label,
    admin: rule.roles.includes(ROLES.ADMIN),
    user: rule.roles.includes(ROLES.USER),
  })),
)

const concepts = [
  { topic: 'Form handling', where: 'composables/useForm.js · components/inventory/ItemForm.vue · UserForm.vue · LoginView.vue', note: 'v-model, validation rules, touched and dirty state, file upload, number and text inputs.' },
  { topic: 'Emitting events', where: 'ItemCard.vue · ItemTable.vue · ItemForm.vue · SearchBar.vue · BaseModal.vue', note: 'defineEmits with validators, v-model through update: events, children never change parent data directly.' },
  { topic: 'Parent and child state', where: 'InventoryView.vue ↔ ItemFilters.vue / ItemCard.vue · ItemEditorView.vue ↔ ItemForm.vue · App.vue → AppSidebar.vue', note: 'Props down, events up, several v-model:arguments, template ref plus defineExpose, provide/inject for layout state.' },
  { topic: 'Route configuration', where: 'router/index.js', note: 'Lazy loaded pages, nested routes, :id params as props, meta fields, beforeEach guard, redirect, 404, onBeforeRouteLeave.' },
  { topic: 'Composition API vs Options API', where: 'CategoriesView.vue and CategoryForm.vue (Options) · all other files (Composition)', note: 'Same features written both ways. See the comparison below.' },
  { topic: 'Mixins and composables', where: 'mixins/formatMixin.js · mixins/confirmMixin.js · composables/*.js', note: 'The mixins and their composable twins (useFormat, useConfirm) do the same job.' },
  { topic: 'Local storage', where: 'composables/useLocalStorage.js', note: 'A ref that saves itself. Used for items, categories, users, session, activity log and view preferences.' },
  { topic: 'CRUD', where: 'composables/useInventory.js · useUsers.js', note: 'Items, categories and users can all be created, read, updated and deleted.' },
  { topic: 'Role-based access', where: 'utils/permissions.js · router guard · v-if with can() · composables', note: 'Checked in four places so hiding a button is never the only protection.' },
]

const optionsCode = [
  'export default {',
  '  mixins: [formatMixin],',
  '  props: { item: Object },',
  '  emits: ["adjust"],',
  '  data() {',
  '    return { step: 1 }',
  '  },',
  '  computed: {',
  '    total() {',
  '      return this.item.quantity * this.item.price',
  '    },',
  '  },',
  '  methods: {',
  '    add() {',
  '      this.$emit("adjust", this.step)',
  '    },',
  '  },',
  '  mounted() {',
  '    console.log("ready")',
  '  },',
  '}',
].join('\n')

const compositionCode = [
  '<script setup>',
  'const props = defineProps({ item: Object })',
  'const emit = defineEmits(["adjust"])',
  '',
  'const step = ref(1)',
  'const total = computed(() => props.item.quantity * props.item.price)',
  'const { formatCurrency } = useFormat() // composable',
  '',
  'function add() {',
  '  emit("adjust", step.value)',
  '}',
  '',
  'onMounted(() => console.log("ready"))',
  '<\/script>',
].join('\n')

const comparison = [
  { aspect: 'State', options: 'data() returns an object', composition: 'ref() and reactive()' },
  { aspect: 'Derived values', options: 'computed: { }', composition: 'computed(() => ...)' },
  { aspect: 'Functions', options: 'methods: { }, used as this.method()', composition: 'plain functions' },
  { aspect: 'Lifecycle', options: 'created(), mounted()', composition: 'onMounted(), onUnmounted()' },
  { aspect: 'Reusing logic', options: 'mixins', composition: 'composables (useSomething)' },
  { aspect: 'Where the code lives', options: 'grouped by option type', composition: 'grouped by feature' },
]

const mixinPoints = [
  ['Mixin', 'formatMixin merges methods into the component. You call formatCurrency() but cannot tell where it came from without opening the mixin.'],
  ['Composable', 'const { formatCurrency } = useFormat() names the source, can take arguments and cannot clash with another name.'],
]

/* Admin only: put the demo inventory back the way it started. */
async function reset() {
  const ok = await confirm.ask({
    title: 'Reset demo inventory?',
    message: 'Items, categories and the activity log go back to the sample data. User accounts are kept.',
    confirmLabel: 'Reset data',
    danger: true,
  })
  if (!ok) return
  const result = resetInventory()
  result.ok ? toast.success('Demo inventory restored') : toast.error(result.error)
}

const roleText = computed(() => ROLE_LABELS[currentUser.value?.role] ?? '')
const tick = ref('Yes')
</script>

<template>
  <header class="page-header">
    <div>
      <h1>Project guide</h1>
      <p>A map of how this app uses each Vue concept, and what each role is allowed to do.</p>
    </div>
  </header>

  <div class="stack">
    <section class="panel" aria-labelledby="concepts-title">
      <div class="panel__head"><h2 id="concepts-title">Where each concept lives</h2></div>
      <div class="table-wrap">
        <table class="table table--stack">
          <thead><tr><th scope="col">Concept</th><th scope="col">Files</th><th scope="col">What to look for</th></tr></thead>
          <tbody>
            <tr v-for="row in concepts" :key="row.topic">
              <td class="cell-main"><strong>{{ row.topic }}</strong></td>
              <td data-label="Files" class="files">{{ row.where }}</td>
              <td data-label="Notes">{{ row.note }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel" aria-labelledby="api-title">
      <div class="panel__head"><h2 id="api-title">Options API and Composition API, side by side</h2></div>
      <div class="panel__body stack">
        <div class="code-pair">
          <figure>
            <figcaption>Options API</figcaption>
            <pre tabindex="0"><code>{{ optionsCode }}</code></pre>
          </figure>
          <figure>
            <figcaption>Composition API (script setup)</figcaption>
            <pre tabindex="0"><code>{{ compositionCode }}</code></pre>
          </figure>
        </div>
        <div class="table-wrap">
          <table class="table table--stack">
            <thead><tr><th scope="col">Need</th><th scope="col">Options API</th><th scope="col">Composition API</th></tr></thead>
            <tbody>
              <tr v-for="row in comparison" :key="row.aspect">
                <td class="cell-main"><strong>{{ row.aspect }}</strong></td>
                <td data-label="Options">{{ row.options }}</td>
                <td data-label="Composition">{{ row.composition }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <dl class="mix">
          <div v-for="[term, text] in mixinPoints" :key="term"><dt>{{ term }}</dt><dd>{{ text }}</dd></div>
        </dl>
      </div>
    </section>

    <section class="panel" aria-labelledby="access-title">
      <div class="panel__head">
        <h2 id="access-title">Who can do what</h2>
        <span class="muted">You are signed in as {{ roleText }}</span>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th scope="col">Action</th><th scope="col">Admin</th><th scope="col">User</th></tr></thead>
          <tbody>
            <tr v-for="row in matrix" :key="row.key">
              <td>{{ row.label }}</td>
              <td><span v-if="row.admin" class="yes"><BaseIcon name="check" :size="18" /><span class="visually-hidden">{{ tick }}</span></span><span v-else class="muted">No</span></td>
              <td><span v-if="row.user" class="yes"><BaseIcon name="check" :size="18" /><span class="visually-hidden">{{ tick }}</span></span><span v-else class="muted">No</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="can('users:manage')" class="panel panel__body reset" aria-labelledby="reset-title">
      <div>
        <h2 id="reset-title">Demo data</h2>
        <p class="muted">Everything is stored in this browser’s localStorage. Reset the sample inventory whenever you like.</p>
      </div>
      <button type="button" class="btn" @click="reset"><BaseIcon name="refresh" :size="18" /> Reset inventory</button>
    </section>
  </div>

  <ConfirmDialog v-bind="confirm.state" @confirm="confirm.accept" @cancel="confirm.cancel" />
</template>

<style scoped>
.files { font-size: 0.875rem; color: var(--ink-soft); overflow-wrap: anywhere; }
.code-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr)); gap: 1rem; }
figure { margin: 0; min-width: 0; }
figcaption { font-weight: 600; margin-bottom: 0.4rem; }
pre { margin: 0; padding: 1rem; background: var(--sidebar); color: #dbe5ee; border-radius: var(--r-md); overflow-x: auto; font-size: 0.85rem; line-height: 1.55; tab-size: 2; }
.mix { margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: 1rem; }
.mix dt { font-weight: 600; }
.mix dd { margin: 0.2rem 0 0; color: var(--ink-soft); }
.yes { color: var(--ok); display: inline-flex; }
.reset { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; }
</style>
