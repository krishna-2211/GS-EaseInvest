import { PieChart, Pie, Cell } from 'recharts'

// ─── Checkmark circle ─────────────────────────────────────────────────────────

function CheckCircle() {
  return (
    <div
      className="flex items-center justify-center rounded-full mx-auto"
      style={{ width: 48, height: 48, background: '#22c55e', flexShrink: 0 }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polyline
          points="20 6 9 17 4 12"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// ─── Confidence badge (pill) ──────────────────────────────────────────────────

function ConfidenceBadge({ pct }) {
  const safe = Math.min(100, Math.max(0, Number(pct) || 0))
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-sm font-medium"
      style={{ background: '#001E62', color: '#fff' }}
    >
      {safe}% confident
    </span>
  )
}

// ─── Donut charts ─────────────────────────────────────────────────────────────

const SLICE_COLORS = ['#001E62', '#6B96C3']

function makeSlices(stocks_pct, funds_pct) {
  const s = Math.min(100, Math.max(0, Number(stocks_pct) || 0))
  const f = Math.min(100, Math.max(0, Number(funds_pct) || 0))
  if (s === 0 && f === 0) return [{ name: '', value: 100, empty: true }]
  return [
    { name: 'Stocks',       value: s },
    { name: 'Mutual Funds', value: f },
  ]
}

function sliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) {
  if (!name || value < 8) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x} y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontWeight="700"
    >
      {value}%
    </text>
  )
}

function DonutChart({ label, stocks_pct, funds_pct }) {
  const slices = makeSlices(stocks_pct, funds_pct)
  console.log(`[DonutChart "${label}"] stocks_pct=${stocks_pct} (${typeof stocks_pct}), funds_pct=${funds_pct} (${typeof funds_pct}), slices:`, slices)
  return (
    <div className="flex flex-col items-center gap-2">
      <PieChart width={140} height={140}>
        <Pie
          data={slices}
          dataKey="value"
          innerRadius={40}
          outerRadius={60}
          labelLine={false}
          label={sliceLabel}
        >
          {slices.map((s, i) => (
            <Cell key={i} fill={s.empty ? '#e2e8f0' : SLICE_COLORS[i % 2]} />
          ))}
        </Pie>
      </PieChart>
      <span className="text-xs font-medium" style={{ color: '#6b7280' }}>{label}</span>
    </div>
  )
}

function AllocationSection({ before, after }) {
  console.log('[AllocationSection] before:', before, '| after:', after)
  return (
    <div className="flex flex-col gap-3">
      <p
        className="text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: '#9ca3af' }}
      >
        How your money would shift
      </p>
      <div className="flex justify-around">
        <DonutChart
          label="Before"
          stocks_pct={before?.stocks_pct}
          funds_pct={before?.mutual_funds_pct}
        />
        <DonutChart
          label="After"
          stocks_pct={after?.stocks_pct}
          funds_pct={after?.mutual_funds_pct}
        />
      </div>
      <div className="flex justify-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#001E62' }} />
          <span className="text-xs" style={{ color: '#6b7280' }}>Stocks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#6B96C3' }} />
          <span className="text-xs" style={{ color: '#6b7280' }}>Funds</span>
        </div>
      </div>
    </div>
  )
}

// ─── Trade actions (sell / buy) ───────────────────────────────────────────────

function TradeSection({ sell = [], buy = [] }) {
  if (!sell.length && !buy.length) return null
  return (
    <div className="flex flex-col gap-3">
      <p
        className="text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: '#9ca3af' }}
      >
        What to do with your money
      </p>

      {sell.length > 0 && (
        <div className="flex flex-col gap-2">
          <p
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: '#ef4444' }}
          >
            Consider selling
          </p>
          {sell.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl flex flex-col gap-1"
              style={{ border: '1px solid #f5c6c6', padding: 12 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: '#001E62' }}>{item.name}</span>
                <span className="text-sm font-semibold tabular-nums" style={{ color: '#ef4444' }}>
                  -${item.amount}
                </span>
              </div>
              {item.reason && (
                <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>{item.reason}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {buy.length > 0 && (
        <div className="flex flex-col gap-2">
          <p
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: '#22c55e' }}
          >
            Consider buying
          </p>
          {buy.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl flex flex-col gap-1"
              style={{ border: '1px solid #9fe1cb', padding: 12 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: '#001E62' }}>{item.name}</span>
                <span className="text-sm font-semibold tabular-nums" style={{ color: '#22c55e' }}>
                  +${item.amount}
                </span>
              </div>
              {item.reason && (
                <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>{item.reason}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Weight change reasons ────────────────────────────────────────────────────

function WeightChangeReasons({ items = [] }) {
  if (!items.length) return null
  return (
    <div className="flex flex-col gap-3">
      <p
        className="text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: '#9ca3af' }}
      >
        Why we suggest this
      </p>
      <div className="flex flex-col">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex flex-col gap-0.5"
            style={{
              borderLeft: '2px solid #acd4f1',
              paddingLeft: 12,
              marginBottom: i < items.length - 1 ? 8 : 0,
            }}
          >
            <span className="text-sm font-bold" style={{ color: '#001E62' }}>{item.asset}</span>
            {item.change && (
              <span className="text-xs" style={{ color: '#9ca3af' }}>{item.change}</span>
            )}
            {item.reason && (
              <p className="text-xs italic leading-relaxed" style={{ color: '#6b7280' }}>{item.reason}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Cost card ────────────────────────────────────────────────────────────────

function CostCard({ cost }) {
  const fee  = cost?.estimated_fee ?? 0
  const free = fee === 0
  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-1"
      style={{
        background: free ? '#e8f5ee' : '#fff8e1',
        border:     `1px solid ${free ? '#9fe1cb' : '#f59e0b'}`,
      }}
    >
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 15 }}>{free ? '✅' : '⚠️'}</span>
        <p className="text-sm font-semibold" style={{ color: free ? '#0f6e56' : '#b45309' }}>
          {free ? 'No cost to you' : `Estimated cost: $${fee}`}
        </p>
      </div>
      {cost?.note && (
        <p className="text-xs leading-relaxed pl-6" style={{ color: '#9ca3af' }}>{cost.note}</p>
      )}
    </div>
  )
}

// ─── Confidence meter ─────────────────────────────────────────────────────────

function ConfidenceMeter({ pct, reason }) {
  const safe = Math.min(100, Math.max(0, Number(pct) || 0))
  const fill = safe >= 80 ? '#22c55e' : safe >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium" style={{ color: '#9ca3af' }}>How confident are we?</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-full" style={{ height: 8, background: '#e2e8f0' }}>
          <div
            className="h-full transition-all"
            style={{ width: `${safe}%`, background: fill, borderRadius: 99 }}
          />
        </div>
        <span
          className="text-xs font-semibold tabular-nums"
          style={{ color: fill, minWidth: 28 }}
        >
          {safe}%
        </span>
      </div>
      {reason && (
        <p className="text-xs italic leading-relaxed" style={{ color: '#9ca3af' }}>{reason}</p>
      )}
    </div>
  )
}

// ─── Main card ────────────────────────────────────────────────────────────────

export default function RecommendationCard({ result }) {
  if (result?.error) {
    return (
      <div
        className="rounded-xl px-5 py-4"
        style={{ background: '#fdecea', border: '1px solid #f5c6c6' }}
      >
        <p className="text-sm" style={{ color: '#a32d2d' }}>{result.message}</p>
      </div>
    )
  }

  if (result?.do_nothing) {
    return (
      <div
        className="rounded-xl flex flex-col items-center gap-4 text-center"
        style={{ background: '#e8f5ee', border: '1px solid #9fe1cb', padding: 24 }}
      >
        <CheckCircle />
        <p className="font-semibold" style={{ color: '#001E62', fontSize: 20 }}>
          You're all good
        </p>
        <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
          {result.do_nothing_reason}
        </p>
        {result.confidence_pct != null && (
          <div className="flex flex-col items-center gap-1.5">
            <ConfidenceBadge pct={result.confidence_pct} />
            {result.confidence_reason && (
              <p className="text-xs italic" style={{ color: '#9ca3af' }}>
                {result.confidence_reason}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className="bg-white rounded-xl flex flex-col gap-5"
      style={{ border: '1px solid #acd4f1', padding: 24 }}
    >
      {/* You asked */}
      {result.question && (
        <div className="flex flex-col gap-0.5">
          <p className="text-xs" style={{ color: '#9ca3af' }}>You asked:</p>
          <p className="text-sm italic font-medium" style={{ color: '#001E62' }}>
            {result.question}
          </p>
        </div>
      )}

      {/* Situation */}
      <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{result.situation}</p>

      {/* Recommendation */}
      <p className="font-bold leading-relaxed" style={{ color: '#001E62', fontSize: 16 }}>
        {result.recommendation}
      </p>

      {/* Before / After donuts */}
      <AllocationSection before={result.before} after={result.after} />

      {/* Sell / Buy actions */}
      <TradeSection sell={result.sell ?? []} buy={result.buy ?? []} />

      {/* Weight change explanations */}
      <WeightChangeReasons items={result.weight_change_reasons ?? []} />

      {/* Goal impact */}
      {result.goal_impact && (
        <p className="text-sm italic leading-relaxed" style={{ color: '#6b7280' }}>
          {result.goal_impact}
        </p>
      )}

      {/* Cost card */}
      <CostCard cost={result.cost} />

      {/* Confidence meter */}
      <ConfidenceMeter pct={result.confidence_pct} reason={result.confidence_reason} />
    </div>
  )
}
