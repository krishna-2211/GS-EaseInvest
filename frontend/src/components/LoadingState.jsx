export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block w-2 h-2 rounded-full bg-gs-blue animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-gs-gray text-sm">Thinking about your question…</p>
    </div>
  )
}
