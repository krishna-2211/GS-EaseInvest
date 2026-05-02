export default function DontPanicBanner({ message }) {
  if (!message) return null

  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{
        backgroundColor: '#e8f4fb',
        borderLeft: '3px solid #6B96C3',
      }}
    >
      <p className="font-bold text-gs-navy text-sm">No need to panic</p>
      <p className="text-gs-gray text-sm mt-0.5">{message}</p>
    </div>
  )
}
