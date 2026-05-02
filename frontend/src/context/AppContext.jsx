import { createContext, useContext, useState } from 'react'

export const MOCK_USERS = [
  { id: 1, name: 'Pralay', initials: 'PR', style: 'Careful', goal: 'Buy a house' },
  { id: 2, name: 'Krishna', initials: 'KR', style: 'YOLO',    goal: 'Early retirement' },
]

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [currentUserId, setCurrentUserId] = useState(MOCK_USERS[0].id)

  const switchUser = (userId) => setCurrentUserId(Number(userId))

  return (
    <AppContext.Provider value={{ currentUserId, users: MOCK_USERS, switchUser }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
