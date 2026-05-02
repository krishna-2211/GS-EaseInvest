export default function ProfileSetup({ onNext }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gs-navy">A bit about you</h2>
        <p className="text-gs-gray mt-1 text-sm">
          This helps us give you advice that actually fits your life.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-sm font-medium text-gs-navy mb-1">Monthly income (₹)</label>
          <input
            type="number"
            placeholder="e.g. 50000"
            className="w-full border border-gs-pale rounded-lg px-4 py-2.5 text-sm text-gs-navy placeholder:text-gs-gray focus:outline-none focus:ring-2 focus:ring-gs-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gs-navy mb-1">Age</label>
          <input
            type="number"
            placeholder="e.g. 28"
            className="w-full border border-gs-pale rounded-lg px-4 py-2.5 text-sm text-gs-navy placeholder:text-gs-gray focus:outline-none focus:ring-2 focus:ring-gs-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gs-navy mb-1">
            What's your main goal?
          </label>
          <select className="w-full border border-gs-pale rounded-lg px-4 py-2.5 text-sm text-gs-navy focus:outline-none focus:ring-2 focus:ring-gs-blue bg-white">
            <option value="">Choose one</option>
            <option value="emergency">Build an emergency fund</option>
            <option value="growth">Grow my savings over time</option>
            <option value="retirement">Save for retirement</option>
            <option value="home">Buy a home</option>
          </select>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-gs-navy hover:bg-gs-deep text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
      >
        Continue
      </button>
    </div>
  )
}
