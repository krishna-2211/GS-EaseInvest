import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { simulate } from '../api/stocks'

const NAVY  = '#001E62'
const PALE  = '#acd4f1'

function formatCurrency(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// ─── Small donut chart ────────────────────────────────────────────────────────

function AllocationDonut({ stocksPct, label }) {
  const safe  = Math.min(100, Math.max(0, stocksPct))
  const data  = [
    { name: 'Stocks', value: safe },
    { name: 'Funds',  value: 100 - safe },
  ]
  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>
        {label}
      </p>
      <PieChart width={110} height={110}>
        <Pie
          data={data}
          cx={55}
          cy={55}
          innerRadius={32}
          outerRadius={50}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          strokeWidth={0}
        >
          <Cell fill={NAVY} />
          <Cell fill={PALE} />
        </Pie>
        <Tooltip
          formatter={(v, n) => [`${v}%`, n]}
          contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e8eff8' }}
        />
      </PieChart>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs font-semibold tabular-nums" style={{ color: NAVY }}>
          {safe}% stocks
        </span>
        <span className="text-[10px]" style={{ color: '#9ca3af' }}>
          {100 - safe}% funds
        </span>
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 text-sm font-semibold px-5 py-3 rounded-xl shadow-lg z-[60]"
      style={{ backgroundColor: '#16a34a', color: '#ffffff', whiteSpace: 'nowrap' }}
    >
      {message}
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function SimulatorPanel({ stock, userId, type, onClose }) {
  const [amount,      setAmount]      = useState(500)
  const [result,      setResult]      = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [toast,       setToast]       = useState(false)
  const [apiError,    setApiError]    = useState(false)

  const priceAvailable = stock?.price != null && stock.price > 0
  const sharesOwned    = priceAvailable ? Math.floor(amount / stock.price) : null

  const handleAnalyze = async () => {
    setLoading(true)
    setResult(null)
    setApiError(false)
    try {
      const data = await simulate(userId, stock.ticker, stock.name, amount, type)
      setResult(data)
    } catch {
      setApiError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToSim = () => {
    const key      = 'simulated_holdings'
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    const updated  = [
      ...existing.filter(h => h.ticker !== stock.ticker),
      { name: stock.name, ticker: stock.ticker, amount, type },
    ]
    localStorage.setItem(key, JSON.stringify(updated))
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  if (!stock) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.18)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-screen flex flex-col z-50 overflow-y-auto"
        style={{ width: 380, backgroundColor: '#ffffff', boxShadow: '-4px 0 24px rgba(0,30,98,0.10)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid #e8eff8' }}
        >
          <div>
            <p className="font-bold text-base leading-tight" style={{ color: NAVY }}>
              Simulate: {stock.name}
            </p>
            <p className="text-[11px] font-mono mt-0.5" style={{ color: '#9ca3af' }}>
              {stock.ticker}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ backgroundColor: '#f4f8fd', color: '#6B96C3' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e8eff8'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f4f8fd'}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6"  y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 py-5 flex-1">

          {/* Amount slider */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>
              How much would you invest?
            </p>
            <p className="text-3xl font-bold tabular-nums" style={{ color: NAVY }}>
              {formatCurrency(amount)}
            </p>
            <input
              type="range"
              min={100}
              max={5000}
              step={100}
              value={amount}
              onChange={e => { setAmount(Number(e.target.value)); setResult(null); setApiError(false) }}
              className="w-full accent-[#001E62]"
              style={{ cursor: 'pointer' }}
            />
            <div className="flex justify-between text-[10px]" style={{ color: '#9ca3af' }}>
              <span>$100</span>
              <span>$5,000</span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 flex flex-col gap-0.5" style={{ backgroundColor: '#f4f8fd', border: '1px solid #e8eff8' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>You'd own</p>
              <p className="text-base font-bold tabular-nums" style={{ color: NAVY }}>{formatCurrency(amount)}</p>
            </div>
            <div className="rounded-xl p-3 flex flex-col gap-0.5" style={{ backgroundColor: '#f4f8fd', border: '1px solid #e8eff8' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>At current price</p>
              {priceAvailable ? (
                <p className="text-base font-bold tabular-nums" style={{ color: NAVY }}>
                  {sharesOwned} <span className="text-xs font-medium" style={{ color: '#9ca3af' }}>shares</span>
                </p>
              ) : (
                <p className="text-xs" style={{ color: '#9ca3af' }}>Price unavailable</p>
              )}
            </div>
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full text-sm font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
            style={{ backgroundColor: NAVY, color: '#ffffff' }}
          >
            {loading ? 'Analyzing…' : 'See how it changes my portfolio →'}
          </button>

          {/* API error */}
          {apiError && (
            <p className="text-sm text-center" style={{ color: '#b91c1c' }}>
              Something went wrong. Please try again.
            </p>
          )}

          {/* Simulation result */}
          {result && (
            <div className="flex flex-col gap-4">
              {/* Donut charts */}
              <div className="flex justify-around">
                <AllocationDonut stocksPct={result.before.stocks_pct} label="Before" />
                <div className="flex items-center" style={{ color: '#acd4f1' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
                <AllocationDonut stocksPct={result.after.stocks_pct} label="After" />
              </div>

              {/* AI insight card */}
              <div
                className="rounded-xl p-4 flex flex-col gap-2"
                style={{
                  backgroundColor: '#f4f8fd',
                  border: '1px solid #d0dff0',
                  borderLeft: result.good_fit
                    ? '3px solid #16a34a'
                    : '3px solid #b45309',
                }}
              >
                <span
                  className="text-xs font-semibold"
                  style={{ color: result.good_fit ? '#15803d' : '#92400e' }}
                >
                  {result.good_fit ? '✓ Good fit for your goal' : '⚠ Consider carefully'}
                </span>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                  {result.ai_insight}
                </p>
              </div>

              {/* Add to simulation */}
              <button
                onClick={handleAddToSim}
                className="w-full text-sm font-semibold py-3 rounded-xl transition-colors hover:opacity-90"
                style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
              >
                Add to my simulation
              </button>

              <button
                onClick={onClose}
                className="w-full text-sm py-2 transition-colors hover:opacity-70"
                style={{ color: '#9ca3af' }}
              >
                Maybe later
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message="Added to your simulation!" />}
    </>
  )
}
