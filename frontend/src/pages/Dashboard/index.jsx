import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { getPortfolio } from '../../api/portfolio'
import { getHealthScore } from '../../api/healthScore'
import { formatCurrency, formatPct, salaryLabel, healthColor } from '../../utils/format'
import DontPanicBanner from '../../components/DontPanicBanner'
import GrowthCalculator from '../../components/GrowthCalculator'
import { NumberTicker } from '../../components/ui/number-ticker'
import { Badge } from '../../components/ui/badge'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const LOGO_MAP = {
  'Apple':                          'apple.com',
  'Tesla':                          'tesla.com',
  'NVIDIA':                         'nvidia.com',
  'Microsoft':                      'microsoft.com',
  'Johnson & Johnson':              'jnj.com',
  'Vanguard S&P 500 ETF':           'vanguard.com',
  'Fidelity Growth Fund':           'fidelity.com',
  'Vanguard Total Bond Market ETF': 'vanguard.com',
  'Fidelity Balanced Fund':         'fidelity.com',
}

const ONBOARDED_SCORE = {
  score: null,
  label: 'Ready to start',
  color: 'blue',
  reason: "You haven't invested yet — your score will appear once you make your first investment.",
  tips: [
    'Starting with just $100 a month is enough to build real wealth over time.',
    'The earlier you start, the more time your money has to grow.',
  ],
}

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
          {score.score != null ? (
            <div>
              <p className="text-white/50 text-xs mb-1 uppercase tracking-wide">Financial Health</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white tabular-nums">
                  <NumberTicker value={score.score} className="text-white" />
                </span>
                <span className="text-white/40 text-lg">/100</span>
              </div>
            </div>
          ) : (
            <p className="text-white/50 text-xs uppercase tracking-wide">Financial Health</p>
          )}
          {score.label && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full mb-1"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {score.label}
            </span>
          )}
        </div>

        {/* Score bar — only shown when a score exists */}
        {score.score != null && (
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${score.score}%`, backgroundColor: '#acd4f1' }}
            />
          </div>
        )}

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

function StatCard({ label, value, hero, valueColor, children }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1.5"
      style={
        hero
          ? { backgroundColor: '#001E62' }
          : { backgroundColor: '#ffffff', border: '1px solid #e8eff8' }
      }
    >
      <p className="text-xs" style={{ color: hero ? 'rgba(255,255,255,0.6)' : '#666666' }}>
        {label}
      </p>
      <p
        className="text-lg font-bold tabular-nums leading-tight"
        style={{ color: valueColor ?? (hero ? '#ffffff' : '#001E62') }}
      >
        {value}
      </p>
      {children}
    </div>
  )
}

function PortfolioStatsGrid({ portfolio }) {
  const totalReturn = (portfolio.current_value ?? 0) - (portfolio.total_invested ?? 0)
  const returnPositive = totalReturn >= 0
  const pctPositive = (portfolio.total_return_pct ?? 0) >= 0

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total invested"
          value={formatCurrency(portfolio.total_invested)}
        />
        <StatCard
          label="Current value"
          value={formatCurrency(portfolio.current_value)}
          hero
        />
        <StatCard
          label="Total return"
          value={`${returnPositive ? '+' : ''}${formatCurrency(totalReturn)}`}
          valueColor={returnPositive ? '#16a34a' : '#dc2626'}
        >
          <Badge
            className="text-[10px] font-semibold border-0 self-start px-2 py-0.5"
            style={
              pctPositive
                ? { backgroundColor: '#e8f5ee', color: '#16a34a' }
                : { backgroundColor: '#fdecea', color: '#dc2626' }
            }
          >
            {pctPositive ? '+' : ''}{formatPct(portfolio.total_return_pct)}
          </Badge>
        </StatCard>
        <StatCard
          label="Invested this month"
          value={formatCurrency(portfolio.last_30_days_invested)}
        />
      </div>
      {portfolio.salary_months_equivalent != null && (
        <p className="text-xs text-gs-gray text-center">
          {salaryLabel(portfolio.salary_months_equivalent)}
        </p>
      )}
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

function HoldingRow({ h, navigate, portfolioCurrentValue }) {
  const gainLoss = (h.current ?? 0) - (h.invested ?? 0)
  const positive = (h.return_pct ?? 0) >= 0
  const gainColor = positive ? '#16a34a' : '#dc2626'

  return (
    <div
      className="flex items-center justify-between py-4 cursor-pointer hover:bg-blue-50 rounded-lg px-1 -mx-1 transition-colors"
      style={{ borderBottom: '1px solid #e8eff8' }}
      onClick={() => navigate('/stock-detail', { state: { holding: h, portfolioCurrentValue } })}
    >
      <div className="flex items-center">
        {LOGO_MAP[h.name] && (
          <img
            src={`https://www.google.com/s2/favicons?domain=${LOGO_MAP[h.name]}&sz=64`}
            alt={h.name}
            style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain', marginRight: 10, flexShrink: 0, background: '#f4f8fd', padding: 4 }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        )}
        <div>
          <p className="font-medium text-gs-navy text-sm">{h.name}</p>
          <p className="text-xs text-gs-gray mt-0.5">
            Invested: {formatCurrency(h.invested)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="font-bold text-gs-navy text-sm tabular-nums">{formatCurrency(h.current)}</p>
          <p className="text-xs tabular-nums" style={{ color: gainColor }}>
            {positive ? '+' : ''}{formatCurrency(gainLoss)}
          </p>
          <p className="text-xs tabular-nums" style={{ color: gainColor }}>
            {positive ? '+' : ''}{formatPct(h.return_pct)}
          </p>
        </div>
        <span className="text-xl font-light" style={{ color: '#acd4f1' }}>›</span>
      </div>
    </div>
  )
}

const STOCK_COLORS = ['#001E62', '#00355f', '#6B96C3', '#7399c6', '#acd4f1']
const FUND_COLORS  = ['#1d4ed8', '#3b82f6']

function AllocationPieChart({ stocks, mutualFunds }) {
  if (!stocks?.length && !mutualFunds?.length) return null

  const chartData = [
    ...(stocks ?? []).map((s, i) => ({
      name:  s.name,
      value: s.current,
      color: STOCK_COLORS[i % STOCK_COLORS.length],
    })),
    ...(mutualFunds ?? []).map((f, i) => ({
      name:  f.name,
      value: f.current,
      color: FUND_COLORS[i % FUND_COLORS.length],
    })),
  ]

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const { name, value } = payload[0].payload
    return (
      <div
        className="text-xs px-3 py-2 rounded-lg shadow-sm"
        style={{ backgroundColor: '#fff', border: '1px solid #e8eff8', color: '#001E62' }}
      >
        {name}: {formatCurrency(value)}
      </div>
    )
  }

  const CenterLabel = () => (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-0.3em" fontSize="11" fill="#666666">Your</tspan>
      <tspan x="50%" dy="1.4em" fontSize="11" fill="#666666">mix</tspan>
    </text>
  )

  return (
    <div
      className="bg-white rounded-2xl p-5 mt-4 flex flex-col items-center"
      style={{ border: '1px solid #e8eff8' }}
    >
      <p className="text-[10px] font-semibold text-gs-gray uppercase tracking-widest self-start mb-4">
        Your investment mix
      </p>

      <PieChart width={300} height={300}>
        <Pie
          data={chartData}
          dataKey="value"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          startAngle={90}
          endAngle={-270}
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} stroke="none" />
          ))}
          <CenterLabel />
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-1">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span style={{ fontSize: 12, color: '#666666' }}>{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HoldingsList({ stocks, mutualFunds, navigate, portfolioCurrentValue }) {
  const hasStocks = stocks?.length > 0
  const hasFunds = mutualFunds?.length > 0
  if (!hasStocks && !hasFunds) return null
  return (
    <div className="bg-white rounded-2xl p-5 mt-4" style={{ border: '1px solid #e8eff8' }}>
      {hasStocks && (
        <div>
          <p className="text-[10px] font-semibold text-gs-gray uppercase tracking-widest mb-1">Stocks</p>
          {stocks.map((h, i) => (
            <HoldingRow key={i} h={h} navigate={navigate} portfolioCurrentValue={portfolioCurrentValue} />
          ))}
        </div>
      )}
      {hasStocks && hasFunds && (
        <div className="my-4" style={{ height: 1, backgroundColor: '#e8eff8' }} />
      )}
      {hasFunds && (
        <div>
          <p className="text-[10px] font-semibold text-gs-gray uppercase tracking-widest mb-1">Mutual Funds</p>
          {mutualFunds.map((h, i) => (
            <HoldingRow key={i} h={h} navigate={navigate} portfolioCurrentValue={portfolioCurrentValue} />
          ))}
        </div>
      )}
    </div>
  )
}

function FirstStepGuide({ onboardingData }) {
  const navigate = useNavigate()
  const investAmount = Number(onboardingData?.investAmount) || 100
  const projection = Math.round(investAmount * 12 * ((Math.pow(1.07, 10) - 1) / 0.07))

  const DoneBadge = () => (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
      style={{ backgroundColor: '#e8f5ee', color: '#16a34a', border: '1px solid #9fe1cb' }}
    >
      Done ✓
    </span>
  )

  const UpNextBadge = () => (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
      style={{ backgroundColor: '#001E62', color: '#ffffff' }}
    >
      Up next →
    </span>
  )

  const StepCircle = ({ n }) => (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold text-white"
      style={{ backgroundColor: '#001E62' }}
    >
      {n}
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <p className="font-semibold" style={{ color: '#001E62', fontSize: 20 }}>
          Your journey starts here, {onboardingData?.name}
        </p>
        <p className="mt-1 text-sm" style={{ color: '#666666' }}>
          Most people start with just ${investAmount} a month. Here's your path.
        </p>
      </div>

      {/* Step 1 */}
      <div
        className="bg-white rounded-xl p-4 flex items-center gap-3 cursor-pointer"
        style={{ border: '1px solid #9fe1cb' }}
        onClick={() => navigate('/invest')}
      >
        <StepCircle n={1} />
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: '#001E62' }}>
            Learn what you're investing in
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#666666' }}>
            Understand stocks and funds in plain English — no confusing terms
          </p>
        </div>
        <DoneBadge />
      </div>

      {/* Step 2 */}
      <div
        className="bg-white rounded-xl p-4 flex items-center gap-3"
        style={{ border: '1px solid #9fe1cb' }}
      >
        <StepCircle n={2} />
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: '#001E62' }}>
            Set your goals and style
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#666666' }}>
            You want to {onboardingData?.goal} · You're a {onboardingData?.style} investor
          </p>
        </div>
        <DoneBadge />
      </div>

      {/* Step 3 */}
      <div
        className="bg-white rounded-xl p-4 flex flex-col gap-3"
        style={{ border: '1px solid #acd4f1', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center gap-3">
          <StepCircle n={3} />
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: '#001E62' }}>
              Make your first investment
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#666666' }}>
              Start with ${investAmount}/month in a stable fund. Small steps build big futures.
            </p>
          </div>
          <UpNextBadge />
        </div>
        <button
          onClick={() => navigate('/invest')}
          className="w-full text-sm font-semibold py-2.5 rounded-xl transition-colors hover:opacity-90"
          style={{ backgroundColor: '#001E62', color: '#ffffff' }}
        >
          Start investing →
        </button>
      </div>

      {/* Motivation card */}
      <div
        className="bg-white rounded-xl p-4"
        style={{ border: '1px solid #acd4f1', marginTop: 8 }}
      >
        <p className="font-bold text-sm mb-1.5" style={{ color: '#001E62' }}>Did you know?</p>
        <p className="text-sm" style={{ color: '#666666' }}>
          Investing ${investAmount} every month for 10 years could grow to{' '}
          <span className="font-bold" style={{ color: '#001E62' }}>
            {formatCurrency(projection)}
          </span>
        </p>
        <p className="mt-1" style={{ color: '#666666', fontSize: 11 }}>
          Based on average stock market returns of 7% per year
        </p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { currentUser, activeUser, onboardedUserActive, onboardingData } = useApp()
  const navigate = useNavigate()
  const [portfolio, setPortfolio] = useState(null)
  const [healthScore, setHealthScore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (onboardedUserActive) {
      setPortfolio(null)
      setHealthScore(null)
      setLoading(false)
      return
    }
    if (!currentUser?.user_id) return
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

      {!onboardedUserActive && portfolio?.market_alert && (
        <DontPanicBanner message={portfolio.market_alert} />
      )}

      {onboardedUserActive ? (
        <HealthScoreCard score={ONBOARDED_SCORE} name={onboardingData?.name} />
      ) : (
        healthScore && <HealthScoreCard score={healthScore} name={currentUser?.name} />
      )}

      {onboardedUserActive && <FirstStepGuide onboardingData={onboardingData} />}

      {portfolio && <PortfolioStatsGrid portfolio={portfolio} />}

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

      {portfolio?.allocation && (
        <AllocationBar allocation={portfolio.allocation} />
      )}

      <HoldingsList
        stocks={portfolio?.stocks ?? []}
        mutualFunds={portfolio?.mutual_funds ?? []}
        navigate={navigate}
        portfolioCurrentValue={portfolio?.current_value}
      />

      <AllocationPieChart
        stocks={portfolio?.stocks}
        mutualFunds={portfolio?.mutual_funds}
      />

      <div>
        <p className="text-[10px] font-semibold text-gs-gray uppercase tracking-widest mb-3">
          See your money grow
        </p>
        <GrowthCalculator />
      </div>

    </main>
  )
}
