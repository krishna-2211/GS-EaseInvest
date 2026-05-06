import api from './index'

export const getStocksList = () => api.get('/stocks/list').then(r => r.data)
export const getFundsList  = () => api.get('/funds/list').then(r => r.data)

export const simulate = (userId, ticker, name, amount, type) =>
  api.post('/simulate', { user_id: userId, ticker, name, amount, type }).then(r => r.data)
