import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/NavBar'

const OPTIONS = [
  {
    key: 'stocks',
    icon: '📈',
    title: 'Stocks',
    plain: 'You buy a tiny piece of a company. If the company does well, your piece grows in value.',
  },
  {
    key: 'mutual_funds',
    icon: '🧺',
    title: 'Mutual Funds',
    plain:
      'A pool of money from many investors, managed by a professional who spreads it across many companies for you.',
  },
]

export default function InvestEntry() {
  const [popupKey, setPopupKey] = useState(null)
  const navigate = useNavigate()

  const selected = OPTIONS.find((o) => o.key === popupKey)

  return (
    <div className="min-h-screen bg-gs-bg">
      <NavBar />
      <main className="max-w-md mx-auto px-4 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-gs-navy">What would you like to invest in?</h1>
          <p className="text-gs-gray text-sm mt-1">Tap an option to learn what it means first.</p>
        </div>

        <div className="flex flex-col gap-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPopupKey(opt.key)}
              className="flex items-center gap-4 bg-white border border-gs-pale/60 shadow-sm rounded-2xl px-5 py-4 text-left hover:border-gs-blue transition-colors"
            >
              <span className="text-3xl">{opt.icon}</span>
              <div>
                <p className="font-semibold text-gs-navy">{opt.title}</p>
                <p className="text-xs text-gs-gray mt-0.5">Tap to learn more before deciding</p>
              </div>
            </button>
          ))}
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 bg-gs-navy/40 flex items-end justify-center sm:items-center z-20">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selected.icon}</span>
              <h2 className="text-lg font-bold text-gs-navy">{selected.title}</h2>
            </div>
            <p className="text-gs-grayMid text-sm leading-relaxed">{selected.plain}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setPopupKey(null)}
                className="flex-1 border border-gs-pale text-gs-navy text-sm font-semibold py-2.5 rounded-xl hover:bg-gs-bg transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => navigate(`/invest/${selected.key}`)}
                className="flex-1 bg-gs-navy hover:bg-gs-deep text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                Show {selected.title}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
