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

function AllocationBar({ allocation }) {
  if (!allocation) return null
  const { stocks_pct, mutual_funds_pct } = allocation
  return (
    <div>
      <p className="text-xs text-gs-gray uppercase tracking-widest mb-3">How your money is split</p>
      <div className="w-full flex gap-1" style={{ height: 12 }}>
        <div style={{ width: `${stocks_pct}%`, backgroundColor: '#001E62', borderRadius: 9999 }} />
        <div style={{ width: `${mutual_funds_pct}%`, backgroundColor: '#acd4f1', borderRadius: 9999 }} />
      </div>
      <div className="flex gap-5 mt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#001E62' }} />
          <span className="text-xs text-gs-gray">Stocks {formatPct(stocks_pct)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#acd4f1' }} />
          <span className="text-xs text-gs-gray">Mutual Funds {formatPct(mutual_funds_pct)}</span>
        </div>
      </div>
    </div>
  )
}

function HoldingRow({ h }) {
  const positive = h.return_pct >= 0
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #e8eff8' }}>
      <p className="font-medium text-gs-navy text-sm">{h.name}</p>
      <div className="text-right">
        <p className="font-bold text-gs-navy text-sm tabular-nums">{formatCurrency(h.current)}</p>
        <p className="text-xs tabular-nums" style={{ color: positive ? '#16a34a' : '#dc2626' }}>
          {positive ? '+' : ''}{formatPct(h.return_pct)}
        </p>
      </div>
    </div>
  )
}

const ONBOARDED_SCORE = {
  score: 0,
  label: 'Just getting started',
  color: 'blue',
  reason: "You haven't invested anything yet — that's okay, everyone starts here.",
  tips: [
    'Even $50 a month can grow significantly over time.',
    'Starting early is the single biggest advantage you can have.',
  ],
}

function OnboardedEmptyCard({ investAmount }) {
  return (
    <div
      className="rounded-2xl p-8 flex flex-col items-center text-center"
      style={{ backgroundColor: '#f4f8fd', border: '1px solid #acd4f1' }}
    >
      <p className="text-lg font-semibold" style={{ color: '#001E62' }}>
        You haven't invested anything yet
      </p>
      <p className="text-sm text-gs-gray mt-2 max-w-xs leading-relaxed">
        Start with as little as ${investAmount} a month — we'll guide you every step of the way
      </p>
      <Link
        to="/invest"
        className="mt-5 text-sm font-semibold text-white px-6 py-2.5 rounded-xl transition-colors"
        style={{ backgroundColor: '#001E62' }}
      >
        Start Investing
      </Link>
    </div>
  )
}

function EmptyPortfolioCard() {
  return (
    <div
      className="rounded-2xl p-8 flex flex-col items-center text-center"
      style={{ backgroundColor: '#f4f8fd', border: '1px solid #acd4f1' }}
    >
      <p className="text-lg font-semibold" style={{ color: '#001E62' }}>
        You haven't invested anything yet
      </p>
      <p className="text-sm text-gs-gray mt-2 max-w-xs leading-relaxed">
        Start with as little as $100 a month — we'll guide you every step of the way.
      </p>
    </div>
  )
}

function HoldingsList({ stocks, mutualFunds }) {
  const hasStocks = stocks?.length > 0
  const hasFunds = mutualFunds?.length > 0
  if (!hasStocks && !hasFunds) return null
  return (
    <div className="bg-white rounded-2xl p-5 mt-4" style={{ border: '1px solid #e8eff8' }}>
      {hasStocks && (
        <div>
          <p className="text-[10px] font-semibold text-gs-gray uppercase tracking-widest mb-1">Stocks</p>
          {stocks.map((h, i) => <HoldingRow key={i} h={h} />)}
        </div>
      )}
      {hasStocks && hasFunds && (
        <div className="my-4" style={{ height: 1, backgroundColor: '#e8eff8' }} />
      )}
      {hasFunds && (
        <div>
          <p className="text-[10px] font-semibold text-gs-gray uppercase tracking-widest mb-1">Mutual Funds</p>
          {mutualFunds.map((h, i) => <HoldingRow key={i} h={h} />)}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { currentUser, onboardingData, onboardedUserActive } = useApp()
  const [portfolio, setPortfolio] = useState(null)
  const [healthScore, setHealthScore] = useState(null)
  const [loading, setLoading] = useState(!onboardedUserActive)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (onboardedUserActive) {
      setPortfolio(null)
      setHealthScore(null)
      setLoading(false)
      setError(null)
      return
    }
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
  }, [currentUser, onboardedUserActive])

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

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

      {onboardedUserActive && onboardingData && (
        <div
          className="bg-white rounded-xl px-4 py-4"
          style={{ border: '1px solid #acd4f1' }}
        >
          <p style={{ color: '#001E62', fontSize: '22px', fontWeight: 600, lineHeight: 1.2 }}>
            Welcome, {onboardingData.name}
          </p>
          <p className="text-sm text-gs-gray mt-1">
            Your goal: {onboardingData.goal} · {onboardingData.years} years away
          </p>
          <p className="text-sm text-gs-gray">
            Monthly investment: ${onboardingData.investAmount}
          </p>
        </div>
      )}

      {onboardedUserActive ? (
        <>
          <HealthScoreCard score={ONBOARDED_SCORE} name={onboardingData?.name} />
          <OnboardedEmptyCard investAmount={onboardingData?.investAmount} />
        </>
      ) : (
        <>
          {portfolio?.market_alert && (
            <DontPanicBanner message={portfolio.market_alert} />
          )}

          {healthScore && (
            <HealthScoreCard score={healthScore} name={currentUser?.name} />
          )}

          {portfolio?.stocks?.length === 0 && portfolio?.mutual_funds?.length === 0 ? (
            <EmptyPortfolioCard />
          ) : (
            <>
              {portfolio && <PortfolioValueRow portfolio={portfolio} />}

              {portfolio?.allocation && (
                <AllocationBar allocation={portfolio.allocation} />
              )}

              <HoldingsList
                stocks={portfolio?.stocks ?? []}
                mutualFunds={portfolio?.mutual_funds ?? []}
              />
            </>
          )}
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
