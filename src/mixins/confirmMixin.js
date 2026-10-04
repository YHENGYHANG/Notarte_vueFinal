/**
 * MIXIN (Options API): confirm-dialog state and methods.
 * A mixin can add data, computed, methods and lifecycle hooks to any component.
 *
 * Downsides that led Vue to promote composables instead:
 *  - names can collide silently (two mixins both defining `open`)
 *  - it is hard to see where `this.confirmState` comes from
 *  - a mixin cannot take arguments
 *
 * Composition API replacement: composables/useConfirm.js
 */
export default {
  data() {
    return {
      confirmState: { open: false, title: '', message: '', confirmLabel: 'Confirm', danger: false },
      confirmResolver: null,
    }
  },
  methods: {
    askConfirm(options = {}) {
      this.confirmResolver?.(false)
      this.confirmState = {
        title: 'Are you sure?',
        message: '',
        confirmLabel: 'Confirm',
        danger: false,
        ...options,
        open: true,
      }
      return new Promise((resolve) => {
        this.confirmResolver = resolve
      })
    },
    acceptConfirm() {
      this.settleConfirm(true)
    },
    cancelConfirm() {
      this.settleConfirm(false)
    },
    settleConfirm(answer) {
      this.confirmState.open = false
      this.confirmResolver?.(answer)
      this.confirmResolver = null
    },
  },
}
