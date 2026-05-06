import api from './index'

export async function getLivePrice(ticker) {
  if (!ticker) return null
  try {
    const res = await api.get(`/stock-price/${ticker}`)
    return res.data.price
  } catch {
    return null
  }
}

export async function getLivePrices(tickers) {
  const results = await Promise.allSettled(
    tickers.map(t => getLivePrice(t))
  )
  return Object.fromEntries(
    tickers.map((t, i) => [
      t,
      results[i].status === 'fulfilled' ? results[i].value : null,
    ])
  )
}
