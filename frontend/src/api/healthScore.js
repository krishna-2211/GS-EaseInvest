import api from './index'

export const getHealthScore = (userId) => api.get(`/health-score/${userId}`)
