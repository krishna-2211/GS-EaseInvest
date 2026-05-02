import { PieChart, Pie, Cell } from 'recharts'

// ─── Situation icon ───────────────────────────────────────────────────────────

function SituationIcon({ question = '' }) {
  const q = question.toLowerCase()
  let icon = '🧭'
  if (q.includes('drop') || q.includes('market'))        icon = '🛡️'
  else if (q.includes('inflation'))                       icon = '🔥'
  else if (q.includes('withdraw') || q.includes('money')) icon = '👛'

  return (
    <div className="flex flex-col items-center gap-2">
      <span style={{ fontSize: 40, lineHeight: 1 }}>{icon}</span>
      {question && (
        <p className="text-xs italic text-center" style={{ color: '#001E62' }}>
          You asked: {question}
        </p>
      )}
    </div>
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
      fontSize={9}
      fontWeight="700"
    >
      {value}%
    </text>
  )
}

function DonutChart({ label, stocks_pct, funds_pct }) {
  const slices = makeSlices(stocks_pct, funds_pct)
  return (
    <div className="flex flex-col items-center gap-1">
      <PieChart width={120} height={120}>
        <Pie
          data={slices}
          dataKey="value"
          innerRadius={30}
          outerRadius={52}
          labelLine={false}
          label={sliceLabel}
        >
          {slices.map((s, i) => (
            <Cell key={i} fill={s.empty ? '#e2e8f0' : SLICE_COLORS[i % 2]} />
          ))}
        </Pie>
      </PieChart>
      <span className="text-xs text-gs-gray">{label}</span>
    </div>
  )
}

function AllocationSection({ before, after }) {
  return (
    <div className="flex flex-col gap-3">
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
          <span className="text-xs text-gs-gray">Stocks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#6B96C3' }} />
          <span className="text-xs text-gs-gray">Mutual Funds</span>
        </div>
      </div>
    </div>
  )
}

// ─── Confidence meter ─────────────────────────────────────────────────────────

function ConfidenceMeter({ pct, reason }) {
  const safePct = Math.min(100, Math.max(0, Number(pct) || 0))
  const fill = safePct >= 80 ? '#22c55e' : safePct >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-gs-gray">How confident are we?</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-full" style={{ height: 8, background: '#e2e8f0' }}>
          <div
            className="h-full transition-all"
            style={{ width: `${safePct}%`, background: fill, borderRadius: 99 }}
          />
        </div>
        <span className="text-xs font-semibold tabular-nums" style={{ color: fill, minWidth: 28 }}>
          {safePct}%
        </span>
      </div>
      {reason && (
        <p className="text-xs italic text-gs-gray leading-relaxed">{reason}</p>
      )}
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
        <p className="text-xs text-gs-gray leading-relaxed pl-6">{cost.note}</p>
      )}
    </div>
  )
}

// ─── Goal progress ────────────────────────────────────────────────────────────

function GoalProgress({ salaryMonths, goalYears }) {
  if (!salaryMonths || !goalYears) return null
  const pct = Math.min(100, Math.round((Number(salaryMonths) / (Number(goalYears) * 12)) * 100))
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-gs-gray">Goal progress</p>
      <div className="w-full rounded-full" style={{ height: 6, background: '#e2e8f0' }}>
        <div
          className="h-full transition-all"
          style={{ width: `${pct}%`, background: '#6B96C3', borderRadius: 99 }}
        />
      </div>
      <p className="text-xs text-gs-gray">You're {pct}% of the way there</p>
    </div>
  )
}

// ─── Main card ────────────────────────────────────────────────────────────────

export default function RecommendationCard({ result }) {
  if (result?.error) {
    return (
      <div className="rounded-xl px-5 py-4" style={{ background: '#fdecea', border: '1px solid #f5c6c6' }}>
        <p className="text-sm" style={{ color: '#a32d2d' }}>{result.message}</p>
      </div>
    )
  }

  if (result?.do_nothing) {
    return (
      <div className="rounded-xl px-5 py-5" style={{ background: '#e8f5ee', border: '1px solid #9fe1cb' }}>
        <p className="text-sm font-semibold text-gs-navy mb-2">You're all good</p>
        <p className="text-sm text-gs-gray leading-relaxed">{result.do_nothing_reason}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gs-pale/60 shadow-sm p-6 flex flex-col gap-5">

      {/* Icon + question */}
      <SituationIcon question={result.question} />

      {/* Situation */}
      <p className="text-sm text-gs-gray leading-relaxed">{result.situation}</p>

      {/* Recommendation */}
      <p className="text-sm font-semibold text-gs-navy leading-relaxed">{result.recommendation}</p>

      {/* Before / After donuts */}
      <AllocationSection before={result.before} after={result.after} />

      {/* Goal impact + progress */}
      <div className="flex flex-col gap-2">
        <p className="text-sm italic text-gs-gray leading-relaxed">{result.goal_impact}</p>
        <GoalProgress
          salaryMonths={result.salary_months_equivalent}
          goalYears={result.goal_years}
        />
      </div>

      {/* Cost card */}
      <CostCard cost={result.cost} />

      {/* Confidence meter */}
      <ConfidenceMeter pct={result.confidence_pct} reason={result.confidence_reason} />

    </div>
  )
}
