import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { getPortfolio } from '../../api/portfolio'
import { getHealthScore } from '../../api/healthScore'
import { formatCurrency, formatPct, salaryLabel, healthColor } from '../../utils/format'
import DontPanicBanner from '../../components/DontPanicBanner'
import { NumberTicker } from '../../components/ui/number-ticker'
import { Badge } from '../../components/ui/badge'

function Spinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-gs-blue animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

function HealthScoreCard({ score, name }) {
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const colors = healthColor[score.color] ?? healthColor.green

  return (
    <>
      {/* Navy hero card */}
      <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ backgroundColor: '#001E62' }}>
        <p className="text-white/70 text-sm font-medium">
          {greeting}, {name}
        </p>

        <div className="flex items-end gap-4">
          <div>
            <p className="text-white/50 text-xs mb-1 uppercase tracking-wide">Financial Health</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white tabular-nums">
                <NumberTicker value={score.score} className="text-white" />
              </span>
              <span className="text-white/40 text-lg">/100</span>
            </div>
          </div>
          {score.label && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full mb-1"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {score.label}
            </span>
          )}
        </div>

        {/* Score bar */}
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score.score}%`, backgroundColor: '#acd4f1' }}
          />
        </div>

        {score.reason && (
          <p className="text-sm" style={{ color: '#acd4f1' }}>
            {score.reason}
          </p>
        )}
      </div>

      {/* Tips — below card, outside navy bg */}
      {score.tips?.length > 0 && (
        <ul className="flex flex-col gap-1.5 px-1">
          {score.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gs-gray">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gs-blue shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function PortfolioValueRow({ portfolio }) {
  const positive = portfolio.total_return_pct >= 0
  return (
    <div className="bg-white rounded-2xl p-5 flex items-center justify-between" style={{ border: '1px solid #acd4f1' }}>
      <div>
        <p className="text-2xl font-bold text-gs-navy">
          {formatCurrency(portfolio.current_value)}
        </p>
        {portfolio.salary_months_equivalent != null && (
          <p className="text-xs text-gs-gray mt-0.5">
            {salaryLabel(portfolio.salary_months_equivalent)}
          </p>
        )}
      </div>
      <Badge
        className="text-xs font-semibold border-0"
        style={
          positive
            ? { backgroundColor: '#e8f5ee', color: '#0f6e56' }
            : { backgroundColor: '#fdecea', color: '#dc2626' }
        }
      >
        {positive ? '+' : ''}{formatPct(portfolio.total_return_pct)}
      </Badge>
    </div>
  )
}

function AllocationBar({ stocksPct, mutualFundsPct }) {
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3" style={{ border: '1px solid #acd4f1' }}>
      <p className="text-sm font-semibold text-gs-navy">How your money is split</p>
      <div className="w-full h-3 rounded-full overflow-hidden flex">
        <div style={{ width: `${stocksPct}%`, backgroundColor: '#001E62' }} className="h-full" />
        <div style={{ width: `${mutualFundsPct}%`, backgroundColor: '#acd4f1' }} className="h-full" />
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#001E62' }} />
          <span className="text-xs text-gs-gray">Stocks {stocksPct}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#acd4f1' }} />
          <span className="text-xs text-gs-gray">Mutual Funds {mutualFundsPct}%</span>
        </div>
      </div>
    </div>
  )
}

function HoldingRow({ holding }) {
  const positive = holding.return_pct >= 0
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <p className="font-medium text-gs-navy">{holding.name}</p>
      <div className="flex items-center gap-4">
        <p className="text-gs-navy tabular-nums">{formatCurrency(holding.current)}</p>
        <p
          className="text-xs font-semibold w-14 text-right tabular-nums"
          style={{ color: positive ? '#0f6e56' : '#dc2626' }}
        >
          {positive ? '+' : ''}{formatPct(holding.return_pct)}
        </p>
      </div>
    </div>
  )
}

function HoldingsSection({ title, holdings }) {
  if (!holdings.length) return null
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col" style={{ border: '1px solid #acd4f1' }}>
      <p className="text-sm font-semibold text-gs-navy mb-1">{title}</p>
      {holdings.map((h, i) => (
        <div key={h.name ?? i}>
          <HoldingRow holding={h} />
          {i < holdings.length - 1 && <div style={{ height: 1, backgroundColor: '#acd4f1' }} />}
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { currentUser } = useApp()
  const [portfolio, setPortfolio] = useState(null)
  const [healthScore, setHealthScore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!currentUser) return
    setLoading(true)
    setError(null)
    Promise.all([
      getPortfolio(currentUser.user_id),
      getHealthScore(currentUser.user_id),
    ])
      .then(([pRes, hRes]) => {
        setPortfolio(pRes.data)
        setHealthScore(hRes.data)
      })
      .catch(() => setError('Could not load data. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [currentUser])

  if (loading) return <Spinner />

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div
          className="rounded-xl px-5 py-4 text-sm"
          style={{ backgroundColor: '#e8f4fb', border: '1px solid #acd4f1', color: '#00355f' }}
        >
          {error}
        </div>
      </div>
    )
  }

  const stocks = portfolio?.holdings?.filter((h) => h.type === 'stock') ?? []
  const mutualFunds = portfolio?.holdings?.filter((h) => h.type === 'mutual_fund') ?? []

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

      {portfolio?.market_alert && (
        <DontPanicBanner message={portfolio.market_alert} />
      )}

      {healthScore && (
        <HealthScoreCard score={healthScore} name={currentUser?.name} />
      )}

      {portfolio && (
        <>
          <PortfolioValueRow portfolio={portfolio} />

          {(portfolio.stocks_pct != null && portfolio.mutual_funds_pct != null) && (
            <AllocationBar
              stocksPct={portfolio.stocks_pct}
              mutualFundsPct={portfolio.mutual_funds_pct}
            />
          )}

          <HoldingsSection title="Stocks" holdings={stocks} />
          <HoldingsSection title="Mutual Funds" holdings={mutualFunds} />
        </>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Link
          to="/rebalance"
          className="text-center text-sm font-semibold py-3 rounded-xl transition-colors"
          style={{ backgroundColor: '#001E62', color: '#fff' }}
        >
          Rebalance
        </Link>
        <Link
          to="/invest"
          className="text-center text-sm font-semibold py-3 rounded-xl transition-colors"
          style={{ backgroundColor: '#f4f8fd', color: '#001E62', border: '1px solid #acd4f1' }}
        >
          Invest
        </Link>
      </div>
    </main>
  )
}
