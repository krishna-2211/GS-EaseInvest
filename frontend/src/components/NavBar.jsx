import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function NavBar() {
  const { isAuthenticated, logout, currentUser, onboardingData, onboardedUserActive } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const displayName  = onboardedUserActive ? onboardingData?.name  : currentUser?.name
  const displayStyle = onboardedUserActive ? onboardingData?.style : currentUser?.style

  return (
    <nav
      className="bg-white px-6 py-3 flex items-center justify-between sticky top-0 z-10"
      style={{ borderBottom: '1px solid #acd4f1' }}
    >
      <Link to="/dashboard" className="font-bold text-gs-navy text-lg tracking-tight shrink-0">
        GS-EaseInvest
      </Link>

      {isAuthenticated && (
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-sm font-medium" style={{ color: '#001E62' }}>{displayName}</span>
            {displayStyle && (
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#acd4f1', color: '#001E62' }}
              >
                {displayStyle}
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-sm transition-colors shrink-0"
            style={{ color: '#9ca3af' }}
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  )
}
