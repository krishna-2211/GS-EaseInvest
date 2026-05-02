import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import InvestEntry from './pages/InvestEntry'
import Rebalance from './pages/Rebalance'

function Layout() {
  return (
    <div className="min-h-screen bg-gs-bg">
      <NavBar />
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/"          element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invest"    element={<InvestEntry />} />
            <Route path="/rebalance" element={<Rebalance />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
