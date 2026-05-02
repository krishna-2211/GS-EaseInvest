const PRESETS = [
  'What if markets drop 20%?',
  'What if inflation stays high?',
  'What if I need money next year?',
]

export default function ScenarioButtons({ onSubmit, question, setQuestion, loading }) {
  const handlePreset = (preset) => {
    setQuestion(preset)
    onSubmit(preset)
  }

  return (
    <div className="flex flex-col gap-3">
      {PRESETS.map((preset) => (
        <button
          key={preset}
          onClick={() => handlePreset(preset)}
          disabled={loading}
          className="w-full text-left rounded-xl px-4 py-3 text-sm font-medium text-gs-navy
                     border border-gs-pale bg-gs-bg
                     hover:border-gs-blue transition-colors disabled:opacity-50"
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
          className="flex-1 rounded-xl border border-gs-pale bg-gs-bg text-sm text-gs-navy
                     placeholder:text-gs-gray focus:outline-none focus:ring-2 focus:ring-gs-blue"
          style={{ padding: '12px' }}
        />
        <button
          onClick={() => onSubmit(question)}
          disabled={!question.trim() || loading}
          className="bg-gs-navy hover:bg-gs-deep text-white text-sm font-semibold
                     rounded-xl px-5 transition-colors disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  )
}
