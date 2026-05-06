import { useState } from 'react'

const DOMAIN_MAP = {
  AAPL:   'apple.com',
  MSFT:   'microsoft.com',
  NVDA:   'nvidia.com',
  GOOGL:  'google.com',
  AMZN:   'amazon.com',
  META:   'meta.com',
  TSLA:   'tesla.com',
  'BRK-B':'berkshirehathaway.com',
  JNJ:    'jnj.com',
  JPM:    'jpmorganchase.com',
  V:      'visa.com',
  PG:     'pg.com',
  UNH:    'unitedhealthgroup.com',
  XOM:    'exxonmobil.com',
  HD:     'homedepot.com',
  VOO:    'vanguard.com',
  FGRIX:  'fidelity.com',
  AGG:    'ishares.com',
  VTI:    'vanguard.com',
  QQQ:    'invesco.com',
  BND:    'vanguard.com',
  ARKK:   'ark-invest.com',
  VIG:    'vanguard.com',
  EEM:    'ishares.com',
  SCHD:   'schwab.com',
  VNQ:    'vanguard.com',
  GLD:    'ssga.com',
  FBALX:  'fidelity.com',
  VUG:    'vanguard.com',
  IJH:    'ishares.com',
}

const BAR_COLORS = ['#001E62', '#6B96C3', '#acd4f1', '#7399c6']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CompanyLogo({ ticker }) {
  const [imgError, setImgError] = useState(false)
  const domain = DOMAIN_MAP[ticker]

  if (!domain || imgError) {
    return (
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: '#e8f4fb', color: '#001E62' }}
      >
        {ticker.replace('-', '').slice(0, 2)}
      </div>
    )
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt={ticker}
      className="w-8 h-8 rounded-lg object-contain flex-shrink-0"
      onError={() => setImgError(true)}
    />
  )
}

function TypeBadge({ type }) {
  const isStock = type === 'stock'
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={
        isStock
          ? { backgroundColor: '#e8f4fb', color: '#1d5a8a' }
          : { backgroundColor: '#e8f5ee', color: '#0f6e56' }
      }
    >
      {isStock ? 'Stock' : 'Fund'}
    </span>
  )
}

function LightbulbIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M9 21h6" />
      <path d="M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8A6.002 6.002 0 0 1 6 9a6 6 0 0 1 6-6z" />
    </svg>
  )
}

function Toast({ message }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 text-sm font-semibold px-5 py-3 rounded-xl shadow-lg z-50"
      style={{ backgroundColor: '#16a34a', color: '#ffffff', whiteSpace: 'nowrap' }}
    >
      {message}
    </div>
  )
}

// ─── Stacked allocation bar ───────────────────────────────────────────────────

function AllocationBar({ holdings }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex h-3 rounded-full overflow-hidden w-full">
        {holdings.map((h, i) => (
          <div
            key={h.ticker}
            style={{
              width: `${h.allocation_pct}%`,
              backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
              position: 'relative',
              cursor: 'default',
              transition: 'filter 0.15s',
              filter: hoveredIdx === i ? 'brightness(1.2)' : 'none',
            }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            title={`${h.ticker} — ${h.allocation_pct}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {holdings.map((h, i) => (
          <span key={h.ticker} className="flex items-center gap-1 text-[10px]" style={{ color: '#6b7280' }}>
            <span
              className="w-2 h-2 rounded-sm inline-block flex-shrink-0"
              style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
            />
            {h.ticker} {h.allocation_pct}%
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Main card ────────────────────────────────────────────────────────────────

export default function StarterPlanCard({ suggestion }) {
  const [toast, setToast] = useState(false)

  if (!suggestion) return null

  const { greeting, summary, suggested_holdings, first_tip, encouragement } = suggestion

  const handleSaveToSim = () => {
    const key     = 'simulated_holdings'
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    const tickers  = new Set(suggested_holdings.map(h => h.ticker))
    const merged   = [
      ...existing.filter(h => !tickers.has(h.ticker)),
      ...suggested_holdings.map(h => ({
        name:   h.name,
        ticker: h.ticker,
        amount: h.monthly_amount,
        type:   h.type,
      })),
    ]
    localStorage.setItem(key, JSON.stringify(merged))
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  return (
    <>
      <div
        className="bg-white rounded-2xl p-6 flex flex-col gap-4"
        style={{
          border:      '1px solid #e8eff8',
          borderLeft:  '4px solid #6B96C3',
        }}
      >
        {/* Header */}
        <div className="flex flex-col gap-1">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: '#9ca3af' }}
          >
            Your Starter Plan
          </p>
          <p
            className="text-sm font-medium leading-snug italic"
            style={{ color: '#001E62' }}
          >
            {greeting}
          </p>
        </div>

        {/* Summary */}
        <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
          {summary}
        </p>

        {/* Holdings list */}
        <div className="flex flex-col">
          {suggested_holdings.map((h, i) => (
            <div
              key={h.ticker}
              className="flex items-start justify-between gap-3 py-3"
              style={{
                borderBottom: i < suggested_holdings.length - 1
                  ? '1px solid #f0f4fa'
                  : 'none',
              }}
            >
              {/* Left: logo + name + reason */}
              <div className="flex items-start gap-2.5 min-w-0">
                <CompanyLogo ticker={h.ticker} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold leading-tight" style={{ color: '#001E62' }}>
                      {h.name}
                    </span>
                    <span className="text-[11px] font-mono" style={{ color: '#9ca3af' }}>
                      {h.ticker}
                    </span>
                  </div>
                  <p
                    className="text-xs leading-snug mt-0.5 italic"
                    style={{ color: '#9ca3af' }}
                  >
                    {h.reason}
                  </p>
                </div>
              </div>

              {/* Right: allocation + amount + badge */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span
                  className="text-base font-bold tabular-nums"
                  style={{ color: '#001E62' }}
                >
                  {h.allocation_pct}%
                </span>
                <span className="text-[11px] tabular-nums" style={{ color: '#9ca3af' }}>
                  ${h.monthly_amount}/mo
                </span>
                <TypeBadge type={h.type} />
              </div>
            </div>
          ))}
        </div>

        {/* Allocation bar */}
        <AllocationBar holdings={suggested_holdings} />

        {/* First tip */}
        <div
          className="rounded-xl p-3 flex items-start gap-2"
          style={{ backgroundColor: '#f4f8fd' }}
        >
          <span style={{ color: '#6B96C3', marginTop: 1 }}>
            <LightbulbIcon />
          </span>
          <p className="text-xs leading-relaxed" style={{ color: '#374151' }}>
            <span className="font-semibold" style={{ color: '#001E62' }}>This week: </span>
            {first_tip}
          </p>
        </div>

        {/* Encouragement */}
        <p
          className="text-xs text-center italic"
          style={{ color: '#9ca3af' }}
        >
          {encouragement}
        </p>

        {/* CTA */}
        <button
          onClick={handleSaveToSim}
          className="w-full text-sm font-semibold py-3 rounded-xl transition-colors hover:opacity-90"
          style={{ backgroundColor: '#001E62', color: '#ffffff' }}
        >
          Add these to my simulation →
        </button>
      </div>

      {toast && <Toast message="Starter plan saved to your simulation!" />}
    </>
  )
}
