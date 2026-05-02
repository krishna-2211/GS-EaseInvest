export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export const formatPct = (n) => `${n}%`

export const salaryLabel = (n) => `That's about ${n} months of your salary`

export const healthColor = {
  green:  { bg: '#e8f5ee', text: '#0f6e56', border: '#9fe1cb' },
  yellow: { bg: '#fef3c7', text: '#b45309', border: '#fac775' },
  red:    { bg: '#fdecea', text: '#a32d2d', border: '#f09595' },
  blue:   { bg: '#e8f4fb', text: '#00355f', border: '#acd4f1' },
}