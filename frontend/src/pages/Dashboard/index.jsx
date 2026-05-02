import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { getPortfolio } from '../../api/portfolio'
import { getHealthScore } from '../../api/healthScore'
import DontPanicBanner from '../../components/DontPanicBanner'
import NavBar from '../../components/NavBar'

function ScoreRing({ score }) {
  const borderColor =
    score >= 70 ? 'border-gs-blue' : score >= 40 ? 'border-gs-blueAlt' : 'border-gs-pale'
  const textColor =
    score >= 70 ? 'text-gs-navy' : score >= 40 ? 'text-gs-deep' : 'text-gs-blue'

  return (
    <div className={`flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 ${borderColor}`}>
      <span className={`text-3xl font-bold ${textColor}`}>{score}</span>
      <span className="text-xs text-gs-gray">/ 100</span>
    </div>
  )
}

export default function Dashboard() {
  const { currentUserId, users } = useApp()
  const [portfolio, setPortfolio] = useState(null)
  const [healthData, setHealthData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const currentUser = users.find((u) => u.id === currentUserId)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([getPortfolio(currentUserId), getHealthScore(currentUserId)])
      .then(([pRes, hRes]) => {
        setPortfolio(pRes.data)
        setHealthData(hRes.data)
      })
      .catch(() => setError('Could not load your data. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [currentUserId])

  return (
    <div className="min-h-screen bg-gs-bg">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-gs-navy">
            Hey, {currentUser?.name} 👋
          </h1>
          {currentUser && (
            <p className="text-sm text-gs-gray mt-0.5">
              {currentUser.style} investor · Goal: {currentUser.goal}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-gs-pale/20 border border-gs-pale text-gs-deep text-sm rounded-xl px-5 py-4">
            {error}
          </div>
        )}

        {loading && !error && (
          <div className="flex gap-1.5 py-8 justify-center">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-gs-blue animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        {!loading && !error && healthData && (
          <div className="bg-white rounded-2xl border border-gs-pale/60 shadow-sm p-6 flex items-center gap-6">
            <ScoreRing score={healthData.score} />
            <div>
              <p className="text-sm font-semibold text-gs-navy">Financial Health Score</p>
              <p className="text-xs text-gs-gray mt-1 max-w-xs">{healthData.summary}</p>
            </div>
          </div>
        )}

        {!loading && !error && portfolio && (
          <>
            <div className="bg-gs-navy rounded-2xl p-6 text-white">
              <p className="text-sm text-white/60">Total portfolio value</p>
              <p className="text-3xl font-bold mt-1">
                ₹{portfolio.total_value?.toLocaleString('en-IN')}
              </p>
              {portfolio.monthly_salary && (
                <p className="text-xs text-white/50 mt-1">
                  That's about {(portfolio.total_value / portfolio.monthly_salary).toFixed(1)}× your monthly salary
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gs-pale/60 shadow-sm p-6">
              <p className="text-sm font-semibold text-gs-navy mb-4">Your holdings</p>
              {portfolio.holdings?.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {portfolio.holdings.map((h) => (
                    <div key={h.symbol} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-gs-navy">{h.symbol}</p>
                        <p className="text-xs text-gs-gray">{h.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gs-navy">
                          ₹{h.current_value?.toLocaleString('en-IN')}
                        </p>
                        <p className={`text-xs ${h.gain_pct >= 0 ? 'text-gs-blue' : 'text-red-500'}`}>
                          {h.gain_pct >= 0 ? '+' : ''}{h.gain_pct?.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gs-gray">No holdings yet.</p>
              )}
            </div>
          </>
        )}

        {!loading && !error && portfolio?.market_alert && (
          <DontPanicBanner message={portfolio.market_alert} />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/rebalance"
            className="bg-gs-navy hover:bg-gs-deep text-white text-sm font-semibold text-center py-3 rounded-xl transition-colors"
          >
            Rebalance
          </Link>
          <Link
            to="/invest"
            className="bg-white hover:bg-gs-bg border border-gs-pale text-gs-navy text-sm font-semibold text-center py-3 rounded-xl transition-colors"
          >
            Invest
          </Link>
        </div>
      </main>
    </div>
  )
}
