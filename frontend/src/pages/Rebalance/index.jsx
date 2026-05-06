import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { sendMessage } from '../../api/rebalanceChat'

const PRESETS = [
  'What if markets drop 20%?',
  'What if inflation stays high?',
  'What if I need money next year?',
]

// ─── Inline recommendation card (chat-specific, simpler than RecommendationCard) ─

function ChatRecommendation({ rec }) {
  if (!rec) return null
  const fill = rec.confidence_pct >= 80 ? '#22c55e' : rec.confidence_pct >= 60 ? '#f59e0b' : '#ef4444'
  const safe = Math.min(100, Math.max(0, Number(rec.confidence_pct) || 0))
  return (
    <div
      className="mt-2 rounded-xl p-4 flex flex-col gap-3"
      style={{ backgroundColor: '#f4f8fd', border: '1px solid #acd4f1' }}
    >
      <div className="flex flex-col gap-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>
          Situation
        </p>
        <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{rec.situation}</p>
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>
          Action
        </p>
        <p className="text-sm font-semibold" style={{ color: '#001E62' }}>{rec.action}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-full" style={{ height: 6, background: '#e2e8f0' }}>
          <div style={{ width: `${safe}%`, background: fill, height: '100%', borderRadius: 99 }} />
        </div>
        <span className="text-xs font-semibold tabular-nums" style={{ color: fill }}>{safe}%</span>
        <span className="text-xs" style={{ color: '#9ca3af' }}>confident</span>
      </div>
    </div>
  )
}

// ─── Animated thinking bubble ─────────────────────────────────────────────────

function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-2"
        style={{ backgroundColor: '#ffffff', border: '1px solid #e8eff8' }}
      >
        <span className="text-xs" style={{ color: '#9ca3af' }}>Thinking about your question</span>
        <span className="flex gap-0.5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ backgroundColor: '#6B96C3', animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Rebalance() {
  const { currentUser } = useApp()
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const messagesEndRef = useRef(null)

  const showPresets = messages.length === 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg = { role: 'user', content: trimmed }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      // Strip local-only `recommendation` field before sending to API
      const apiMessages = nextMessages.map(({ role, content }) => ({ role, content }))
      const response = await sendMessage(currentUser.user_id, apiMessages)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.reply,
        recommendation: response.has_recommendation ? response.recommendation : null,
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        recommendation: null,
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-5"
      style={{ minHeight: 'calc(100vh - 120px)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bold" style={{ color: '#001E62', fontSize: 22 }}>
            Your financial companion
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>
            Ask anything about your money
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shrink-0"
            style={{ border: '1px solid #acd4f1', color: '#6B96C3', backgroundColor: '#f4f8fd' }}
          >
            New conversation
          </button>
        )}
      </div>

      {/* Preset buttons */}
      {showPresets && (
        <div className="flex flex-col gap-2">
          {PRESETS.map(preset => (
            <button
              key={preset}
              onClick={() => send(preset)}
              className="w-full text-left rounded-xl px-4 py-3 text-sm font-medium transition-colors"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e8eff8',
                color: '#001E62',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#acd4f1'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e8eff8'}
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      {/* Chat window */}
      {messages.length > 0 && (
        <div
          className="flex flex-col gap-4 overflow-y-auto rounded-2xl p-4"
          style={{ maxHeight: '60vh', backgroundColor: '#f4f8fd', border: '1px solid #e8eff8' }}
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={msg.role === 'user' ? 'max-w-xs' : 'max-w-sm w-full'}>
                <div
                  className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={
                    msg.role === 'user'
                      ? { backgroundColor: '#001E62', color: '#ffffff' }
                      : { backgroundColor: '#ffffff', border: '1px solid #e8eff8', color: '#001E62' }
                  }
                >
                  {msg.content}
                </div>
                {msg.role === 'assistant' && msg.recommendation && (
                  <ChatRecommendation rec={msg.recommendation} />
                )}
              </div>
            </div>
          ))}

          {loading && <ThinkingBubble />}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2 mt-auto">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="Ask a follow-up or a new question…"
          className="flex-1 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-gs-blue"
          style={{
            padding: '12px 16px',
            borderColor: '#e8eff8',
            backgroundColor: '#ffffff',
            color: '#001E62',
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="text-sm font-semibold rounded-xl px-5 transition-colors disabled:opacity-40"
          style={{ backgroundColor: '#001E62', color: '#ffffff' }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
