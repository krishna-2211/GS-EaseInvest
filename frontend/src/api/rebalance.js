import api from './index'

export const postRebalance = (userId, question) =>
  api.post('/rebalance', { user_id: userId, question })
