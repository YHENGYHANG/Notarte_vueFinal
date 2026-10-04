import { CURRENCY, LOCALE } from '../config'

const money = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY })
const compactMoney = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  notation: 'compact',
  maximumFractionDigits: 1,
})
const integer = new Intl.NumberFormat(LOCALE)

export const formatCurrency = (value) => money.format(Number(value) || 0)
export const formatCompactCurrency = (value) => compactMoney.format(Number(value) || 0)
export const formatNumber = (value) => integer.format(Number(value) || 0)

export function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(LOCALE, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function timeAgo(iso) {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} d ago`
  return formatDate(iso)
}
