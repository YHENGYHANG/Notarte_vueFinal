import { formatCurrency, formatNumber, formatDate, timeAgo, formatCompactCurrency } from '../utils/format'
import { getStockStatus, STOCK_LABELS } from '../utils/stock'

// Composable twin of mixins/formatMixin.js
export function useFormat() {
  return {
    formatCurrency,
    formatCompactCurrency,
    formatNumber,
    formatDate,
    timeAgo,
    stockStatus: getStockStatus,
    stockLabel: (item) => STOCK_LABELS[getStockStatus(item)],
  }
}
