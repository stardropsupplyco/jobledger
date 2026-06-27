export function formatMoney(amount) {
  const n = Number(amount) || 0
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function formatMoneyCompact(amount) {
  const n = Number(amount) || 0
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  if (abs >= 1000) {
    return `${sign}$${(abs / 1000).toFixed(1).replace(/\.0$/, '')}k`
  }
  return `${sign}$${abs.toFixed(0)}`
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
