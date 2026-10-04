import { reactive, computed, watch, ref } from 'vue'

/* ---------- validation rules ----------
   A rule is a function (value, allValues) => 'error message' or ''.
   Rules run in order and the first message wins. */

const isEmpty = (v) => v === '' || v === null || v === undefined || (typeof v === 'string' && !v.trim())

export const required = (message = 'This field is required') => (v) => (isEmpty(v) ? message : '')
export const minLength = (n, message) => (v) =>
  String(v ?? '').trim().length < n ? message ?? `Use at least ${n} characters` : ''
export const maxLength = (n, message) => (v) =>
  String(v ?? '').trim().length > n ? message ?? `Use ${n} characters or fewer` : ''
export const isNumber = (message = 'Enter a number') => (v) =>
  isEmpty(v) || Number.isNaN(Number(v)) ? message : ''
export const isInteger = (message = 'Enter a whole number') => (v) =>
  Number.isInteger(Number(v)) ? '' : message
export const minValue = (n, message) => (v) => (Number(v) < n ? message ?? `Must be ${n} or more` : '')
export const pattern = (regex, message) => (v) => (regex.test(String(v ?? '')) ? '' : message)
export const matches = (fn, message) => (v, all) => (fn(v, all) ? '' : message)

/**
 * Small form helper: values + validation + touched/dirty tracking.
 *
 *   const form = useForm({ name: '' }, { name: [required('Enter a name')] })
 *   <input v-model="form.values.name" @blur="form.touch('name')" />
 *   <p v-if="form.errorFor('name')">{{ form.errorFor('name') }}</p>
 */
export function useForm(initialValues, rules = {}) {
  const values = reactive({ ...initialValues })
  const errors = reactive({})
  const touched = reactive({})
  const snapshot = ref(JSON.stringify(initialValues))

  function validateField(name) {
    for (const rule of rules[name] ?? []) {
      const message = rule(values[name], values)
      if (message) {
        errors[name] = message
        return false
      }
    }
    delete errors[name]
    return true
  }

  function validate() {
    let valid = true
    for (const name of Object.keys(rules)) {
      touched[name] = true
      if (!validateField(name)) valid = false
    }
    return valid
  }

  function touch(name) {
    touched[name] = true
    validateField(name)
  }

  // Once a field has been touched, re-validate it on every change.
  watch(
    values,
    () => {
      for (const name of Object.keys(touched)) validateField(name)
    },
    { deep: true },
  )

  function reset(newValues = initialValues) {
    for (const key of Object.keys(errors)) delete errors[key]
    for (const key of Object.keys(touched)) delete touched[key]
    Object.assign(values, newValues)
    snapshot.value = JSON.stringify(newValues)
  }

  const errorFor = (name) => (touched[name] ? errors[name] ?? '' : '')
  const isDirty = computed(() => JSON.stringify(values) !== snapshot.value)
  const firstInvalid = () => Object.keys(rules).find((name) => errors[name])

  return { values, errors, touched, validate, validateField, touch, reset, errorFor, isDirty, firstInvalid }
}
