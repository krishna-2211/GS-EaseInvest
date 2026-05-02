const PRESETS = [
  'What if markets drop 20%?',
  'What if inflation stays high?',
  'What if I need money next year?',
]

export default function ScenarioButtons({ onSubmit, question, setQuestion, loading }) {
  return (
    <div className="flex flex-col gap-3">
      {PRESETS.map((preset) => (
        <button
          key={preset}
          onClick={() => onSubmit(preset)}
          disabled={loading}
          className="w-full text-left bg-gs-bg border border-gs-pale text-gs-navy rounded-xl px-4 py-3 text-sm font-medium hover:border-gs-blue transition-colors disabled:opacity-50"
        >
          {preset}
        </button>
      ))}

      <div className="flex gap-2 mt-1">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit(question)}
          placeholder="Or ask your own question…"
          className="flex-1 bg-gs-bg border border-gs-pale rounded-xl px-3 py-3 text-sm text-gs-navy placeholder:text-gs-gray focus:outline-none focus:ring-2 focus:ring-gs-blue"
        />
        <button
          onClick={() => onSubmit(question)}
          disabled={!question.trim() || loading}
          className="bg-gs-navy text-white text-sm font-semibold px-4 py-3 rounded-xl hover:bg-gs-deep transition-colors disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  )
}
