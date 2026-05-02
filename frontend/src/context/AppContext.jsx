import { createContext, useContext, useEffect, useState } from 'react'
import { getUsers } from '../api/users'

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
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const completeOnboarding = (data) => {
    setOnboardingData(data)
    setOnboardedUserActive(true)
    setIsAuthenticated(true)
  }
  const logout = () => {
    setIsAuthenticated(false)
    setOnboardingData(null)
    setOnboardedUserActive(false)
    setCurrentUser(FALLBACK_USERS[0])
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

  useEffect(() => {
    getUsers()
      .then((res) => {
        const fetched = res.data
        if (Array.isArray(fetched) && fetched.length) {
          setUsers(fetched)
          setCurrentUser(fetched[0])
        }
      })
      .catch(() => {/* keep fallback */})
  }, [])

  return (
    <AppContext.Provider value={{ users, currentUser, onboardingData, onboardedUserActive, isAuthenticated, completeOnboarding, login, logout, switchToUser, switchToOnboardedUser }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
