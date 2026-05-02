import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import UserSwitcher from './UserSwitcher'

export default function NavBar() {
  const { isAuthenticated, logout } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav
      className="bg-white px-6 py-3 flex items-center justify-between sticky top-0 z-10"
      style={{ borderBottom: '1px solid #acd4f1' }}
    >
      <Link to="/dashboard" className="font-bold text-gs-navy text-lg tracking-tight shrink-0">
        GS-EaseInvest
      </Link>

      <UserSwitcher />

      {isAuthenticated && (
        <button
          onClick={handleLogout}
          className="text-sm text-gs-gray hover:text-gs-navy transition-colors shrink-0"
        >
          Log out
        </button>
      )}
    </nav>
  )
}
