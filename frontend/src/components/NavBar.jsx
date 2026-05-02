import { Link } from 'react-router-dom'
import UserSwitcher from './UserSwitcher'

export default function NavBar() {
  return (
    <nav className="bg-gs-navy px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <Link to="/dashboard" className="text-white font-bold text-lg tracking-tight">
        EaseInvest
      </Link>
      <UserSwitcher />
    </nav>
  )
}
