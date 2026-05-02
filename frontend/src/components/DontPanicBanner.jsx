export default function DontPanicBanner({ message }) {
  if (!message) return null

  return (
    <div className="rounded-xl bg-gs-pale/30 border border-gs-pale px-5 py-4 flex items-start gap-3">
      <span className="text-gs-blue text-lg mt-0.5">🌊</span>
      <div>
        <p className="font-semibold text-gs-navy text-sm">Don't Panic</p>
        <p className="text-gs-deep text-sm mt-0.5">{message}</p>
      </div>
    </div>
  )
}
