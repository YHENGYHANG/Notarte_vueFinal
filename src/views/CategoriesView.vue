<script>
import BaseModal from '../components/common/BaseModal.vue'
import BaseIcon from '../components/common/BaseIcon.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import CategoryForm from '../components/categories/CategoryForm.vue'
import formatMixin from '../mixins/formatMixin'
import confirmMixin from '../mixins/confirmMixin'
import { useInventory } from '../composables/useInventory'
import { useToast } from '../composables/useToast'
import { iconUrl } from '../utils/images'

/**
 * OPTIONS API page, written the "classic" Vue 2/3 way:
 *  - mixins:   formatMixin and confirmMixin add methods and data to `this`
 *  - setup():  the bridge that lets an Options component use composables
 *  - data / computed / methods: the usual options
 * Admin only (see `permission: 'categories:manage'` in router/index.js).
 */
export default {
  name: 'CategoriesView',
  components: { BaseModal, BaseIcon, ConfirmDialog, CategoryForm },
  mixins: [formatMixin, confirmMixin],

  setup() {
    // Refs and functions returned from setup() become available on `this`.
    const inventory = useInventory()
    const toast = useToast()
    return {
      categories: inventory.categories,
      items: inventory.items,
      createCategory: inventory.createCategory,
      updateCategory: inventory.updateCategory,
      deleteCategory: inventory.deleteCategory,
      toast,
    }
  },

  data() {
    return {
      modalOpen: false,
      editing: null, // the category being edited, or null when creating
    }
  },

  computed: {
    rows() {
      return this.categories.map((c) => ({
        ...c,
        count: this.items.filter((i) => i.categoryId === c.id).length,
        units: this.items.filter((i) => i.categoryId === c.id).reduce((sum, i) => sum + i.quantity, 0),
      }))
    },
    // Names already taken by *other* categories (lower-cased for comparison).
    takenNames() {
      return this.categories.filter((c) => c.id !== this.editing?.id).map((c) => c.name.toLowerCase())
    },
  },

  methods: {
    iconUrl,
    openCreate() {
      this.editing = null
      this.modalOpen = true
    },
    openEdit(category) {
      this.editing = category
      this.modalOpen = true
    },
    async onSave(data) {
      const confirmed = await this.askConfirm({
        title: this.editing ? `Update ${data.name}?` : `Add ${data.name}?`,
        message: this.editing
          ? 'The category details will be updated for the inventory.'
          : 'This category will be added and can be used for new inventory items.',
        confirmLabel: this.editing ? 'Update category' : 'Add category',
      })
      if (!confirmed) return

      const result = this.editing ? this.updateCategory(this.editing.id, data) : this.createCategory(data)
      if (!result.ok) {
        this.toast.error(result.error)
        return
      }
      this.toast.success(this.editing ? `Saved ${data.name}` : `Created ${data.name}`)
      this.modalOpen = false
    },
    async onDelete(category) {
      const confirmed = await this.askConfirm({
        title: `Delete ${category.name}?`,
        message: 'Categories that still contain items cannot be deleted.',
        confirmLabel: 'Delete category',
        danger: true,
      })
      if (!confirmed) return
      const result = this.deleteCategory(category.id)
      result.ok ? this.toast.success(`Deleted ${category.name}`) : this.toast.error(result.error)
    },
  },
}
</script>

<template>
  <header class="page-header">
    <div>
      <h1>Categories</h1>
      <p>Group items and choose the illustration shown when an item has no photo.</p>
    </div>
    <div class="page-header__actions">
      <button type="button" class="btn btn--primary" @click="openCreate"><BaseIcon name="plus" :size="18" /> New category</button>
    </div>
  </header>

  <div class="panel table-wrap">
    <table class="table table--stack">
      <thead>
        <tr>
          <th scope="col">Category</th>
          <th scope="col" class="num">Products</th>
          <th scope="col" class="num">Units</th>
          <th scope="col"><span class="visually-hidden">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td class="cell-main">
            <div class="who">
              <img :src="iconUrl(row.icon)" :alt="row.icon" class="thumb" />
              <span class="chip name" :style="{ '--chip': row.color }"><span class="chip__dot" />{{ row.name }}</span>
            </div>
          </td>
          <td class="num" data-label="Products">{{ formatNumber(row.count) }}</td>
          <td class="num" data-label="Units">{{ formatNumber(row.units) }}</td>
          <td class="actions">
            <button type="button" class="icon-btn" :aria-label="`Edit ${row.name}`" @click="openEdit(row)"><BaseIcon name="edit" :size="18" /></button>
            <button type="button" class="icon-btn icon-btn--danger" :aria-label="`Delete ${row.name}`" @click="onDelete(row)"><BaseIcon name="trash" :size="18" /></button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!rows.length" class="empty"><h2>No categories</h2><p>Create a category before adding items.</p></div>
  </div>

  <BaseModal v-model="modalOpen" :title="editing ? 'Edit category' : 'New category'">
    <CategoryForm v-if="modalOpen" :category="editing" :taken-names="takenNames" @save="onSave" @cancel="modalOpen = false" />
  </BaseModal>

  <ConfirmDialog v-bind="confirmState" @confirm="acceptConfirm" @cancel="cancelConfirm" />
</template>

<style scoped>
.who { display: flex; align-items: center; gap: 0.75rem; }
.thumb { width: 3.2rem; height: 2.4rem; object-fit: cover; border-radius: var(--r-sm); flex: none; }
.name { font-weight: 600; color: var(--ink); font-size: 1rem; }
</style>
