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
    <AppContext.Provider value={{ users, currentUser, setCurrentUser }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
