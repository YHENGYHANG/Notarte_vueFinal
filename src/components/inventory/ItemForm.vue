<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import BaseIcon from '../common/BaseIcon.vue'
import { useForm, required, minLength, maxLength, isNumber, isInteger, minValue, pattern, matches } from '../../composables/useForm'
import { iconUrl, fileToResizedDataUrl } from '../../utils/images'

/**
 * FORM HANDLING (Composition API)
 * - useForm() holds the values, the validation rules and the touched/dirty state
 * - v-model binds inputs, @blur marks a field as touched, errors show after that
 * - nothing is saved here: on a valid submit the form emits `save` and the parent decides
 *
 * EVENTS OUT:  save(payload, { another }) · cancel · dirty(boolean)
 * EXPOSED:     reset() and focusFirst(), so a parent holding a template ref can call them
 */
const props = defineProps({
  initial: { type: Object, default: null }, // an existing item when editing
  categories: { type: Array, required: true },
  existingSkus: { type: Array, default: () => [] }, // SKUs already taken by other items
  submitLabel: { type: String, default: 'Save item' },
  allowAnother: Boolean,
  busy: Boolean,
})
const emit = defineEmits(['save', 'cancel', 'dirty'])

const blank = () => ({
  name: '', sku: '', categoryId: '', quantity: 0, minStock: 5, price: 0,
  location: '', supplier: '', description: '', image: '',
})
const fromItem = (item) => ({ ...blank(), ...(item ?? {}), image: item?.image ?? '' })

const skuIsFree = (value) => !props.existingSkus.includes(String(value).trim().toUpperCase())

const rules = {
  name: [required('Enter an item name'), minLength(2, 'The name needs at least 2 characters'), maxLength(80)],
  sku: [
    required('Enter a SKU'),
    pattern(/^[A-Za-z0-9-]{3,20}$/, 'Use 3 to 20 letters, numbers or dashes'),
    matches(skuIsFree, 'Another item already uses this SKU'),
  ],
  categoryId: [required('Choose a category')],
  quantity: [required('Enter the count on hand'), isInteger(), minValue(0, 'Stock cannot be negative')],
  minStock: [required('Enter a minimum level'), isInteger(), minValue(0, 'Minimum cannot be negative')],
  price: [required('Enter a price'), isNumber('Enter a price like 249.50'), minValue(0, 'Price cannot be negative')],
  location: [maxLength(30)],
  supplier: [maxLength(60)],
  description: [maxLength(300, 'Keep the description under 300 characters')],
}

const form = useForm(fromItem(props.initial), rules)
const { values } = form
// Keep a draft for new items so refreshes or accidental navigation do not wipe typed fields.
const draftKey = 'ims:item-create-draft:v1'
if (!props.initial) {
  try {
    const savedDraft = localStorage.getItem(draftKey)
    if (savedDraft) form.reset({ ...blank(), ...JSON.parse(savedDraft) })
  } catch { /* Ignore invalid or unavailable browser storage. */ }
}
watch(values, (draft) => {
  if (props.initial) return
  try { localStorage.setItem(draftKey, JSON.stringify(draft)) } catch { /* Storage may be full or disabled. */ }
}, { deep: true })
function clearDraft() {
  try { localStorage.removeItem(draftKey) } catch { /* Storage may be disabled. */ }
}

// Start over when the parent hands us a different item (for example, route param change).
watch(() => props.initial, (item) => form.reset(fromItem(item)))
watch(form.isDirty, (dirty) => emit('dirty', dirty))

/* ---------- photo upload ---------- */
const fileInput = ref(null)
const imageError = ref('')
const category = computed(() => props.categories.find((c) => c.id === values.categoryId))
const preview = computed(() => values.image || iconUrl(category.value?.icon))

async function onFile(event) {
  const file = event.target.files?.[0]
  event.target.value = '' // lets the user pick the same file again later
  if (!file) return
  imageError.value = ''
  try {
    values.image = await fileToResizedDataUrl(file)
  } catch (error) {
    imageError.value = error.message
  }
}

/* ---------- SKU helper ---------- */
function suggestSku() {
  const prefix = (category.value?.name ?? 'ITM').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X')
  let candidate
  do {
    candidate = `${prefix}-${String(Math.floor(Math.random() * 9000) + 1000)}`
  } while (!skuIsFree(candidate))
  values.sku = candidate
  form.touch('sku')
}

/* ---------- submit ---------- */
const formEl = ref(null)

function focusFirst() {
  formEl.value?.querySelector('input, select, textarea')?.focus()
}

async function submit(another = false) {
  if (!form.validate()) {
    await nextTick()
    const name = form.firstInvalid()
    formEl.value?.querySelector(`[name="${name}"]`)?.focus()
    return
  }
  emit(
    'save',
    {
      name: values.name.trim(),
      sku: values.sku.trim().toUpperCase(),
      categoryId: values.categoryId,
      quantity: Number(values.quantity),
      minStock: Number(values.minStock),
      price: Number(values.price),
      location: values.location.trim(),
      supplier: values.supplier.trim(),
      description: values.description.trim(),
      image: values.image || null,
    },
    { another },
  )
}

function reset() {
  clearDraft()
  form.reset(fromItem(null))
  imageError.value = ''
  focusFirst()
}

defineExpose({ reset, focusFirst, clearDraft })

const invalid = (name) => !!form.errorFor(name)
</script>

<template>
  <form ref="formEl" class="item-form" novalidate @submit.prevent="submit(false)">
    <div class="item-form__layout">
      <div class="photo">
        <p class="label">Photo</p>
        <img :src="preview" :alt="values.image ? 'Uploaded photo preview' : 'Category illustration'" class="photo__img" />
        <p class="hint">{{ values.image ? 'Your photo is shown on the item card.' : 'Without a photo, the category illustration is used.' }}</p>
        <div class="photo__actions">
          <input ref="fileInput" type="file" accept="image/*" class="visually-hidden" tabindex="-1" @change="onFile" />
          <button type="button" class="btn btn--sm" @click="fileInput.click()"><BaseIcon name="upload" :size="16" /> {{ values.image ? 'Replace' : 'Upload photo' }}</button>
          <button v-if="values.image" type="button" class="btn btn--sm btn--ghost" @click="values.image = ''">Remove</button>
        </div>
        <p v-if="imageError" class="error" role="alert"><BaseIcon name="alert" :size="16" /> {{ imageError }}</p>
      </div>

      <div class="form-grid">
        <div class="field field--wide">
          <label for="f-name">Item name</label>
          <input id="f-name" v-model="values.name" name="name" class="input" autocomplete="off" :aria-invalid="invalid('name')" aria-describedby="e-name" @blur="form.touch('name')" />
          <p v-if="form.errorFor('name')" id="e-name" class="error" role="alert">{{ form.errorFor('name') }}</p>
        </div>

        <div class="field">
          <label for="f-category">Category</label>
          <select id="f-category" v-model="values.categoryId" name="categoryId" class="select" :aria-invalid="invalid('categoryId')" @blur="form.touch('categoryId')">
            <option value="" disabled>Choose a category</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <p v-if="form.errorFor('categoryId')" class="error" role="alert">{{ form.errorFor('categoryId') }}</p>
        </div>

        <div class="field">
          <label for="f-sku">SKU</label>
          <div class="input-group">
            <input id="f-sku" v-model="values.sku" name="sku" class="input" autocomplete="off" :aria-invalid="invalid('sku')" @blur="form.touch('sku')" />
            <button type="button" class="btn" title="Suggest a SKU from the category" @click="suggestSku"><BaseIcon name="refresh" :size="16" /> Suggest</button>
          </div>
          <p v-if="form.errorFor('sku')" class="error" role="alert">{{ form.errorFor('sku') }}</p>
          <p v-else class="hint">Letters, numbers and dashes, such as LAP-0012.</p>
        </div>

        <div class="field">
          <label for="f-qty">Units on hand</label>
          <input id="f-qty" v-model.number="values.quantity" name="quantity" type="number" min="0" step="1" inputmode="numeric" class="input" :aria-invalid="invalid('quantity')" @blur="form.touch('quantity')" />
          <p v-if="form.errorFor('quantity')" class="error" role="alert">{{ form.errorFor('quantity') }}</p>
        </div>

        <div class="field">
          <label for="f-min">Restock level</label>
          <input id="f-min" v-model.number="values.minStock" name="minStock" type="number" min="0" step="1" inputmode="numeric" class="input" :aria-invalid="invalid('minStock')" @blur="form.touch('minStock')" />
          <p v-if="form.errorFor('minStock')" class="error" role="alert">{{ form.errorFor('minStock') }}</p>
          <p v-else class="hint">The item is flagged as low at or below this count.</p>
        </div>

        <div class="field">
          <label for="f-price">Unit price</label>
          <input id="f-price" v-model.number="values.price" name="price" type="number" min="0" step="0.01" inputmode="decimal" class="input" :aria-invalid="invalid('price')" @blur="form.touch('price')" />
          <p v-if="form.errorFor('price')" class="error" role="alert">{{ form.errorFor('price') }}</p>
        </div>

        <div class="field">
          <label for="f-loc">Bin location</label>
          <input id="f-loc" v-model="values.location" name="location" class="input" placeholder="A1-03" :aria-invalid="invalid('location')" @blur="form.touch('location')" />
          <p v-if="form.errorFor('location')" class="error" role="alert">{{ form.errorFor('location') }}</p>
        </div>

        <div class="field">
          <label for="f-sup">Supplier</label>
          <input id="f-sup" v-model="values.supplier" name="supplier" class="input" :aria-invalid="invalid('supplier')" @blur="form.touch('supplier')" />
          <p v-if="form.errorFor('supplier')" class="error" role="alert">{{ form.errorFor('supplier') }}</p>
        </div>

        <div class="field field--wide">
          <label for="f-desc">Description</label>
          <textarea id="f-desc" v-model="values.description" name="description" class="textarea" :aria-invalid="invalid('description')" @blur="form.touch('description')" />
          <p v-if="form.errorFor('description')" class="error" role="alert">{{ form.errorFor('description') }}</p>
          <p v-else class="hint">{{ values.description.length }} / 300</p>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn" @click="emit('cancel')">Cancel</button>
      <button v-if="allowAnother" type="button" class="btn" :disabled="busy" @click="submit(true)">Save and add another</button>
      <button type="submit" class="btn btn--primary" :disabled="busy">{{ submitLabel }}</button>
    </div>
  </form>
</template>

<style scoped>
.item-form__layout { display: grid; grid-template-columns: minmax(11rem, 15rem) minmax(0, 1fr); gap: clamp(1rem, 3vw, 2rem); align-items: start; }
.photo { display: grid; gap: 0.6rem; }
.photo .label { font-weight: 550; font-size: 0.925rem; }
.photo__img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: var(--r-md); border: 1px solid var(--line); background: var(--surface-2); }
.photo__actions { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.hint { color: var(--ink-mute); font-size: 0.85rem; }
.error { color: var(--alert); font-size: 0.875rem; display: flex; gap: 0.35rem; align-items: center; }
@media (max-width: 52em) { .item-form__layout { grid-template-columns: 1fr; } .photo { max-width: 20rem; } }
</style>
