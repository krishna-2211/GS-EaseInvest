import { useState } from 'react'

const QUESTIONS = [
  {
    id: 'reaction',
    text: 'Markets drop 10% this week. What do you do?',
    options: [
      { value: 'sell', label: 'Sell before it gets worse' },
      { value: 'wait', label: 'Wait and see' },
      { value: 'buy', label: 'Buy more — good opportunity' },
    ],
  },
  {
    id: 'horizon',
    text: 'When might you need this money?',
    options: [
      { value: 'short', label: 'Within 1–2 years' },
      { value: 'medium', label: 'In 3–5 years' },
      { value: 'long', label: '5+ years from now' },
    ],
  },
  {
    id: 'check',
    text: 'How often do you want to check your portfolio?',
    options: [
      { value: 'daily', label: 'Daily — I like staying on top of things' },
      { value: 'weekly', label: 'Weekly or so' },
      { value: 'rarely', label: 'Rarely — set it and forget it' },
    ],
  },
]

export default function HabitsQuiz({ onNext }) {
  const [answers, setAnswers] = useState({})

  const allAnswered = QUESTIONS.every((q) => answers[q.id])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gs-navy">Quick habits check</h2>
        <p className="text-gs-gray mt-1 text-sm">No wrong answers — just helps us calibrate.</p>
      </div>

      <div className="flex flex-col gap-5">
        {QUESTIONS.map((q) => (
          <div key={q.id}>
            <p className="text-sm font-medium text-gs-navy mb-2">{q.text}</p>
            <div className="flex flex-col gap-2">
              {q.options.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer text-sm transition-colors ${
                    answers[q.id] === opt.value
                      ? 'border-gs-navy bg-gs-navy/5 text-gs-navy'
                      : 'border-gs-pale text-gs-grayMid hover:border-gs-blue'
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.value}
                    checked={answers[q.id] === opt.value}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))}
                    className="accent-gs-navy"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!allAnswered}
        className="w-full bg-gs-navy hover:bg-gs-deep disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
      >
        Done
      </button>
    </div>
  )
}
