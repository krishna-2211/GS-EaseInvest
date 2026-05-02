function AllocationBar({ label, pct, fillColor }) {
  const safePct = Math.min(100, Math.max(0, Number(pct) || 0))
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gs-gray">{label}</span>
        <span className="text-xs font-medium text-gs-navy">{safePct}% stocks</span>
      </div>
      <div className="w-full rounded-full" style={{ height: '8px', background: '#e2e8f0' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${safePct}%`, background: fillColor, borderRadius: '99px' }}
        />
      </div>
    </div>
  )
}

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
        className="rounded-xl px-5 py-5"
        style={{ background: '#e8f5ee', border: '1px solid #9fe1cb' }}
      >
        <p className="text-sm font-semibold text-gs-navy mb-2">You're all good</p>
        <p className="text-sm text-gs-gray leading-relaxed">{result.do_nothing_reason}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gs-pale/60 shadow-sm p-6 flex flex-col gap-4">
      {/* 1. Situation */}
      <p className="text-sm text-gs-gray leading-relaxed">{result.situation}</p>

      {/* 2. Recommendation */}
      <p className="text-sm font-semibold text-gs-navy leading-relaxed">{result.recommendation}</p>

      {/* 3. Before / After allocation bars */}
      <div className="flex flex-col gap-3">
        <AllocationBar label="Before" pct={result.before?.stocks_pct} fillColor="#001E62" />
        <AllocationBar label="After"  pct={result.after?.stocks_pct}  fillColor="#6B96C3" />
      </div>

      {/* 4. Goal impact */}
      <p className="text-sm italic text-gs-gray leading-relaxed mt-1">{result.goal_impact}</p>

      {/* 5. Cost */}
      <p className="text-xs text-gs-gray">
        Estimated cost · ${result.cost?.estimated_fee ?? 0} — {result.cost?.note}
      </p>

      {/* 6. Confidence badge */}
      <div>
        <span
          className="text-white font-semibold"
          style={{
            background: '#001E62',
            borderRadius: '99px',
            padding: '4px 12px',
            fontSize: '12px',
          }}
        >
          {result.confidence_pct}% confident
        </span>
      </div>
    </div>
  )
}
