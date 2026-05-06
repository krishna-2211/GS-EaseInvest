import api from './index'

export const register = (data) =>
  api.post('/auth/register', data).then(r => r.data)

export const loginWithEmail = (email, password) =>
  api.post('/auth/login', { email, password }).then(r => r.data)

export const getMe = () =>
  api.get('/auth/me').then(r => r.data)
