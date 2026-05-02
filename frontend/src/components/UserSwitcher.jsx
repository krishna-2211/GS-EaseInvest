import { useApp } from '../context/AppContext'

export default function UserSwitcher() {
  const { users, currentUser, onboardingData, onboardedUserActive, switchToUser, switchToOnboardedUser } = useApp()

  const activeStyle   = { backgroundColor: '#001E62', color: '#fff' }
  const inactiveStyle = { backgroundColor: '#f4f8fd', color: '#001E62' }
  const activeBadge   = { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }
  const inactiveBadge = { backgroundColor: '#acd4f1', color: '#001E62' }

  return (
    <div className="flex gap-2">
      {onboardingData && (
        <button
          onClick={switchToOnboardedUser}
          className="flex items-center gap-2 rounded-xl px-3 py-2 transition-colors text-left"
          style={onboardedUserActive ? activeStyle : inactiveStyle}
        >
          <div className="leading-tight">
            <p className="text-xs font-semibold">{onboardingData.name}</p>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={onboardedUserActive ? activeBadge : inactiveBadge}
            >
              {onboardingData.style}
            </span>
          </div>
        </button>
      )}

      {users.map((u) => {
        const active = !onboardedUserActive && u.user_id === currentUser?.user_id
        return (
          <button
            key={u.user_id}
            onClick={() => switchToUser(u)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 transition-colors text-left"
            style={active ? activeStyle : inactiveStyle}
          >
            <div className="leading-tight">
              <p className="text-xs font-semibold">{u.name}</p>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={active ? activeBadge : inactiveBadge}
              >
                {u.style}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
