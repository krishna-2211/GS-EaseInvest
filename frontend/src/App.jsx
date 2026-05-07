import { BrowserRouter, Routes, Route, Outlet, NavLink, Navigate, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { isTokenValid } from './utils/token'
import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import InvestEntry from './pages/InvestEntry'
import Rebalance from './pages/Rebalance'
import StockDetail from './pages/StockDetail'

const NAV_TABS = [
  { to: '/',           label: 'Home',      icon: HomeIcon },
  { to: '/dashboard',  label: 'Dashboard', icon: ChartIcon },
  { to: '/rebalance',  label: 'Rebalance', icon: ScaleIcon },
  { to: '/invest',     label: 'Invest',    icon: TrendIcon },
]

function HomeIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function ChartIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6"  y1="20" x2="6"  y2="14" />
    </svg>
  )
}

function ScaleIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="3" x2="12" y2="21" />
      <path d="M5 6l7-3 7 3" />
      <path d="M5 6l-2 7h4L5 6z" />
      <path d="M19 6l-2 7h4L19 6z" />
    </svg>
  )
}

function TrendIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function BottomNav() {
  const { isAuthenticated } = useApp()
  if (!isAuthenticated) return null
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 bg-white flex"
      style={{ borderTop: '1px solid #e8eff8' }}
    >
      {NAV_TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1"
        >
          {({ isActive }) => {
            const color = isActive ? '#001E62' : '#666666'
            return (
              <>
                <Icon color={color} />
                <span className="text-[10px] font-medium" style={{ color }}>
                  {label}
                </span>
              </>
            )
          }}
        </NavLink>
      ))}
    </nav>
  )
}

function ProtectedRoute({ children }) {
  if (!isTokenValid()) return <Navigate to="/onboarding" replace />
  return children
}

function OnboardingGuard({ children }) {
  if (isTokenValid()) return <Navigate to="/dashboard" replace />
  return children
}

function Layout() {
  const { pathname } = useLocation()
  const isOnboarding = pathname === '/' || pathname === '/onboarding'
  return (
    <div className="min-h-screen bg-gs-bg pb-16">
      {!isOnboarding && <NavBar />}
      <Outlet />
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/"           element={<OnboardingGuard><Onboarding /></OnboardingGuard>} />
            <Route path="/onboarding" element={<OnboardingGuard><Onboarding /></OnboardingGuard>} />
            <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/invest"       element={<ProtectedRoute><InvestEntry /></ProtectedRoute>} />
            <Route path="/rebalance"    element={<ProtectedRoute><Rebalance /></ProtectedRoute>} />
            <Route path="/stock-detail" element={<ProtectedRoute><StockDetail /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
