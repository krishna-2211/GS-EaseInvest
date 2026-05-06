import api from './index'

export const sendMessage = (userId, messages) =>
  api.post('/rebalance/chat', { user_id: userId, messages }).then(r => r.data)
