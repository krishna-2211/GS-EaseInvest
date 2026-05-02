export default function Signup({ onNext }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gs-navy">Welcome to EaseInvest</h2>
        <p className="text-gs-gray mt-1 text-sm">Investing made simple — no jargon, no stress.</p>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-sm font-medium text-gs-navy mb-1">Name</label>
          <input
            type="text"
            placeholder="Your name"
            className="w-full border border-gs-pale rounded-lg px-4 py-2.5 text-sm text-gs-navy placeholder:text-gs-gray focus:outline-none focus:ring-2 focus:ring-gs-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gs-navy mb-1">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full border border-gs-pale rounded-lg px-4 py-2.5 text-sm text-gs-navy placeholder:text-gs-gray focus:outline-none focus:ring-2 focus:ring-gs-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gs-navy mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full border border-gs-pale rounded-lg px-4 py-2.5 text-sm text-gs-navy focus:outline-none focus:ring-2 focus:ring-gs-blue"
          />
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-gs-navy hover:bg-gs-deep text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
      >
        Create account
      </button>
    </div>
  )
}
