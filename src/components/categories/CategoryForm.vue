<script>
import { iconUrl, ICON_NAMES } from '../../utils/images'

/**
 * OPTIONS API version of a form component.
 * Compare with components/inventory/ItemForm.vue (Composition API).
 *
 *   data()      -> reactive state          (ref / reactive)
 *   computed    -> derived values          (computed())
 *   methods     -> functions               (plain functions)
 *   watch       -> reactions               (watch())
 *   props/emits -> same as defineProps / defineEmits
 */
export default {
  name: 'CategoryForm',
  props: {
    category: { type: Object, default: null },
    takenNames: { type: Array, default: () => [] },
  },
  emits: ['save', 'cancel'],

  data() {
    return {
      form: this.makeForm(this.category),
      touched: { name: false },
      icons: ICON_NAMES,
    }
  },

  computed: {
    nameError() {
      const name = this.form.name.trim()
      if (!name) return 'Enter a category name'
      if (name.length < 2) return 'The name needs at least 2 characters'
      if (name.length > 30) return 'Keep the name under 30 characters'
      if (this.takenNames.includes(name.toLowerCase())) return 'A category with this name already exists'
      return ''
    },
    visibleNameError() {
      return this.touched.name ? this.nameError : ''
    },
    isEditing() {
      return !!this.category
    },
  },

  watch: {
    // Reload the form if the parent passes a different category.
    category(next) {
      this.form = this.makeForm(next)
      this.touched.name = false
    },
  },

  mounted() {
    this.$refs.nameInput?.focus()
  },

  methods: {
    iconUrl,
    makeForm(category) {
      return { name: category?.name ?? '', icon: category?.icon ?? 'electronics', color: category?.color ?? '#0d7a78' }
    },
    submit() {
      this.touched.name = true
      if (this.nameError) {
        this.$refs.nameInput?.focus()
        return
      }
      this.$emit('save', { ...this.form, name: this.form.name.trim() })
    },
  },
}
</script>

<template>
  <form class="stack" novalidate @submit.prevent="submit">
    <div class="field">
      <label for="c-name">Category name</label>
      <input id="c-name" ref="nameInput" v-model="form.name" class="input" autocomplete="off" :aria-invalid="!!visibleNameError" @blur="touched.name = true" />
      <p v-if="visibleNameError" class="error" role="alert">{{ visibleNameError }}</p>
    </div>

    <fieldset class="picker">
      <legend class="label">Illustration</legend>
      <div class="picker__grid">
        <label v-for="name in icons" :key="name" class="picker__option" :class="{ 'is-selected': form.icon === name }">
          <input v-model="form.icon" type="radio" name="icon" :value="name" class="visually-hidden" />
          <img :src="iconUrl(name)" :alt="name" />
          <span>{{ name }}</span>
        </label>
      </div>
    </fieldset>

    <div class="field">
      <label for="c-color">Colour tag</label>
      <input id="c-color" v-model="form.color" type="color" class="color" />
    </div>

    <div class="form-actions">
      <button type="button" class="btn" @click="$emit('cancel')">Cancel</button>
      <button type="submit" class="btn btn--primary">{{ isEditing ? 'Save changes' : 'Create category' }}</button>
    </div>
  </form>
</template>

<style scoped>
.picker { border: 0; padding: 0; margin: 0; }
.picker .label { font-weight: 550; font-size: 0.925rem; margin-bottom: 0.4rem; padding: 0; }
.picker__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr)); gap: 0.6rem; }
.picker__option { display: grid; gap: 0.25rem; border: 2px solid var(--line); border-radius: var(--r-md); padding: 0.3rem; cursor: pointer; text-align: center; font-size: 0.8rem; text-transform: capitalize; }
.picker__option img { border-radius: var(--r-sm); aspect-ratio: 4 / 3; object-fit: cover; width: 100%; }
.picker__option:hover { border-color: var(--line-strong); }
.picker__option.is-selected { border-color: var(--dock); background: var(--dock-tint); }
.picker__option:focus-within { box-shadow: var(--focus); }
.color { width: 4rem; height: 2.5rem; padding: 0.15rem; border: 1px solid var(--line-strong); border-radius: var(--r-md); background: var(--surface); cursor: pointer; }
.error { color: var(--alert); font-size: 0.875rem; }
</style>
