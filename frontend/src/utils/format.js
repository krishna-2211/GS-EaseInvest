export const formatCurrency = (value) =>
  `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

export const formatPct = (value) =>
  `${Number(value).toFixed(1)}%`

export const healthColor = (score) => {
  if (score >= 80) return 'green'
  if (score >= 60) return 'yellow'
  return 'red'
}
