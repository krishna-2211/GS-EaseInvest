import api from './index'

export const getPortfolio = (userId) => api.get(`/portfolio/${userId}`)
