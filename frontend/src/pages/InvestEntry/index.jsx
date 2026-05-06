import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { getStocksList, getFundsList } from '../../api/stocks'
import SimulatorPanel from '../../components/SimulatorPanel'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog'

// ─── Data ────────────────────────────────────────────────────────────────────

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

const STOCK_FILTERS = ['All', 'Technology', 'Finance', 'Healthcare', 'Consumer', 'Energy']
const FUND_FILTERS  = ['All', 'Index Fund', 'Growth', 'Bond', 'Dividend', 'International', 'Real Estate']

const EXPLAINERS = {
  stocks: {
    heading: 'What is a stock?',
    body: "When you buy a stock, you're buying a tiny piece of a real company. If the company does well, your piece becomes more valuable. Think of it like owning one brick in a building — the more valuable the building, the more your brick is worth.",
    confirm: 'Got it, show me stocks',
  },
  funds: {
    heading: 'What is a mutual fund?',
    body: "A mutual fund pools money from many people and invests it across lots of companies at once. Instead of picking one stock, you own a little bit of many — which spreads your risk. It's like ordering a combo meal instead of just one item.",
    confirm: 'Got it, show me funds',
  },
}

const RISK_STYLES = {
  'Low':         { backgroundColor: '#e8f5ee', color: '#0f6e56' },
  'Low-Medium':  { backgroundColor: '#e8f4fb', color: '#1d5a8a' },
  'Medium':      { backgroundColor: '#fef3c7', color: '#b45309' },
  'Medium-High': { backgroundColor: '#fff1e6', color: '#c2510f' },
  'High':        { backgroundColor: '#fee2e2', color: '#b91c1c' },
}

// ─── Animated Explainer Visuals ──────────────────────────────────────────────

function StockExplainerVisual() {
  return (
    <>
      <style>{`
        @keyframes gseiStockPulse {
          0%, 100% { transform: scale(1);   }
          50%      { transform: scale(1.1); }
        }
        .gsei-brick-hl {
          transform-box: fill-box;
          transform-origin: center;
          animation: gseiStockPulse 2s ease-in-out infinite;
        }
      `}</style>
      <svg width="100%" height="140" viewBox="0 0 300 140" preserveAspectRatio="xMidYMid meet">
        <rect x="78"  y="12" width="46" height="18" rx="3" fill="#acd4f1" />
        <rect x="127" y="12" width="46" height="18" rx="3" fill="#acd4f1" />
        <rect x="176" y="12" width="46" height="18" rx="3" fill="#acd4f1" />
        <rect x="78"  y="33" width="46" height="18" rx="3" fill="#acd4f1" />
        <rect x="127" y="33" width="46" height="18" rx="3" fill="#acd4f1" />
        <rect x="176" y="33" width="46" height="18" rx="3" fill="#acd4f1" />
        <rect x="78"  y="54" width="46" height="18" rx="3" fill="#acd4f1" />
        <rect x="127" y="54" width="46" height="18" rx="3" fill="#001E62" className="gsei-brick-hl" />
        <rect x="176" y="54" width="46" height="18" rx="3" fill="#acd4f1" />
        <rect x="78"  y="75" width="46" height="18" rx="3" fill="#acd4f1" />
        <rect x="127" y="75" width="46" height="18" rx="3" fill="#acd4f1" />
        <rect x="176" y="75" width="46" height="18" rx="3" fill="#acd4f1" />
        <rect x="78"  y="96" width="46" height="18" rx="3" fill="#acd4f1" />
        <rect x="127" y="96" width="46" height="18" rx="3" fill="#acd4f1" />
        <rect x="176" y="96" width="46" height="18" rx="3" fill="#acd4f1" />
        <line x1="177" y1="63" x2="224" y2="63" stroke="#001E62" strokeWidth="0.8" strokeDasharray="3,2" opacity="0.5" />
        <text x="226" y="63" fill="#001E62" fontSize="9" fontFamily="sans-serif" fontWeight="600" dominantBaseline="middle">
          ← Your piece
        </text>
        <text x="80"  y="130" fill="#888888" fontSize="9" fontFamily="sans-serif">You bought in at $30</text>
        <text x="184" y="130" fill="#16a34a" fontSize="9" fontFamily="sans-serif" fontWeight="600">Now worth $34.20 ↑</text>
      </svg>
    </>
  )
}

function FundExplainerVisual() {
  return (
    <>
      <style>{`
        @keyframes gseiCoin1 {
          0%, 20%   { transform: translate(0, 0);          opacity: 1; }
          48%       { transform: translate(40.7%, 33.3%);  opacity: 0; }
          49%, 78%  { transform: translate(0, 0);          opacity: 0; }
          93%, 100% { transform: translate(0, 0);          opacity: 1; }
        }
        @keyframes gseiCoin2 {
          0%, 20%   { transform: translate(0, 0);          opacity: 1; }
          48%       { transform: translate(40.7%, 0%);     opacity: 0; }
          49%, 78%  { transform: translate(0, 0);          opacity: 0; }
          93%, 100% { transform: translate(0, 0);          opacity: 1; }
        }
        @keyframes gseiCoin3 {
          0%, 20%   { transform: translate(0, 0);          opacity: 1; }
          48%       { transform: translate(40.7%, -33.3%); opacity: 0; }
          49%, 78%  { transform: translate(0, 0);          opacity: 0; }
          93%, 100% { transform: translate(0, 0);          opacity: 1; }
        }
        .gsei-coin-1 { transform-box: view-box; animation: gseiCoin1 3s ease-in-out 0s  infinite; }
        .gsei-coin-2 { transform-box: view-box; animation: gseiCoin2 3s ease-in-out 1s  infinite; }
        .gsei-coin-3 { transform-box: view-box; animation: gseiCoin3 3s ease-in-out 2s  infinite; }
      `}</style>
      <svg width="100%" height="120" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid meet">
        <circle cx="152" cy="60" r="28" fill="#001E62" />
        <text x="152" y="60" textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontSize="10" fontWeight="700" fontFamily="sans-serif">FUND</text>
        <g className="gsei-coin-1">
          <circle cx="30" cy="20" r="16" fill="#acd4f1" />
          <text x="30" y="20" textAnchor="middle" dominantBaseline="middle" fill="#001E62" fontSize="13" fontWeight="700" fontFamily="sans-serif">$</text>
        </g>
        <g className="gsei-coin-2">
          <circle cx="30" cy="60" r="16" fill="#acd4f1" />
          <text x="30" y="60" textAnchor="middle" dominantBaseline="middle" fill="#001E62" fontSize="13" fontWeight="700" fontFamily="sans-serif">$</text>
        </g>
        <g className="gsei-coin-3">
          <circle cx="30" cy="100" r="16" fill="#acd4f1" />
          <text x="30" y="100" textAnchor="middle" dominantBaseline="middle" fill="#001E62" fontSize="13" fontWeight="700" fontFamily="sans-serif">$</text>
        </g>
        <polyline points="185,55 193,60 185,65" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="198" y="55" fill="#16a34a" fontSize="9" fontFamily="sans-serif" fontWeight="600">Returns for</text>
        <text x="198" y="68" fill="#16a34a" fontSize="9" fontFamily="sans-serif" fontWeight="600">everyone</text>
      </svg>
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StockIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#e8f4fb" />
      <polyline points="6,22 12,14 18,18 26,8" stroke="#001E62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <polyline points="22,8 26,8 26,12" stroke="#001E62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function FundIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#e8f4fb" />
      <path d="M16 6 L26 26 L6 26 Z" stroke="#001E62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="16" y1="6" x2="16" y2="26" stroke="#acd4f1" strokeWidth="1.5" />
      <line x1="6"  y1="26" x2="26" y2="26" stroke="#001E62" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChoiceCard({ icon, title, description, primaryLabel, outlined, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col gap-4 bg-white rounded-2xl p-6 text-left transition-all w-full"
      style={{ border: `1px solid ${hovered ? '#6B96C3' : '#e8eff8'}` }}
    >
      {icon}
      <div className="flex flex-col gap-1.5 flex-1">
        <p className="font-semibold text-base" style={{ color: '#001E62' }}>{title}</p>
        <p className="text-sm leading-relaxed" style={{ color: '#666666' }}>{description}</p>
      </div>
      <span
        className="text-xs font-semibold px-4 py-2 rounded-lg self-start transition-colors"
        style={
          outlined
            ? { border: '1.5px solid #001E62', color: '#001E62', backgroundColor: 'transparent' }
            : { backgroundColor: '#001E62', color: '#ffffff' }
        }
      >
        {primaryLabel}
      </span>
    </button>
  )
}

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

function RiskBadge({ risk }) {
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
      style={RISK_STYLES[risk] ?? RISK_STYLES['Medium']}
    >
      {risk}
    </span>
  )
}

function FilterPills({ filters, active, onSelect }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map(f => (
        <button
          key={f}
          onClick={() => onSelect(f)}
          className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          style={
            f === active
              ? { backgroundColor: '#001E62', color: '#ffffff' }
              : { backgroundColor: '#ffffff', color: '#6B96C3', border: '1px solid #acd4f1' }
          }
        >
          {f}
        </button>
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 animate-pulse" style={{ border: '1px solid #e8eff8' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: '#e2e8f0' }} />
          <div className="flex flex-col gap-1.5">
            <div className="w-24 h-3 rounded" style={{ backgroundColor: '#e2e8f0' }} />
            <div className="w-12 h-2.5 rounded" style={{ backgroundColor: '#e2e8f0' }} />
          </div>
        </div>
        <div className="w-16 h-5 rounded-full" style={{ backgroundColor: '#e2e8f0' }} />
      </div>
      <div className="w-full h-2.5 rounded" style={{ backgroundColor: '#e2e8f0' }} />
      <div className="w-3/4 h-2.5 rounded" style={{ backgroundColor: '#e2e8f0' }} />
      <div className="flex items-center justify-between mt-1">
        <div className="w-14 h-3 rounded" style={{ backgroundColor: '#e2e8f0' }} />
        <div className="w-20 h-7 rounded-lg" style={{ backgroundColor: '#e2e8f0' }} />
      </div>
    </div>
  )
}

function OptionCard({ item, itemType, onSimulate }) {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-3" style={{ border: '1px solid #e8eff8' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <CompanyLogo ticker={item.ticker} />
          <div>
            <p className="font-semibold text-sm leading-tight" style={{ color: '#001E62' }}>{item.name}</p>
            <p className="text-[11px] font-mono mt-0.5" style={{ color: '#9ca3af' }}>{item.ticker}</p>
          </div>
        </div>
        <RiskBadge risk={item.risk} />
      </div>

      <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>{item.desc}</p>

      <div className="flex items-center justify-between">
        <div>
          {item.price_available ? (
            <span className="text-sm font-semibold tabular-nums" style={{ color: '#001E62' }}>
              ${item.price.toLocaleString()}
            </span>
          ) : (
            <span className="text-xs" style={{ color: '#9ca3af' }}>Price unavailable</span>
          )}
        </div>
        <button
          onClick={() => onSimulate({ ...item, itemType })}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{ border: '1.5px solid #001E62', color: '#001E62', backgroundColor: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#001E62'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#001E62' }}
        >
          Simulate
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvestEntry() {
  const { currentUser } = useApp()

  const [pending, setPending]           = useState(null)  // 'stocks' | 'funds' — explainer modal open
  const [selected, setSelected]         = useState(null)  // 'stocks' | 'funds' — confirmed
  const [items, setItems]               = useState([])
  const [loading, setLoading]           = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedStock, setSelectedStock] = useState(null)
  const [showSimulator, setShowSimulator] = useState(false)

  const handleCardClick = (type) => setPending(type)

  const handleConfirm = async () => {
    const type = pending
    setSelected(type)
    setPending(null)
    setActiveFilter('All')
    setItems([])
    setLoading(true)
    try {
      const data = type === 'stocks' ? await getStocksList() : await getFundsList()
      setItems(data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setSelected(null)
    setItems([])
    setActiveFilter('All')
    setShowSimulator(false)
    setSelectedStock(null)
  }

  const handleSimulateOpen = (item) => {
    setSelectedStock(item)
    setShowSimulator(true)
  }

  const filters = selected === 'stocks' ? STOCK_FILTERS : FUND_FILTERS
  const filteredItems = items.filter(item =>
    activeFilter === 'All' ||
    (selected === 'stocks' ? item.sector === activeFilter : item.type === activeFilter)
  )

  const explainer = EXPLAINERS[pending]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f8fd' }}>
      <main className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          {selected && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm mb-4 transition-opacity hover:opacity-70"
              style={{ color: '#001E62' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
          )}
          <h1 className="font-semibold text-xl" style={{ color: '#001E62' }}>
            Where would you like to invest?
          </h1>
          <p className="text-sm mt-1" style={{ color: '#666666' }}>
            Choose what feels right for you — we'll explain everything
          </p>
        </div>

        {/* Choice screen */}
        {!selected && (
          <div className="grid grid-cols-2 gap-4">
            <ChoiceCard
              icon={<StockIcon />}
              title="Stocks"
              description="Own a small piece of well-known, stable companies like Apple, Microsoft, and NVIDIA"
              primaryLabel="Explore Stocks"
              outlined={false}
              onClick={() => handleCardClick('stocks')}
            />
            <ChoiceCard
              icon={<FundIcon />}
              title="Mutual Funds"
              description="A ready-made basket of investments managed by experts — great for steady, long-term growth"
              primaryLabel="Explore Funds"
              outlined={true}
              onClick={() => handleCardClick('funds')}
            />
          </div>
        )}

        {/* Options list (after modal confirmed) */}
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#666666' }}>
                {selected === 'stocks' ? 'Stocks' : 'Mutual Funds'}
              </p>
              {!loading && items.length > 0 && (
                <span className="text-xs" style={{ color: '#9ca3af' }}>
                  {filteredItems.length} of {items.length}
                </span>
              )}
            </div>

            {/* Filter pills */}
            {!loading && items.length > 0 && (
              <FilterPills filters={filters} active={activeFilter} onSelect={setActiveFilter} />
            )}

            {/* Skeletons while loading */}
            {loading && (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Live cards */}
            {!loading && (
              <div className="flex flex-col gap-3">
                {filteredItems.map(item => (
                  <OptionCard
                    key={item.ticker}
                    item={item}
                    itemType={selected === 'stocks' ? 'stock' : 'fund'}
                    onSimulate={handleSimulateOpen}
                  />
                ))}
                {filteredItems.length === 0 && (
                  <p className="text-sm text-center py-8" style={{ color: '#9ca3af' }}>
                    No {selected} in this category.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Explainer modal */}
      <Dialog open={!!pending} onOpenChange={(open) => { if (!open) setPending(null) }}>
        <DialogContent
          className="max-w-md rounded-2xl p-6"
          style={{ backgroundColor: '#ffffff', border: '1px solid #e8eff8' }}
        >
          <div className="rounded-xl overflow-hidden mb-4" style={{ backgroundColor: '#f4f8fd' }}>
            {pending === 'stocks' ? <StockExplainerVisual /> : <FundExplainerVisual />}
          </div>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold" style={{ color: '#001E62' }}>
              {explainer?.heading}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed mt-2" style={{ color: '#666666' }}>
              {explainer?.body}
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={handleConfirm}
            className="w-full text-sm font-semibold py-2.5 rounded-xl mt-2 transition-colors hover:opacity-90"
            style={{ backgroundColor: '#001E62', color: '#ffffff' }}
          >
            {explainer?.confirm}
          </button>
        </DialogContent>
      </Dialog>

      {showSimulator && selectedStock && (
        <SimulatorPanel
          stock={selectedStock}
          userId={currentUser.user_id}
          type={selectedStock.itemType}
          onClose={() => setShowSimulator(false)}
        />
      )}
    </div>
  )
}
