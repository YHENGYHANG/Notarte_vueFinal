import { formatCurrency, formatNumber, formatDate, timeAgo } from '../utils/format'
import { getStockStatus, STOCK_LABELS } from '../utils/stock'

/**
 * MIXIN (Options API): shares formatting helpers between components.
 *
 *   export default { mixins: [formatMixin] }
 *   // then in the template: {{ formatCurrency(item.price) }}
 *
 * The Composition API replacement is composables/useFormat.js.
 */
export default {
  methods: {
    formatCurrency,
    formatNumber,
    formatDate,
    timeAgo,
    stockStatus: getStockStatus,
    stockLabel(item) {
      return STOCK_LABELS[getStockStatus(item)]
    },
  },
}
