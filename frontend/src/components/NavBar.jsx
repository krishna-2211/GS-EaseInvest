import { Link } from 'react-router-dom'
import UserSwitcher from './UserSwitcher'

export default function NavBar() {
  return (
    <nav
      className="bg-white px-6 py-3 flex items-center justify-between sticky top-0 z-10"
      style={{ borderBottom: '1px solid #acd4f1' }}
    >
      <Link to="/dashboard" className="font-bold text-gs-navy text-lg tracking-tight">
        GS-EaseInvest
      </Link>
      <UserSwitcher />
    </nav>
  )
}
