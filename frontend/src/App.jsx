import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import InvestEntry from './pages/InvestEntry'
import Rebalance from './pages/Rebalance'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invest" element={<InvestEntry />} />
          <Route path="/rebalance" element={<Rebalance />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
