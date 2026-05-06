import api from './index'

export const getAlert = (userId) =>
  api.get(`/alerts/${userId}`).then(r => r.data)

export const dismissAlert = (userId) =>
  api.post(`/alerts/${userId}/dismiss`).then(r => r.data)

export const runMonitorNow = () =>
  api.post('/alerts/run-now').then(r => r.data)
