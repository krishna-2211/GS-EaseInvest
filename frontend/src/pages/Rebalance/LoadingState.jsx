export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full animate-bounce"
            style={{ background: '#6B96C3', animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-sm italic" style={{ color: '#6B96C3' }}>
        Thinking about your question…
      </p>
    </div>
  )
}
