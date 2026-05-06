const KEY = 'gs_token'

export const saveToken  = (t) => localStorage.setItem(KEY, t)
export const getToken   = ()  => localStorage.getItem(KEY)
export const removeToken = () => localStorage.removeItem(KEY)

export function isTokenValid() {
  try {
    const token = getToken()
    if (!token) return false
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}
