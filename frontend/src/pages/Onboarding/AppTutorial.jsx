import { useNavigate } from 'react-router-dom'

const FEATURES = [
  {
    icon: '📊',
    title: 'Health Score',
    desc: 'A single number that tells you how well your money is working for you.',
  },
  {
    icon: '💼',
    title: 'Portfolio',
    desc: 'See everything you own in one place — no spreadsheets needed.',
  },
  {
    icon: '⚖️',
    title: 'Rebalance',
    desc: 'Ask a question and get a plain suggestion on what to adjust.',
  },
  {
    icon: '📈',
    title: 'Invest',
    desc: 'Pick stocks or mutual funds with a simple explanation before you commit.',
  },
  {
    icon: '🌊',
    title: "Don't Panic",
    desc: 'When markets move, we remind you why staying calm usually wins.',
  },
  {
    icon: '🔄',
    title: 'User Switch',
    desc: 'Switch between accounts to see how different portfolios compare.',
  },
]

export default function AppTutorial() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gs-navy">Here's what you can do</h2>
        <p className="text-gs-gray mt-1 text-sm">Six features, all in plain English.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="border border-gs-pale/60 rounded-xl p-4 bg-gs-bg">
            <span className="text-2xl">{f.icon}</span>
            <p className="font-semibold text-gs-navy text-sm mt-2">{f.title}</p>
            <p className="text-gs-gray text-xs mt-1">{f.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="w-full bg-gs-navy hover:bg-gs-deep text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
      >
        Go to my dashboard
      </button>
    </div>
  )
}
