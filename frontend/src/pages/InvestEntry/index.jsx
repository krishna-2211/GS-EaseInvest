import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog'

// ─── Data ────────────────────────────────────────────────────────────────────

const STOCKS = [
  { name: 'Apple',   ticker: 'AAPL',  desc: 'One of the world\'s most stable and valuable companies',           risk: 'Low-Medium' },
  { name: 'Microsoft', ticker: 'MSFT', desc: 'Powers software and cloud services used by billions',              risk: 'Low-Medium' },
  { name: 'NVIDIA',  ticker: 'NVDA',  desc: 'Leading chip maker behind AI and gaming technology',               risk: 'Medium-High' },
]

const FUNDS = [
  { name: 'Vanguard S&P 500 ETF', ticker: 'VOO',   desc: 'Tracks the 500 biggest US companies — the most popular fund for beginners', risk: 'Low' },
  { name: 'Fidelity Growth Fund', ticker: 'FGRIX', desc: 'Focuses on companies expected to grow faster than average',                  risk: 'Medium' },
]

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

function RiskBadge({ risk }) {
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={RISK_STYLES[risk] ?? RISK_STYLES['Medium']}
    >
      {risk}
    </span>
  )
}

function OptionCard({ item }) {
  return (
    <div
      className="bg-white rounded-2xl p-4 flex flex-col gap-2"
      style={{ border: '1px solid #e8eff8' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm" style={{ color: '#001E62' }}>{item.name}</p>
          <p className="text-[11px] font-mono" style={{ color: '#666666' }}>{item.ticker}</p>
        </div>
        <RiskBadge risk={item.risk} />
      </div>
      <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>{item.desc}</p>
      <button
        className="self-start text-xs font-semibold px-3 py-1.5 rounded-lg mt-1 transition-colors"
        style={{ border: '1.5px solid #001E62', color: '#001E62', backgroundColor: 'transparent' }}
      >
        Add to portfolio
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvestEntry() {
  const [pending, setPending]   = useState(null)   // 'stocks' | 'funds' — which card was clicked, modal open
  const [selected, setSelected] = useState(null)   // 'stocks' | 'funds' — confirmed via modal

  const handleCardClick = (type) => setPending(type)

  const handleConfirm = () => {
    setSelected(pending)
    setPending(null)
  }

  const handleBack = () => setSelected(null)

  const options = selected === 'stocks' ? STOCKS : FUNDS
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
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#666666' }}>
              {selected === 'stocks' ? 'Stocks' : 'Mutual Funds'}
            </p>
            {options.map((item) => (
              <OptionCard key={item.ticker} item={item} />
            ))}
          </div>
        )}
      </main>

      {/* Explainer modal */}
      <Dialog open={!!pending} onOpenChange={(open) => { if (!open) setPending(null) }}>
        <DialogContent
          className="max-w-md rounded-2xl p-6"
          style={{ backgroundColor: '#ffffff', border: '1px solid #e8eff8' }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold" style={{ color: '#001E62' }}>
              {explainer?.heading}
            </DialogTitle>
            <DialogDescription
              className="text-sm leading-relaxed mt-2"
              style={{ color: '#666666' }}
            >
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
    </div>
  )
}
