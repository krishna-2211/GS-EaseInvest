import { formatPct } from '../../utils/format'

function AllocationBar({ label, pct, barClass }) {
  const safePct = Math.min(100, Math.max(0, pct ?? 0))
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gs-gray">
        <span>{label}</span>
        <span>{formatPct(safePct)} in stocks</span>
      </div>
      <div className="w-full bg-gs-bg rounded-full" style={{ height: '8px' }}>
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{ width: `${safePct}%` }}
        />
      </div>
    </div>
  )
}

export default function RecommendationCard({ result }) {
  if (result?.error) {
    return (
      <div
        className="border border-red-200 rounded-2xl px-5 py-4"
        style={{ background: '#fdecea' }}
      >
        <p className="text-sm text-red-700">{result.message}</p>
      </div>
    )
  }

  if (result?.do_nothing) {
    return (
      <div
        className="border rounded-2xl px-5 py-5"
        style={{ background: '#e8f5ee', borderColor: '#9fe1cb' }}
      >
        <p className="text-sm font-bold text-green-800 mb-2">You're all good</p>
        <p className="text-sm text-green-700 leading-relaxed">{result.do_nothing_reason}</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gs-pale/60 rounded-2xl shadow-sm p-6 flex flex-col gap-4">
      {/* 1. Situation */}
      <p className="text-sm text-gs-gray leading-relaxed">{result.situation}</p>

      {/* 2. Recommendation */}
      <p className="text-sm font-bold text-gs-navy leading-relaxed">{result.recommendation}</p>

      {/* 3. Before / After allocation bars */}
      <div className="flex flex-col gap-3">
        <AllocationBar
          label="Before"
          pct={result.before?.stocks_pct}
          barClass="bg-gs-navy"
        />
        <AllocationBar
          label="After"
          pct={result.after?.stocks_pct}
          barClass="bg-gs-blue"
        />
      </div>

      {/* 4. Goal impact */}
      <p className="text-sm italic text-gs-gray leading-relaxed">{result.goal_impact}</p>

      {/* 5. Cost */}
      <p className="text-xs text-gs-gray">
        Estimated cost · ${result.cost?.estimated_fee ?? 0}&nbsp;&nbsp;{result.cost?.note}
      </p>

      {/* 6. Confidence badge */}
      <div>
        <span className="inline-block bg-gs-navy text-white text-xs font-semibold px-3 py-1 rounded-full">
          {result.confidence_pct}% confident
        </span>
      </div>
    </div>
  )
}
