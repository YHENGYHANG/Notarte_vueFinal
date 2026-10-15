<script setup>
import { computed, ref } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import ItemForm from '../components/inventory/ItemForm.vue'
import BaseIcon from '../components/common/BaseIcon.vue'
import { useInventory } from '../composables/useInventory'
import { useToast } from '../composables/useToast'

// One page for two routes. The router passes `mode` (and `id` when editing) as props.
const props = defineProps({
  mode: { type: String, default: 'create' }, // 'create' | 'edit'
  id: { type: String, default: '' },
})

const router = useRouter()
const toast = useToast()
const { items, categories, getItem, createItem, updateItem } = useInventory()

const isEdit = computed(() => props.mode === 'edit')
const item = computed(() => (isEdit.value ? getItem(props.id) : null))
// SKUs that belong to *other* items, so editing keeps your own SKU valid.
const takenSkus = computed(() => items.value.filter((i) => i.id !== props.id).map((i) => i.sku.toUpperCase()))

const formRef = ref(null) // template ref to the child, used to call its exposed methods
const dirty = ref(false) // kept in sync by the child's `dirty` event
const saving = ref(false)

function onSave(payload, { another }) {
  saving.value = true
  const result = isEdit.value ? updateItem(props.id, payload) : createItem(payload)
  saving.value = false

  if (!result.ok) {
    toast.error(result.error)
    return
  }
  dirty.value = false // so the leave-guard below lets us go
  formRef.value?.clearDraft?.()
  toast.success(isEdit.value ? `Saved ${payload.name}` : `Added ${payload.name}`)

  if (another) {
    formRef.value.reset() // call the child's exposed method
    return
  }
  router.push({ name: 'item-detail', params: { id: result.item.id } })
}

const goBack = () => router.push({ name: 'inventory' })

// Route guard inside a component: warn before leaving a half-filled form.
onBeforeRouteLeave(() => {
  if (dirty.value) return window.confirm('You have unsaved changes. Leave this page anyway?')
})
</script>

<template>
  <RouterLink :to="{ name: 'inventory' }" class="back-link"><BaseIcon name="arrow-left" :size="16" /> Back to inventory</RouterLink>

  <header class="page-header">
    <div>
      <h1>{{ isEdit ? 'Edit item' : 'Add item' }}</h1>
      <p>{{ isEdit ? 'Update the details, price or photo.' : 'Fill in the details. Stock counts can be changed later from the inventory.' }}</p>
    </div>
  </header>

  <div v-if="isEdit && !item" class="panel empty">
    <h2>This item no longer exists</h2>
    <p>It may have been deleted.</p>
    <RouterLink :to="{ name: 'inventory' }" class="btn">Back to inventory</RouterLink>
  </div>

  <div v-else class="panel panel__body">
    <ItemForm
      ref="formRef"
      :initial="item"
      :categories="categories"
      :existing-skus="takenSkus"
      :submit-label="isEdit ? 'Save changes' : 'Add item'"
      :allow-another="!isEdit"
      :busy="saving"
      @save="onSave"
      @cancel="goBack"
      @dirty="dirty = $event"
    />
  </div>
</template>
