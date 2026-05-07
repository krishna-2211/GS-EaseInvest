import api from './index'

export const getMarketSummary = () =>
  api.get('/market/summary').then(r => r.data)
