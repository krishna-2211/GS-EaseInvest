import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { postRebalance } from '../../api/rebalance'
import NavBar from '../../components/NavBar'
import ScenarioButtons from './ScenarioButtons'
import LoadingState from './LoadingState'
import RecommendationCard from './RecommendationCard'

export default function Rebalance() {
  const { currentUserId } = useApp()
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const submit = async (q) => {
    const trimmed = q?.trim()
    if (!trimmed) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await postRebalance(currentUserId, trimmed)
      setResult(res.data)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gs-bg">
      <NavBar />
      <main className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-gs-navy">Ask your financial companion</h1>
          <p className="text-sm text-gs-gray mt-1">
            Get plain-English advice for any situation
          </p>
        </div>

        <ScenarioButtons
          onSubmit={submit}
          question={question}
          setQuestion={setQuestion}
          loading={loading}
        />

        {loading && <LoadingState />}

        {error && !loading && (
          <div
            className="border border-red-200 rounded-2xl px-5 py-4"
            style={{ background: '#fdecea' }}
          >
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {result && !loading && <RecommendationCard result={result} />}
      </main>
    </div>
  )
}
