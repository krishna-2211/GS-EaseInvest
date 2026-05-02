import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { postRebalance } from '../../api/rebalance'
import ScenarioButtons from './ScenarioButtons'
import LoadingState from './LoadingState'
import RecommendationCard from './RecommendationCard'

export default function Rebalance() {
  const { currentUser } = useApp()
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const submit = async (q) => {
    const trimmed = (q ?? '').trim()
    if (!trimmed) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await postRebalance(currentUser.user_id, trimmed)
      setResult(res.data)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gs-bg">
      <main className="max-w-xl mx-auto px-4 py-8 flex flex-col" style={{ gap: '0' }}>
        <h1
          className="font-semibold"
          style={{ color: '#001E62', fontSize: '24px', marginBottom: '6px' }}
        >
          Ask your financial companion
        </h1>
        <p className="text-gs-gray" style={{ fontSize: '14px', marginBottom: '24px' }}>
          Get plain-English advice for any situation
        </p>

        <ScenarioButtons
          onSubmit={submit}
          question={question}
          setQuestion={setQuestion}
          loading={loading}
        />

        {loading && <LoadingState />}

        {error && !loading && (
          <div
            className="rounded-xl px-5 py-4 mt-6"
            style={{ background: '#fdecea', border: '1px solid #f5c6c6' }}
          >
            <p className="text-sm" style={{ color: '#a32d2d' }}>{error}</p>
          </div>
        )}

        {result && !loading && (
          <div className="mt-6">
            <RecommendationCard result={result} />
          </div>
        )}
      </main>
    </div>
  )
}
