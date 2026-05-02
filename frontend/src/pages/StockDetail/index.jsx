import { useMemo, useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatPct } from '../../utils/format'

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

const PERIODS = ['1W', '1M', '3M', '1Y', '3Y']
const PERIOD_POINTS = { '1W': 7, '1M': 30, '3M': 90, '1Y': 52, '3Y': 36 }
const PERIOD_START_LABEL = {
  '1W': '7d ago', '1M': '1m ago', '3M': '3m ago', '1Y': '1y ago', '3Y': '3y ago',
}

function makePrng(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function StatItem({ stat, isOpen, onToggle, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onClose])

  return (
    <div ref={ref} className="flex flex-col gap-1 relative">
      <div className="flex items-center gap-1">
        <span className="text-xs" style={{ color: '#666666' }}>{stat.label}</span>
        <button
          onClick={onToggle}
          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
          style={{
            backgroundColor: '#f4f8fd',
            color: '#6B96C3',
            border: '1px solid #acd4f1',
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          i
        </button>
      </div>
      <p className="text-base font-bold tabular-nums" style={{ color: stat.valueColor ?? '#001E62' }}>
        {stat.value}
      </p>
      {isOpen && (
        <div
          className="absolute top-7 left-0 z-10 rounded-lg shadow-md px-3 py-2 w-52"
          style={{ backgroundColor: '#001E62', color: '#fff', fontSize: 12, lineHeight: 1.5 }}
        >
          {stat.tooltip}
        </div>
      )}
    </div>
  )
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg shadow px-2.5 py-1.5"
      style={{ backgroundColor: '#001E62', color: '#fff', fontSize: 12 }}
    >
      {formatCurrency(payload[0].value)}
    </div>
  )
}

export default function StockDetail() {
  const location = useLocation()
  const navigate = useNavigate()
  const holding = location.state?.holding
  const portfolioCurrentValue = location.state?.portfolioCurrentValue

  const [activePeriod, setActivePeriod] = useState('1M')
  const [openTooltip, setOpenTooltip] = useState(null)

  useEffect(() => {
    if (!holding) navigate('/dashboard', { replace: true })
  }, [holding, navigate])

  const allPriceData = useMemo(() => {
    if (!holding) return {}
    const seed = holding.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const result = {}
    for (const period of PERIODS) {
      const rng = makePrng(seed + PERIOD_POINTS[period])
      const n = PERIOD_POINTS[period]
      const start = holding.invested
      const end = holding.current
      const points = []
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1)
        const trend = start + (end - start) * t
        const noise = (rng() - 0.5) * 2 * start * 0.04
        points.push({ idx: i, value: Math.max(start * 0.5, trend + noise) })
      }
      points[points.length - 1].value = end
      result[period] = points
    }
    return result
  }, [holding])

  if (!holding) return null

  const chartData = allPriceData[activePeriod] ?? []
  const gainLoss = (holding.current ?? 0) - (holding.invested ?? 0)
  const positive = (holding.return_pct ?? 0) >= 0
  const gainColor = positive ? '#16a34a' : '#dc2626'
  const returnPct = holding.return_pct ?? 0

  const portfolioPct =
    portfolioCurrentValue && holding.current
      ? ((holding.current / portfolioCurrentValue) * 100).toFixed(1)
      : null

  const isFund =
    holding.name?.toLowerCase().includes('fund') ||
    holding.name?.toLowerCase().includes(' mf') ||
    holding.name?.toLowerCase().includes('nifty') ||
    holding.name?.toLowerCase().includes('sbi') ||
    holding.name?.toLowerCase().includes('hdfc')
  const investingSince = isFund ? 'Mar 2024' : 'Jan 2024'

  let insight = ''
  if (returnPct > 15) {
    insight = `This investment is doing really well — it's grown ${returnPct.toFixed(1)}% since you bought it. That's better than most savings accounts would give you in years.`
  } else if (returnPct >= 5) {
    insight = `This investment is growing steadily at ${returnPct.toFixed(1)}%. It's doing its job — slow and consistent growth is exactly what long-term investing looks like.`
  } else if (returnPct >= 0) {
    insight = `This investment is holding steady with ${returnPct.toFixed(1)}% growth. It hasn't moved much, but it hasn't lost value either.`
  } else {
    insight = `This investment is currently down ${Math.abs(returnPct).toFixed(1)}%. That's okay — investments go up and down. The important thing is your long-term goal, not today's number.`
  }

  const stats = [
    {
      label: 'What you put in',
      value: formatCurrency(holding.invested),
      tooltip: 'This is the total amount of your own money you used to buy this.',
    },
    {
      label: "What it's worth now",
      value: formatCurrency(holding.current),
      tooltip: 'This is how much your investment would sell for today.',
    },
    {
      label: 'Your profit or loss',
      value: `${positive ? '+' : ''}${formatCurrency(gainLoss)}`,
      valueColor: gainColor,
      tooltip:
        "The difference between what you paid and what it's worth now. Green means you made money.",
    },
    {
      label: "How much it's grown",
      value: `${positive ? '+' : ''}${formatPct(returnPct)}`,
      valueColor: gainColor,
      tooltip: "The percentage your money has grown. 10% means $100 became $110.",
    },
    {
      label: 'Slice of your total',
      value: portfolioPct != null ? `${portfolioPct}%` : '—',
      tooltip: 'Out of all your investments, this is how big a piece this one takes up.',
    },
    {
      label: 'Investing since',
      value: investingSince,
      tooltip: 'The month you first bought this investment.',
    },
  ]

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 mb-5"
          style={{ color: '#6B96C3' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex items-center gap-3">
          {LOGO_MAP[holding.name] && (
            <img
              src={`https://www.google.com/s2/favicons?domain=${LOGO_MAP[holding.name]}&sz=64`}
              alt={holding.name}
              style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain', flexShrink: 0, background: '#f4f8fd', padding: 4 }}
              onError={(e) => { e.target.style.display = 'none' }}
            />
          )}
          <p className="font-semibold" style={{ color: '#001E62', fontSize: 22 }}>
            {holding.name}
          </p>
        </div>
        <p className="text-3xl font-bold mt-1 tabular-nums" style={{ color: '#001E62' }}>
          {formatCurrency(holding.current)}
        </p>
        <span
          className="inline-block mt-2 text-sm font-semibold px-3 py-1 rounded-full tabular-nums"
          style={{
            backgroundColor: positive ? '#e8f5ee' : '#fdecea',
            color: gainColor,
          }}
        >
          {positive ? '+' : ''}{formatCurrency(gainLoss)} · {positive ? '+' : ''}{returnPct.toFixed(1)}%
        </span>
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setActivePeriod(p)}
            className="flex-1 py-1.5 text-sm font-semibold rounded-full border transition-colors"
            style={
              activePeriod === p
                ? { backgroundColor: '#001E62', color: '#fff', borderColor: '#001E62' }
                : { backgroundColor: '#f4f8fd', color: '#001E62', borderColor: '#acd4f1' }
            }
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #e8eff8' }}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 10, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B96C3" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6B96C3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="idx"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#999' }}
              ticks={chartData.length > 0 ? [0, chartData.length - 1] : []}
              tickFormatter={(val) =>
                val === 0 ? PERIOD_START_LABEL[activePeriod] : 'Now'
              }
            />
            <YAxis hide />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6B96C3"
              strokeWidth={2}
              fill="url(#chartFill)"
              dot={false}
              activeDot={{ r: 4, fill: '#6B96C3' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e8eff8' }}>
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-4"
          style={{ color: '#666666' }}
        >
          Your investment at a glance
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          {stats.map((stat, i) => (
            <StatItem
              key={i}
              stat={stat}
              isOpen={openTooltip === i}
              onToggle={() => setOpenTooltip(openTooltip === i ? null : i)}
              onClose={() => setOpenTooltip(null)}
            />
          ))}
        </div>
      </div>

      {/* Insight */}
      <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e8eff8' }}>
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-3"
          style={{ color: '#666666' }}
        >
          What this means for you
        </p>
        <p className="text-sm leading-relaxed" style={{ color: '#001E62' }}>
          {insight}
        </p>
      </div>

    </main>
  )
}
