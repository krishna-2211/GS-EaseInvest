import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { postRebalance } from '../../api/rebalance'
import NavBar from '../../components/NavBar'
import LoadingState from '../../components/LoadingState'

const PRESETS = [
  { label: 'Am I too heavy in stocks?', question: 'Am I too heavy in stocks?' },
  { label: 'Should I add more debt?', question: 'Should I add more debt?' },
  { label: 'Is my portfolio balanced for my age?', question: 'Is my portfolio balanced for my age?' },
]

export default function Rebalance() {
  const { currentUserId } = useApp()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const submit = async (question) => {
    if (!question.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await postRebalance(currentUserId, question)
      setResult(res.data)
    } catch {
      setError('Could not get a recommendation. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gs-bg">
      <NavBar />
      <main className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-gs-navy">Rebalance your portfolio</h1>
          <p className="text-gs-gray text-sm mt-1">
            Ask a question and get a plain-English suggestion.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => submit(p.question)}
              className="text-left bg-white border border-gs-pale/60 shadow-sm rounded-xl px-4 py-3 text-sm text-gs-navy hover:border-gs-blue transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit(input)}
            placeholder="Or ask your own question…"
            className="flex-1 border border-gs-pale rounded-xl px-4 py-2.5 text-sm text-gs-navy placeholder:text-gs-gray focus:outline-none focus:ring-2 focus:ring-gs-blue bg-white"
          />
          <button
            onClick={() => submit(input)}
            disabled={!input.trim() || loading}
            className="bg-gs-navy hover:bg-gs-deep disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            Ask
          </button>
        </div>

        {loading && <LoadingState />}

        {error && (
          <div className="bg-gs-pale/20 border border-gs-pale text-gs-deep text-sm rounded-xl px-5 py-4">
            {error}
          </div>
        )}

        {result && !loading && (
          <div className="bg-white border border-gs-pale/60 rounded-2xl shadow-sm p-6 flex flex-col gap-3">
            <p className="text-xs text-gs-blue font-semibold uppercase tracking-wide">
              Recommendation
            </p>
            <p className="text-gs-navy text-sm leading-relaxed">{result.recommendation}</p>
            {result.actions?.length > 0 && (
              <ul className="flex flex-col gap-1.5 mt-1">
                {result.actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gs-grayMid">
                    <span className="text-gs-blue mt-0.5">•</span>
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
