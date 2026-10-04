export function getStockStatus(item) {
  if (item.quantity <= 0) return 'out'
  if (item.quantity <= item.minStock) return 'low'
  return 'ok'
}

export const STOCK_LABELS = {
  out: 'Out of stock',
  low: 'Low stock',
  ok: 'In stock',
}

// How many units a quick "restock" should add: enough to reach twice the minimum.
export function restockAmount(item) {
  return Math.max(item.minStock * 2 - item.quantity, 1)
}
