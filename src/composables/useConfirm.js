import { reactive } from 'vue'

/**
 * Promise-based confirm dialog state.
 *
 *   const confirm = useConfirm()
 *   if (await confirm.ask({ title: 'Delete item?', danger: true })) { ... }
 *
 *   <ConfirmDialog v-bind="confirm.state" @confirm="confirm.accept" @cancel="confirm.cancel" />
 *
 * The Options API twin of this composable is mixins/confirmMixin.js.
 */
export function useConfirm() {
  const defaults = { title: 'Are you sure?', message: '', confirmLabel: 'Confirm', danger: false }
  const state = reactive({ open: false, ...defaults })
  let resolver = null

  function settle(answer) {
    state.open = false
    resolver?.(answer)
    resolver = null
  }

  function ask(options = {}) {
    resolver?.(false)
    Object.assign(state, defaults, options, { open: true })
    return new Promise((resolve) => {
      resolver = resolve
    })
  }

  return { state, ask, accept: () => settle(true), cancel: () => settle(false) }
}
