import { createContext, useContext, useEffect, useState } from 'react'
import { getUsers } from '../api/users'
import { loginWithEmail as authLogin, register, getMe } from '../api/auth'
import { saveToken, getToken, removeToken, isTokenValid } from '../utils/token'

const FALLBACK_USERS = [
  { user_id: 'user_001', name: 'Pralay', style: 'YOLO',    goal: 'Early retirement' },
  { user_id: 'user_002', name: 'Krishna', style: 'Careful', goal: 'Buy a car' },
]

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [users, setUsers] = useState(FALLBACK_USERS)
  const [currentUser, setCurrentUser] = useState(FALLBACK_USERS[0])
  const [onboardingData, setOnboardingData] = useState(null)
  const [onboardedUserActive, setOnboardedUserActive] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(isTokenValid)

  // Restore session from stored token on mount
  useEffect(() => {
    if (isTokenValid()) {
      getMe()
        .then((user) => {
          setCurrentUser(user)
          setIsAuthenticated(true)
        })
        .catch(() => {
          removeToken()
          setIsAuthenticated(false)
        })
    } else {
      removeToken()
      setIsAuthenticated(false)
    }
  }, [])

  // Fetch demo users for the user-switcher
  useEffect(() => {
    getUsers()
      .then((res) => {
        const fetched = res.data
        if (Array.isArray(fetched) && fetched.length) {
          setUsers(fetched)
          if (!isTokenValid()) setCurrentUser(fetched[0])
        }
      })
      .catch(() => {/* keep fallback */})
  }, [])

  const completeOnboarding = async (data) => {
    console.log('Registering with data:', data)
    console.log('Sending to register:', JSON.stringify(data, null, 2))
    const response = await register(data)   // throws on error — caller handles it
    saveToken(response.access_token)
    setCurrentUser(response.user)
    setIsAuthenticated(true)
  }

  const loginWithEmail = async (email, password) => {
    try {
      const response = await authLogin(email, password)
      saveToken(response.access_token)
      setCurrentUser(response.user)
      setIsAuthenticated(true)
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.detail || 'Wrong email or password',
      }
    }
  }

  const logout = () => {
    removeToken()
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  const login = (userId) => {
    const user = users.find(u => u.user_id === userId) ?? FALLBACK_USERS.find(u => u.user_id === userId)
    if (user) switchToUser(user)
    setIsAuthenticated(true)
  }

  const switchToOnboardedUser = () => setOnboardedUserActive(true)

  const switchToUser = (user) => {
    setCurrentUser(user)
    setOnboardedUserActive(false)
  }

  const activeUser = onboardedUserActive && onboardingData
    ? {
        user_id: null,
        name: onboardingData.name,
        style: onboardingData.style,
        goal: onboardingData.goal,
      }
    : currentUser

  return (
    <AppContext.Provider value={{
      users,
      currentUser,
      setCurrentUser,
      activeUser,
      onboardingData,
      onboardedUserActive,
      isAuthenticated,
      completeOnboarding,
      loginWithEmail,
      login,
      logout,
      switchToUser,
      switchToOnboardedUser,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
