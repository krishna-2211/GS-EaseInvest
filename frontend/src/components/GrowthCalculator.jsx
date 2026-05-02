import { useState } from 'react'

export default function GrowthCalculator() {
  const [monthly, setMonthly] = useState(200)
  const [years, setYears] = useState(10)

  const result = Math.round(monthly * 12 * ((Math.pow(1.07, years) - 1) / 0.07))
  const totalIn = monthly * 12 * years
  const profit = result - totalIn

  const fmt = (n) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-5" style={{ border: '1px solid #e8eff8' }}>
      {/* Header */}
      <div>
        <p className="font-semibold" style={{ color: '#001E62', fontSize: 18 }}>
          What could your money grow to?
        </p>
        <p className="mt-1" style={{ color: '#666666', fontSize: 13 }}>
          Drag the sliders to see your future
        </p>
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-5">
        {/* Monthly amount */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: '#666666' }}>I can invest per month</span>
            <span className="text-sm font-bold" style={{ color: '#001E62' }}>${monthly}</span>
          </div>
          <input
            type="range"
            min={50}
            max={1000}
            step={50}
            value={monthly}
            onChange={(e) => setMonthly(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: '#001E62' }}
          />
          <div className="flex justify-between text-xs" style={{ color: '#acd4f1' }}>
            <span>$50</span>
            <span>$1,000</span>
          </div>
        </div>

        {/* Years */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: '#666666' }}>For this many years</span>
            <span className="text-sm font-bold" style={{ color: '#001E62' }}>{years} years</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: '#001E62' }}
          />
          <div className="flex justify-between text-xs" style={{ color: '#acd4f1' }}>
            <span>1 yr</span>
            <span>30 yrs</span>
          </div>
        </div>
      </div>

      {/* Result card */}
      <div className="rounded-xl p-5 flex flex-col gap-1" style={{ backgroundColor: '#001E62' }}>
        <p className="font-bold tabular-nums" style={{ color: '#ffffff', fontSize: 32 }}>
          {fmt(result)}
        </p>
        <p style={{ color: '#acd4f1', fontSize: 13 }}>
          is what ${monthly}/month could become in {years} {years === 1 ? 'year' : 'years'}
        </p>
        <p className="mt-1" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
          Based on 7% average yearly growth
        </p>

        {/* Comparison row */}
        <div className="flex gap-5 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
            You put in: <span className="font-semibold text-white">{fmt(totalIn)}</span>
          </span>
          <span style={{ fontSize: 12 }}>
            Your growth:{' '}
            <span className="font-semibold" style={{ color: '#4ade80' }}>{fmt(profit)}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
